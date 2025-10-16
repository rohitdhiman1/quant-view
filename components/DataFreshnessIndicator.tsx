'use client'

import React, { useState, useEffect } from 'react'
import { 
  checkDataFreshness, 
  triggerDataUpdate, 
  formatDataAge, 
  getUpdateStatus,
  type DataFreshnessInfo,
  type UpdateResult
} from '@/lib/data-refresh'

interface DataFreshnessIndicatorProps {
  onDataUpdated?: () => void
}

export default function DataFreshnessIndicator({ onDataUpdated }: DataFreshnessIndicatorProps) {
  const [freshness, setFreshness] = useState<DataFreshnessInfo | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [lastUpdateResult, setLastUpdateResult] = useState<UpdateResult | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  // Check data freshness on mount and periodically
  useEffect(() => {
    const checkFreshness = async () => {
      const info = await checkDataFreshness()
      setFreshness(info)
    }

    checkFreshness()
    
    // Check every 5 minutes
    const interval = setInterval(checkFreshness, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  const handleUpdateData = async () => {
    if (isUpdating) return
    
    setIsUpdating(true)
    setLastUpdateResult(null)
    
    try {
      const result = await triggerDataUpdate()
      setLastUpdateResult(result)
      
      if (result.success) {
        // Refresh freshness info
        const info = await checkDataFreshness()
        setFreshness(info)
        
        if (result.updated) {
          onDataUpdated?.()
        }
      }
    } catch (error) {
      console.error('Update failed:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  if (!freshness) {
    return (
      <div className="flex items-center space-x-2 text-gray-500 text-sm">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
        <span>Checking data status...</span>
      </div>
    )
  }

  const status = getUpdateStatus(freshness.isStale, freshness.needsUpdate)
  const age = formatDataAge(freshness.lastUpdated)

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{status.icon}</span>
          <div>
            <h3 className="font-medium text-gray-900">Data Status</h3>
            <p className={`text-sm ${status.color}`}>{status.message}</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg 
            className={`w-5 h-5 transform transition-transform ${showDetails ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">
          Last updated: {age}
        </span>
        
        <button
          onClick={handleUpdateData}
          disabled={isUpdating || (!freshness.needsUpdate && !freshness.isStale)}
          className={`
            px-3 py-1.5 text-sm font-medium rounded-md transition-colors
            ${isUpdating 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : freshness.needsUpdate || freshness.isStale
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                : 'bg-gray-100 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {isUpdating ? (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              <span>Updating...</span>
            </div>
          ) : (
            'Update Data'
          )}
        </button>
      </div>

      {/* Details */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h4 className="font-medium text-gray-900 mb-2">Series Status</h4>
          <div className="space-y-2">
            {Object.entries(freshness.seriesInfo).map(([key, info]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-gray-600 capitalize">
                  {key.replace('_', ' ').replace('treasury', 'Treasury')}
                </span>
                <span className="text-gray-900 font-mono">
                  {info.latestDate} ({info.recordCount} records)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Update Result */}
      {lastUpdateResult && (
        <div className={`
          mt-4 p-3 rounded-md text-sm
          ${lastUpdateResult.success 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
          }
        `}>
          {lastUpdateResult.success ? (
            lastUpdateResult.updated ? (
              <div>
                <p className="font-medium">✅ Update completed!</p>
                <p className="mt-1">
                  Updated {lastUpdateResult.seriesUpdated.length} series with {lastUpdateResult.newRecords} new records
                </p>
                {lastUpdateResult.seriesUpdated.length > 0 && (
                  <p className="mt-1 text-xs">
                    Series: {lastUpdateResult.seriesUpdated.join(', ')}
                  </p>
                )}
              </div>
            ) : (
              <p>📅 No new data available - all series are current</p>
            )
          ) : (
            <div>
              <p className="font-medium">❌ Update failed</p>
              <p className="mt-1">{lastUpdateResult.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}