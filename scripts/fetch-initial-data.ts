import fs from 'fs/promises'
import path from 'path'
import { fredClient, DateUtils } from '../lib/fred-client'
import { ALL_SERIES, TREASURY_YIELD_SERIES, INFLATION_SERIES, EMPLOYMENT_SERIES, COMMODITY_SERIES, CURRENCY_SERIES, FRED_CONFIG } from '../lib/fred-config'
import { interpolateMonthlyToDaily, calculateInflationRate } from '../lib/interpolation'

/**
 * Metadata interface for tracking data freshness
 */
interface DataMetadata {
  lastUpdated: string
  seriesInfo: {
    [key: string]: {
      latestDate: string
      recordCount: number
      fredSeriesId: string
    }
  }
}

/**
 * Transformed data point for our dashboard
 */
interface DataPoint {
  date: string
  value: number
}

/**
 * Initial data fetching script
 * Fetches all treasury yield and CPI data from 2016 to present
 */
async function fetchInitialData() {
  console.log('🚀 Starting initial FRED data fetch...')
  console.log(`📅 Date range: ${FRED_CONFIG.defaultStartDate} to ${DateUtils.getToday()}`)
  
  const metadata: DataMetadata = {
    lastUpdated: DateUtils.getToday(),
    seriesInfo: {}
  }

  // Ensure data directory exists
  await fs.mkdir(FRED_CONFIG.dataDir, { recursive: true })

  // First, collect all treasury yield dates for alignment
  console.log('📊 Collecting treasury yield dates for CPI interpolation...')
  const treasuryDates = new Set<string>()
  
  for (const series of TREASURY_YIELD_SERIES) {
    try {
      const rawData = await fredClient.fetchSeries(
        series.fredSeriesId,
        FRED_CONFIG.defaultStartDate,
        DateUtils.getToday()
      )
      rawData.forEach(point => treasuryDates.add(point.date))
    } catch (error) {
      console.error(`❌ Error fetching ${series.name} for date collection:`, error)
    }
  }
  
  const sortedTreasuryDates = Array.from(treasuryDates).sort()
  console.log(`📅 Collected ${sortedTreasuryDates.length} treasury yield dates for alignment`)

  // Store treasury data for yield curve calculation
  const treasuryData: { [key: string]: DataPoint[] } = {}

  // Process all series except yield curve spread (calculated separately)
  const seriesToFetch = ALL_SERIES.filter(s => s.key !== 'yield_curve_spread')
  
  for (const series of seriesToFetch) {
    try {
      console.log(`📊 Fetching ${series.name} (${series.fredSeriesId})...`)
      
      const rawData = await fredClient.fetchSeries(
        series.fredSeriesId,
        FRED_CONFIG.defaultStartDate,
        DateUtils.getToday()
      )

      // Transform raw data to our format
      let transformedData: DataPoint[] = rawData.map(point => ({
        date: point.date,
        value: typeof point.value === 'string' ? parseFloat(point.value) : point.value
      }))

      // Sort by date
      transformedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      // Handle different data types specially
      if (series.category === 'inflation') {
        console.log(`🔄 Processing inflation data for ${series.name}...`)
        
        // Calculate inflation rate from CPI index values
        const inflationRateData = calculateInflationRate(transformedData)
        
        // Save raw monthly CPI data for reference
        const rawFilename = `${series.key}_monthly.json`
        const rawFilepath = path.join(FRED_CONFIG.dataDir, rawFilename)
        await fs.writeFile(rawFilepath, JSON.stringify(transformedData, null, 2))
        console.log(`💾 Raw monthly ${series.name}: ${transformedData.length} records saved to ${rawFilename}`)
        
        // Interpolate inflation rate to daily business days using treasury dates
        if (series.requiresInterpolation) {
          transformedData = interpolateMonthlyToDaily(
            inflationRateData,
            FRED_CONFIG.defaultStartDate,
            DateUtils.getToday(),
            sortedTreasuryDates
          )
          console.log(`📈 Interpolated to match treasury dates: ${transformedData.length} records`)
        } else {
          transformedData = inflationRateData
        }
      } else if (series.category === 'employment') {
        console.log(`🔄 Processing employment data for ${series.name}...`)
        
        // Save raw monthly employment data for reference
        const rawFilename = `${series.key}_monthly.json`
        const rawFilepath = path.join(FRED_CONFIG.dataDir, rawFilename)
        await fs.writeFile(rawFilepath, JSON.stringify(transformedData, null, 2))
        console.log(`💾 Raw monthly ${series.name}: ${transformedData.length} records saved to ${rawFilename}`)
        
        // Interpolate monthly employment data to daily using treasury dates
        if (series.requiresInterpolation) {
          transformedData = interpolateMonthlyToDaily(
            transformedData,
            FRED_CONFIG.defaultStartDate,
            DateUtils.getToday(),
            sortedTreasuryDates
          )
          console.log(`📈 Interpolated to match treasury dates: ${transformedData.length} records`)
        }
      }

      // Store treasury data for yield curve calculation
      if (series.category === 'yields') {
        treasuryData[series.key] = transformedData
      }

      // Save processed data to file
      const filename = `${series.key}.json`
      const filepath = path.join(FRED_CONFIG.dataDir, filename)
      
      await fs.writeFile(filepath, JSON.stringify(transformedData, null, 2))
      
      // Update metadata
      metadata.seriesInfo[series.key] = {
        latestDate: transformedData[transformedData.length - 1]?.date || FRED_CONFIG.defaultStartDate,
        recordCount: transformedData.length,
        fredSeriesId: series.fredSeriesId
      }

      console.log(`✅ ${series.name}: ${transformedData.length} records saved to ${filename}`)
      console.log(`   Latest data: ${metadata.seriesInfo[series.key].latestDate}`)
      
    } catch (error) {
      console.error(`❌ Error fetching ${series.name}:`, error)
      process.exit(1)
    }
  }

  // Calculate yield curve spread (10Y - 2Y)
  console.log('📊 Calculating 10Y-2Y yield curve spread...')
  const treasury10y = treasuryData['treasury_10y'] || []
  const treasury2y = treasuryData['treasury_2y'] || []
  
  if (treasury10y.length > 0 && treasury2y.length > 0) {
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
    const spreadFilename = 'yield_curve_spread.json'
    const spreadFilepath = path.join(FRED_CONFIG.dataDir, spreadFilename)
    await fs.writeFile(spreadFilepath, JSON.stringify(yieldSpreadData, null, 2))
    
    // Update metadata
    metadata.seriesInfo['yield_curve_spread'] = {
      latestDate: yieldSpreadData[yieldSpreadData.length - 1]?.date || FRED_CONFIG.defaultStartDate,
      recordCount: yieldSpreadData.length,
      fredSeriesId: 'T10Y2Y (calculated)'
    }
    
    console.log(`✅ 10Y-2Y Yield Spread: ${yieldSpreadData.length} records saved to ${spreadFilename}`)
    console.log(`   Latest data: ${metadata.seriesInfo['yield_curve_spread'].latestDate}`)
  } else {
    console.warn('⚠️  Could not calculate yield curve spread - missing 10Y or 2Y treasury data')
  }

  // Save metadata
  await fs.writeFile(
    path.join(FRED_CONFIG.dataDir, 'metadata.json'),
    JSON.stringify(metadata, null, 2)
  )

  console.log('🎉 Initial data fetch completed successfully!')
  console.log(`📁 Data saved to: ${FRED_CONFIG.dataDir}`)
  console.log(`📋 Metadata saved to: ${path.join(FRED_CONFIG.dataDir, 'metadata.json')}`)
}

