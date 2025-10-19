import fs from 'fs/promises'
import path from 'path'
import type { DataMetadata } from './fetch-initial-data'
import { FRED_CONFIG } from '../lib/fred-config'
import { DateUtils } from '../lib/fred-client'

/**
 * Data Synchronization Report
 */
interface SyncReport {
  isFullySynced: boolean
  commonDate: string
  newestDate: string
  oldestDate: string
  daysDrift: number
  staleSeries: Array<{
    key: string
    latestDate: string
    daysOld: number
    status: 'current' | 'delayed' | 'stale'
  }>
  seriesDetails: Array<{
    key: string
    latestDate: string
    recordCount: number
    daysOld: number
  }>
}

/**
 * Calculate days between two dates
 */
function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const diffTime = Math.abs(d2.getTime() - d1.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

/**
 * Get staleness status based on days old
 */
function getStaleStatus(daysOld: number): 'current' | 'delayed' | 'stale' {
  if (daysOld <= 1) return 'current'
  if (daysOld <= 3) return 'delayed'
  return 'stale'
}

/**
 * Check synchronization status of all data series
 */
export async function checkSynchronization(): Promise<SyncReport | null> {
  try {
    const metadataPath = path.join(FRED_CONFIG.dataDir, 'metadata.json')
    const metadataContent = await fs.readFile(metadataPath, 'utf-8')
    const metadata: DataMetadata = JSON.parse(metadataContent)
    
    const today = DateUtils.getToday()
    const seriesInfo = metadata.seriesInfo
    
    // Get all latest dates
    const latestDates = Object.entries(seriesInfo).map(([key, info]) => ({
      key,
      latestDate: info.latestDate,
      recordCount: info.recordCount
    }))
    
    // Find newest and oldest dates
    const sortedDates = latestDates.map(s => s.latestDate).sort()
    const oldestDate = sortedDates[0]
    const newestDate = sortedDates[sortedDates.length - 1]
    const commonDate = oldestDate // Common date is the oldest (all series have data up to this point)
    
    // Calculate drift
    const daysDrift = daysBetween(oldestDate, newestDate)
    const isFullySynced = daysDrift === 0
    
    // Calculate staleness for each series
    const seriesDetails = latestDates.map(series => {
      const daysOld = daysBetween(series.latestDate, today)
      return {
        ...series,
        daysOld
      }
    })
    
    // Find stale series (3+ days old or significantly behind newest)
    const staleSeries = seriesDetails
      .map(series => ({
        key: series.key,
        latestDate: series.latestDate,
        daysOld: daysBetween(series.latestDate, newestDate),
        status: getStaleStatus(daysBetween(series.latestDate, newestDate))
      }))
      .filter(series => series.daysOld >= 3)
      .sort((a, b) => b.daysOld - a.daysOld)
    
    return {
      isFullySynced,
      commonDate,
      newestDate,
      oldestDate,
      daysDrift,
      staleSeries,
      seriesDetails: seriesDetails.sort((a, b) => a.latestDate.localeCompare(b.latestDate))
    }
  } catch (error) {
    console.error('Error checking synchronization:', error)
    return null
  }
}

/**
 * Print synchronization report
 */
export async function printSyncReport(): Promise<void> {
  console.log('\n📊 Data Synchronization Report\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  const report = await checkSynchronization()
  
  if (!report) {
    console.log('❌ Unable to generate synchronization report\n')
    return
  }
  
  const today = DateUtils.getToday()
  
  // Overall status
  console.log('📈 Overall Status:')
  if (report.isFullySynced) {
    console.log('   🟢 Fully Synchronized - All series have same latest date')
  } else if (report.daysDrift <= 3) {
    console.log('   🟡 Partial Sync - Some series are slightly behind')
  } else {
    console.log('   🔴 Out of Sync - Significant drift between series')
  }
  console.log()
  
  // Date range
  console.log('📅 Date Range:')
  console.log(`   Newest data: ${report.newestDate}`)
  console.log(`   Oldest data: ${report.oldestDate}`)
  console.log(`   Common date: ${report.commonDate} (all series have data up to here)`)
  console.log(`   Today:       ${today}`)
  console.log(`   Drift:       ${report.daysDrift} day(s) between oldest and newest\n`)
  
  // Series details
  console.log('📋 Series Status (sorted by date):')
  console.log()
  
  const statusIcon = (date: string) => {
    const daysOld = daysBetween(date, report.newestDate)
    if (daysOld === 0) return '🟢'
    if (daysOld <= 3) return '🟡'
    return '🔴'
  }
  
  report.seriesDetails.forEach(series => {
    const daysOld = daysBetween(series.latestDate, report.newestDate)
    const age = daysOld === 0 ? 'current' : `${daysOld}d behind`
    console.log(`   ${statusIcon(series.latestDate)} ${series.key.padEnd(25)} ${series.latestDate}  (${age})`)
  })
  console.log()
  
  // Stale series warning
  if (report.staleSeries.length > 0) {
    console.log('⚠️  Stale Series (3+ days behind):')
    report.staleSeries.forEach(series => {
      console.log(`   🔴 ${series.key}: ${series.daysOld} day(s) old (${series.latestDate})`)
    })
    console.log()
  }
  
  // Recommendations
  console.log('💡 Recommendations:')
  if (report.isFullySynced) {
    console.log('   ✅ Data is fully synchronized. All series are up to date.')
  } else if (report.staleSeries.length > 0) {
    console.log('   ⚠️  Some series are significantly behind. Consider:')
    console.log('      1. Running update script to fetch latest data')
    console.log('      2. Checking FRED API for data availability')
    console.log('      3. Verifying series are still actively published')
  } else {
    console.log('   📝 Minor drift detected. This is normal due to different')
    console.log('      update schedules (weekends, holidays, release timing).')
  }
  console.log()
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

/**
 * Get synchronization status for UI display
 */
export function getSyncStatusBadge(report: SyncReport): {
  status: 'synced' | 'partial' | 'out-of-sync'
  color: string
  icon: string
  message: string
} {
  if (report.isFullySynced) {
    return {
      status: 'synced',
      color: 'green',
      icon: '🟢',
      message: 'All series synchronized'
    }
  } else if (report.daysDrift <= 3) {
    return {
      status: 'partial',
      color: 'yellow',
      icon: '🟡',
      message: `${report.daysDrift} day drift`
    }
  } else {
    return {
      status: 'out-of-sync',
      color: 'red',
      icon: '🔴',
      message: `${report.daysDrift} days out of sync`
    }
  }
}

/**
 * Main execution - print report
 */
async function main() {
  await printSyncReport()
}

// Run if called directly
if (require.main === module) {
  main()
}
