import fs from 'fs/promises'
import path from 'path'
import { fredClient, DateUtils } from '../lib/fred-client'
import { ALL_SERIES, TREASURY_YIELD_SERIES, INFLATION_SERIES, EMPLOYMENT_SERIES, COMMODITY_SERIES, CURRENCY_SERIES, FRED_CONFIG } from '../lib/fred-config'
import { interpolateMonthlyToDaily, calculateInflationRate, updateInterpolatedData } from '../lib/interpolation'
import type { DataMetadata, DataPoint } from './fetch-initial-data'

/**
 * Incremental data update script
 * Fetches only new data since the last update
 */
async function updateData(): Promise<{
  updated: boolean
  seriesUpdated: string[]
  newRecords: number
}> {
  console.log('🔄 Starting incremental data update...')
  
  let updated = false
  const seriesUpdated: string[] = []
  let totalNewRecords = 0

  try {
    // Read existing metadata
    const metadataPath = path.join(FRED_CONFIG.dataDir, 'metadata.json')
    let metadata: DataMetadata
    
    try {
      const metadataContent = await fs.readFile(metadataPath, 'utf-8')
      metadata = JSON.parse(metadataContent)
    } catch (error) {
      console.log('⚠️ No existing metadata found, performing full data fetch...')
      // If no metadata exists, fall back to initial data fetch
      const { fetchInitialData } = await import('./fetch-initial-data')
      await fetchInitialData()
      return { updated: true, seriesUpdated: ALL_SERIES.map(s => s.key), newRecords: 0 }
    }

    const today = DateUtils.getToday()
    
    // Collect treasury yield dates for CPI interpolation alignment
    console.log('📊 Collecting treasury yield dates for CPI alignment...')
    const treasuryDates = new Set<string>()
    
    for (const treasurySeries of TREASURY_YIELD_SERIES) {
      const treasuryInfo = metadata.seriesInfo[treasurySeries.key]
      if (treasuryInfo) {
        try {
          const dataPath = path.join(FRED_CONFIG.dataDir, `${treasurySeries.key}.json`)
          const existingContent = await fs.readFile(dataPath, 'utf-8')
          const existingData: DataPoint[] = JSON.parse(existingContent)
          existingData.forEach(point => treasuryDates.add(point.date))
        } catch (error) {
          console.warn(`⚠️ Could not read ${treasurySeries.key} for date alignment`)
        }
      }
    }
    
    const sortedTreasuryDates = Array.from(treasuryDates).sort()
    console.log(`📅 Using ${sortedTreasuryDates.length} treasury dates for CPI alignment`)
    
    for (const series of ALL_SERIES) {
      try {
        const seriesInfo = metadata.seriesInfo[series.key]
        
        if (!seriesInfo) {
          console.log(`⚠️ No metadata for ${series.name}, skipping...`)
          continue
        }

        const lastDataDate = seriesInfo.latestDate
        const nextDate = DateUtils.addDays(lastDataDate, 1)
        
        // Check if we need to update (only if there might be new data)
        if (!DateUtils.isAfter(today, lastDataDate)) {
          console.log(`✅ ${series.name} is up to date (latest: ${lastDataDate})`)
          continue
        }

        console.log(`📊 Checking ${series.name} for data after ${lastDataDate}...`)
        
        // Fetch new data
        const newData = await fredClient.fetchSeries(
          series.fredSeriesId,
          nextDate,
          today
        )

        if (newData.length === 0) {
          console.log(`📅 No new data available for ${series.name}`)
          continue
        }

        console.log(`📈 Found ${newData.length} new records for ${series.name}`)

        // Transform new data
        let transformedNewData: DataPoint[] = newData.map(point => ({
          date: point.date,
          value: typeof point.value === 'string' ? parseFloat(point.value) : point.value
        }))

        // Skip yield curve spread - it's calculated separately
        if (series.key === 'yield_curve_spread') {
          continue
        }

        // Handle inflation data specially
        if (series.category === 'inflation') {
          console.log(`🔄 Processing new inflation data for ${series.name}...`)
          
          // Read existing raw monthly data
          const rawDataPath = path.join(FRED_CONFIG.dataDir, `${series.key}_monthly.json`)
          let existingRawData: DataPoint[] = []
          
          try {
            const rawContent = await fs.readFile(rawDataPath, 'utf-8')
            existingRawData = JSON.parse(rawContent)
          } catch (error) {
            console.log(`⚠️ Could not read existing raw monthly data for ${series.name}`)
          }

          // Merge with existing raw data
          const allRawData = [...existingRawData, ...transformedNewData]
          const uniqueRawData = allRawData.reduce((acc, current) => {
            const existingIndex = acc.findIndex(item => item.date === current.date)
            if (existingIndex >= 0) {
              acc[existingIndex] = current
            } else {
              acc.push(current)
            }
            return acc
          }, [] as DataPoint[])

          // Sort by date
          uniqueRawData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

          // Save updated raw monthly data
          await fs.writeFile(rawDataPath, JSON.stringify(uniqueRawData, null, 2))

          // Calculate inflation rate from all CPI data
          const inflationRateData = calculateInflationRate(uniqueRawData)
          
          // Re-interpolate to daily business days using treasury dates
          if (series.requiresInterpolation) {
            transformedNewData = interpolateMonthlyToDaily(
              inflationRateData,
              FRED_CONFIG.defaultStartDate,
              today,
              sortedTreasuryDates
            )
            console.log(`📈 Re-interpolated to match treasury dates: ${transformedNewData.length} total records`)
            
            // For inflation data, we replace the entire interpolated dataset
            // rather than appending, since interpolation affects all dates
            const dataPath = path.join(FRED_CONFIG.dataDir, `${series.key}.json`)
            await fs.writeFile(dataPath, JSON.stringify(transformedNewData, null, 2))
            
            // Update metadata
            metadata.seriesInfo[series.key] = {
              ...seriesInfo,
              latestDate: transformedNewData[transformedNewData.length - 1].date,
              recordCount: transformedNewData.length
            }

            seriesUpdated.push(series.key)
            totalNewRecords += newData.length // Count original new monthly records
            updated = true

            console.log(`✅ ${series.name}: Re-interpolated with ${newData.length} new monthly records`)
            console.log(`   Latest data: ${metadata.seriesInfo[series.key].latestDate}`)
            console.log(`   Total interpolated records: ${metadata.seriesInfo[series.key].recordCount}`)
            
            continue // Skip the normal processing below
          } else {
            transformedNewData = inflationRateData
          }
        }

        // Handle employment data specially (similar to inflation)
        if (series.category === 'employment') {
          console.log(`🔄 Processing new employment data for ${series.name}...`)
          
          // Read existing raw monthly data
          const rawDataPath = path.join(FRED_CONFIG.dataDir, `${series.key}_monthly.json`)
          let existingRawData: DataPoint[] = []
          
          try {
            const rawContent = await fs.readFile(rawDataPath, 'utf-8')
            existingRawData = JSON.parse(rawContent)
          } catch (error) {
            console.log(`⚠️ Could not read existing raw monthly data for ${series.name}`)
          }

          // Merge with existing raw data
          const allRawData = [...existingRawData, ...transformedNewData]
          const uniqueRawData = allRawData.reduce((acc, current) => {
            const existingIndex = acc.findIndex(item => item.date === current.date)
            if (existingIndex >= 0) {
              acc[existingIndex] = current
            } else {
              acc.push(current)
            }
            return acc
          }, [] as DataPoint[])

          // Sort by date
          uniqueRawData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

          // Save updated raw monthly data
          await fs.writeFile(rawDataPath, JSON.stringify(uniqueRawData, null, 2))
          
          // Re-interpolate to daily business days using treasury dates
          if (series.requiresInterpolation) {
            transformedNewData = interpolateMonthlyToDaily(
              uniqueRawData,
              FRED_CONFIG.defaultStartDate,
              today,
              sortedTreasuryDates
            )
            console.log(`📈 Re-interpolated to match treasury dates: ${transformedNewData.length} total records`)
            
            // Replace the entire interpolated dataset
            const dataPath = path.join(FRED_CONFIG.dataDir, `${series.key}.json`)
            await fs.writeFile(dataPath, JSON.stringify(transformedNewData, null, 2))
            
            // Update metadata
            metadata.seriesInfo[series.key] = {
              ...seriesInfo,
              latestDate: transformedNewData[transformedNewData.length - 1].date,
              recordCount: transformedNewData.length
            }

            seriesUpdated.push(series.key)
            totalNewRecords += newData.length
            updated = true

            console.log(`✅ ${series.name}: Re-interpolated with ${newData.length} new monthly records`)
            console.log(`   Latest data: ${metadata.seriesInfo[series.key].latestDate}`)
            console.log(`   Total interpolated records: ${metadata.seriesInfo[series.key].recordCount}`)
            
            continue // Skip the normal processing below
          }
        }

        // Normal processing for treasury yields and non-interpolated data
        // Read existing data
        const dataPath = path.join(FRED_CONFIG.dataDir, `${series.key}.json`)
        let existingData: DataPoint[] = []
        
        try {
          const existingContent = await fs.readFile(dataPath, 'utf-8')
          existingData = JSON.parse(existingContent)
        } catch (error) {
          console.log(`⚠️ Could not read existing data for ${series.name}, starting fresh...`)
        }

        // Remove duplicates and merge
        const existingDates = new Set(existingData.map(d => d.date))
        const uniqueNewData = transformedNewData.filter(d => !existingDates.has(d.date))
        
        if (uniqueNewData.length === 0) {
          console.log(`📅 No new unique data for ${series.name}`)
          continue
        }

        const updatedData = [...existingData, ...uniqueNewData]
        
        // Sort by date
        updatedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

        // Save updated data
        await fs.writeFile(dataPath, JSON.stringify(updatedData, null, 2))

        // Update metadata
        metadata.seriesInfo[series.key] = {
          ...seriesInfo,
          latestDate: updatedData[updatedData.length - 1].date,
          recordCount: updatedData.length
        }

        seriesUpdated.push(series.key)
        totalNewRecords += uniqueNewData.length
        updated = true

        console.log(`✅ ${series.name}: Added ${uniqueNewData.length} new records`)
        console.log(`   Latest data: ${metadata.seriesInfo[series.key].latestDate}`)
        console.log(`   Total records: ${metadata.seriesInfo[series.key].recordCount}`)

      } catch (error) {
        console.error(`❌ Error updating ${series.name}:`, error)
        // Continue with other series even if one fails
      }
    }

    // Calculate yield curve spread (10Y - 2Y) if either treasury series was updated
    const treasury10yUpdated = seriesUpdated.includes('treasury_10y')
    const treasury2yUpdated = seriesUpdated.includes('treasury_2y')
    
    if (treasury10yUpdated || treasury2yUpdated) {
      console.log('📊 Recalculating 10Y-2Y yield curve spread...')
      
      try {
        // Read current treasury data
        const treasury10yPath = path.join(FRED_CONFIG.dataDir, 'treasury_10y.json')
        const treasury2yPath = path.join(FRED_CONFIG.dataDir, 'treasury_2y.json')
        
        const treasury10yContent = await fs.readFile(treasury10yPath, 'utf-8')
        const treasury2yContent = await fs.readFile(treasury2yPath, 'utf-8')
        
        const treasury10y: DataPoint[] = JSON.parse(treasury10yContent)
        const treasury2y: DataPoint[] = JSON.parse(treasury2yContent)
        
        // Create a map for efficient lookup
        const treasury2yMap = new Map(treasury2y.map(d => [d.date, d.value]))
        
        const yieldSpreadData: DataPoint[] = treasury10y
          .map(point10y => {
            const value2y = treasury2yMap.get(point10y.date)
            if (value2y !== undefined) {
              return {
                date: point10y.date,
                value: point10y.value - value2y
              }
            }
            return null
          })
          .filter((point): point is DataPoint => point !== null)
        
        // Save yield curve spread data
        const spreadFilepath = path.join(FRED_CONFIG.dataDir, 'yield_curve_spread.json')
        await fs.writeFile(spreadFilepath, JSON.stringify(yieldSpreadData, null, 2))
        
        // Update metadata
        metadata.seriesInfo['yield_curve_spread'] = {
          latestDate: yieldSpreadData[yieldSpreadData.length - 1]?.date || FRED_CONFIG.defaultStartDate,
          recordCount: yieldSpreadData.length,
          fredSeriesId: 'T10Y2Y (calculated)'
        }
        
        if (!seriesUpdated.includes('yield_curve_spread')) {
          seriesUpdated.push('yield_curve_spread')
        }
        updated = true
        
        console.log(`✅ 10Y-2Y Yield Spread: ${yieldSpreadData.length} records calculated`)
        console.log(`   Latest data: ${metadata.seriesInfo['yield_curve_spread'].latestDate}`)
        
      } catch (error) {
        console.warn('⚠️  Could not calculate yield curve spread:', error)
      }
    }

    if (updated) {
      // Update metadata timestamp
      metadata.lastUpdated = today
      
      // Save updated metadata
      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2))
      
      console.log('🎉 Data update completed successfully!')
      console.log(`📊 Series updated: ${seriesUpdated.join(', ')}`)
      console.log(`📈 Total new records: ${totalNewRecords}`)
    } else {
      console.log('📅 All data is up to date, no changes needed')
    }

    return { updated, seriesUpdated, newRecords: totalNewRecords }

  } catch (error) {
    console.error('💥 Error during data update:', error)
    throw error
  }
}

