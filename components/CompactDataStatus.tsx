'use client'

import React, { useState, useEffect } from 'react'
import { 
  checkDataFreshness, 
  triggerDataUpdate, 
  formatDataAge, 
  getUpdateStatus,
  type DataFreshnessInfo
} from '@/lib/data-refresh'

export default function CompactDataStatus() {
  const [freshness, setFreshness] = useState<DataFreshnessInfo | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

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
    
    try {
      const result = await triggerDataUpdate()
      
      if (result.success) {
        // Refresh freshness info
        const info = await checkDataFreshness()
        setFreshness(info)
      }
    } catch (error) {
      console.error('Update failed:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  if (!freshness) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse"></div>
        <div className="text-left">
          <div className="text-xs font-medium text-gray-600">Checking...</div>
        </div>
      </div>
    )
  }

  const status = getUpdateStatus(freshness.isStale, freshness.needsUpdate)
  const age = formatDataAge(freshness.lastUpdated)
  const statusColor = freshness.isStale ? 'bg-red-500' : freshness.needsUpdate ? 'bg-yellow-500' : 'bg-green-500'
  const textColor = freshness.isStale ? 'text-red-700' : freshness.needsUpdate ? 'text-yellow-700' : 'text-green-700'

  return (
    <div 
      className="relative flex items-center gap-2"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Status Indicator */}
      <div className="relative">
        <div className={`w-3 h-3 ${statusColor} rounded-full`}></div>
        {!freshness.isStale && !freshness.needsUpdate && (
          <div className={`absolute inset-0 w-3 h-3 ${statusColor} rounded-full animate-ping opacity-75`}></div>
        )}
      </div>
      
      {/* Status Text */}
      <div className="text-left">
        <div className={`text-xs font-medium ${textColor}`}>
          {freshness.isStale ? 'Data Stale' : freshness.needsUpdate ? 'Update Available' : 'Data Current'}
        </div>
        <div className="text-xs text-gray-500">Updated {age}</div>
      </div>

      {/* Tooltip with Update Button */}
      {showTooltip && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{status.icon}</span>
                <span className={`text-sm font-medium ${status.color}`}>{status.message}</span>
              </div>
              <div className="text-xs text-gray-600">
                Last updated: {age}
              </div>
            </div>
            
            <button
              onClick={handleUpdateData}
              disabled={isUpdating || (!freshness.needsUpdate && !freshness.isStale)}
              className={`
                w-full px-3 py-2 text-sm font-medium rounded-md transition-colors
                ${isUpdating 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : freshness.needsUpdate || freshness.isStale
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {isUpdating ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating...</span>
                </div>
              ) : (
                'Update Data'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
