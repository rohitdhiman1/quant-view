import fs from 'fs/promises'
import path from 'path'
import { fredClient, DateUtils } from '../lib/fred-client'
import { TREASURY_YIELD_SERIES, FRED_CONFIG } from '../lib/fred-config'
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
      return { updated: true, seriesUpdated: TREASURY_YIELD_SERIES.map(s => s.key), newRecords: 0 }
    }

    const today = DateUtils.getToday()
    
    for (const series of TREASURY_YIELD_SERIES) {
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

        // Read existing data
        const dataPath = path.join(FRED_CONFIG.dataDir, `${series.key}.json`)
        let existingData: DataPoint[] = []
        
        try {
          const existingContent = await fs.readFile(dataPath, 'utf-8')
          existingData = JSON.parse(existingContent)
        } catch (error) {
          console.log(`⚠️ Could not read existing data for ${series.name}, starting fresh...`)
        }

        // Transform and merge new data
        const transformedNewData: DataPoint[] = newData.map(point => ({
          date: point.date,
          value: typeof point.value === 'string' ? parseFloat(point.value) : point.value
        }))

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