/**
 * Check if data needs updating (more than 1 day old)
 */
async function needsUpdate(): Promise<boolean> {
  try {
    const metadataPath = path.join(FRED_CONFIG.dataDir, 'metadata.json')
    const metadataContent = await fs.readFile(metadataPath, 'utf-8')
    const metadata: DataMetadata = JSON.parse(metadataContent)
    
    const lastUpdated = new Date(metadata.lastUpdated)
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)
    
    return lastUpdated < oneDayAgo
  } catch (error) {
    // If we can't read metadata, assume we need to update
    return true
  }
}

/**
 * Get data freshness information
 */
async function getDataFreshness(): Promise<{
  lastUpdated: string
  isStale: boolean
  seriesInfo: DataMetadata['seriesInfo']
} | null> {
  try {
    const metadataPath = path.join(FRED_CONFIG.dataDir, 'metadata.json')
    const metadataContent = await fs.readFile(metadataPath, 'utf-8')
    const metadata: DataMetadata = JSON.parse(metadataContent)
    
    const lastUpdated = new Date(metadata.lastUpdated)
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)
    
    return {
      lastUpdated: metadata.lastUpdated,
      isStale: lastUpdated < oneDayAgo,
      seriesInfo: metadata.seriesInfo
    }
  } catch (error) {
    return null
  }
}

// Main execution
async function main() {
  try {
    if (!process.env.FRED_API_KEY) {
      console.error('❌ FRED_API_KEY environment variable not set')
      process.exit(1)
    }

    const result = await updateData()
    
    if (result.updated) {
      console.log(`\n📊 Update Summary:`)
      console.log(`   Series updated: ${result.seriesUpdated.length}`)
      console.log(`   New records: ${result.newRecords}`)
      console.log(`   Updated series: ${result.seriesUpdated.join(', ')}`)
    }
    
  } catch (error) {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

export { updateData, needsUpdate, getDataFreshness }