/**
 * Backup existing data before overwriting
 */
async function backupExistingData() {
  const backupDir = path.join(FRED_CONFIG.dataDir, 'backup')
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupPath = path.join(backupDir, timestamp)

  try {
    await fs.mkdir(backupPath, { recursive: true })
    
    // Copy existing JSON files
    const files = await fs.readdir(FRED_CONFIG.dataDir)
    const jsonFiles = files.filter(file => file.endsWith('.json'))
    
    for (const file of jsonFiles) {
      const srcPath = path.join(FRED_CONFIG.dataDir, file)
      const destPath = path.join(backupPath, file)
      await fs.copyFile(srcPath, destPath)
    }
    
    console.log(`📦 Existing data backed up to: ${backupPath}`)
  } catch (error) {
    console.log('📝 No existing data to backup or backup failed:', error instanceof Error ? error.message : 'Unknown error')
  }
}

// Main execution
async function main() {
  try {
    // Check if API key is configured
    if (!process.env.FRED_API_KEY) {
      console.error('❌ FRED_API_KEY environment variable not set')
      console.log('Please add your FRED API key to .env.local:')
      console.log('FRED_API_KEY=your_api_key_here')
      process.exit(1)
    }

    await backupExistingData()
    await fetchInitialData()
    
  } catch (error) {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

export { fetchInitialData }
export type { DataMetadata, DataPoint }