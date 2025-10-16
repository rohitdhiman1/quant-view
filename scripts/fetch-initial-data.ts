import fs from 'fs/promises'
import path from 'path'
import { fredClient, DateUtils } from '../lib/fred-client'
import { TREASURY_YIELD_SERIES, FRED_CONFIG } from '../lib/fred-config'

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
 * Fetches all treasury yield data from 2016 to present
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

  for (const series of TREASURY_YIELD_SERIES) {
    try {
      console.log(`📊 Fetching ${series.name} (${series.fredSeriesId})...`)
      
      const rawData = await fredClient.fetchSeries(
        series.fredSeriesId,
        FRED_CONFIG.defaultStartDate,
        DateUtils.getToday()
      )

      // Transform data to our format
      const transformedData: DataPoint[] = rawData.map(point => ({
        date: point.date,
        value: typeof point.value === 'string' ? parseFloat(point.value) : point.value
      }))

      // Sort by date
      transformedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      // Save to file
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