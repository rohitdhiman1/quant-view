/**
 * Client-side data refresh utilities
 */

export interface DataFreshnessInfo {
  lastUpdated: string
  isStale: boolean
  needsUpdate: boolean
  seriesInfo: {
    [key: string]: {
      latestDate: string
      recordCount: number
      fredSeriesId: string
    }
  }
}

export interface UpdateResult {
  success: boolean
  updated: boolean
  seriesUpdated: string[]
  newRecords: number
  timestamp: string
  error?: string
}

/**
 * Check if data needs refreshing
 * In static export mode, this will always return null
 */
export async function checkDataFreshness(): Promise<DataFreshnessInfo | null> {
  try {
    // In static export mode, API routes are not available
    // This would need to be implemented differently for production
    const response = await fetch('/api/data/update', {
      method: 'GET',
      cache: 'no-cache'
    })
    
    if (!response.ok) {
      // For static export, API routes won't exist
      console.log('API route not available in static export mode')
      return null
    }
    
    return await response.json()
  } catch (error) {
    console.log('Data freshness check not available in static export mode')
    return null
  }
}

/**
 * Trigger data update
 * In static export mode, this will show instructions for CLI usage
 */
export async function triggerDataUpdate(): Promise<UpdateResult> {
  try {
    // In static export mode, updates must be done via CLI
    return {
      success: false,
      updated: false,
      seriesUpdated: [],
      newRecords: 0,
      timestamp: new Date().toISOString(),
      error: 'Static export mode: Use CLI commands "pnpm run fetch-data" or "pnpm run update-data" to update data, then rebuild the site.'
    }
  } catch (error) {
    return {
      success: false,
      updated: false,
      seriesUpdated: [],
      newRecords: 0,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Auto-refresh hook for data updates
 */
export function useAutoRefresh(
  intervalMs: number = 60000, // 1 minute default
  onUpdate?: (result: UpdateResult) => void
) {
  if (typeof window === 'undefined') return // Server-side guard
  
  const checkAndUpdate = async () => {
    try {
      const freshness = await checkDataFreshness()
      
      if (freshness?.needsUpdate) {
        console.log('🔄 Data is stale, triggering update...')
        const result = await triggerDataUpdate()
        
        if (result.success && result.updated) {
          console.log(`✅ Data updated: ${result.seriesUpdated.join(', ')}`)
          onUpdate?.(result)
        }
      }
    } catch (error) {
      console.error('Auto-refresh error:', error)
    }
  }
  
  // Check immediately on mount
  setTimeout(checkAndUpdate, 1000)
  
  // Set up interval
  const interval = setInterval(checkAndUpdate, intervalMs)
  
  // Cleanup function
  return () => clearInterval(interval)
}

/**
 * Format data freshness for display
 */
export function formatDataAge(lastUpdated: string): string {
  const now = new Date()
  const updated = new Date(lastUpdated)
  const diffMs = now.getTime() - updated.getTime()
  
  const minutes = Math.floor(diffMs / (1000 * 60))
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) {
    return `${days} day${days !== 1 ? 's' : ''} ago`
  } else if (hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`
  } else if (minutes > 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
  } else {
    return 'Just updated'
  }
}

/**
 * Get update status indicator
 */
export function getUpdateStatus(isStale: boolean, needsUpdate: boolean): {
  status: 'fresh' | 'stale' | 'outdated'
  color: string
  icon: string
  message: string
} {
  if (!isStale && !needsUpdate) {
    return {
      status: 'fresh',
      color: 'text-green-600',
      icon: '🟢',
      message: 'Data is current'
    }
  } else if (isStale && !needsUpdate) {
    return {
      status: 'stale',
      color: 'text-yellow-600',
      icon: '🟡',
      message: 'Data is slightly outdated'
    }
  } else {
    return {
      status: 'outdated',
      color: 'text-red-600',
      icon: '🔴',
      message: 'Data needs updating'
    }
  }
}