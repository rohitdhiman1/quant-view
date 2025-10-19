'use client'

import React, { useState, useEffect } from 'react'
import { formatDataAge } from '@/lib/data-refresh'

interface SeriesInfo {
  latestDate: string
  recordCount: number
  fredSeriesId: string
}

interface SeriesGroup {
  name: string
  series: Array<{ key: string; latestDate: string }>
  latestDate: string
  color: string
  emoji: string
}

export default function CompactDataStatus() {
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [seriesGroups, setSeriesGroups] = useState<SeriesGroup[]>([])
  const [showTooltip, setShowTooltip] = useState(false)

  // Load data status on mount
  useEffect(() => {
    const loadStatus = async () => {
      try {
        const metadataRes = await fetch('/data/metadata.json')
        const metadata = await metadataRes.json()
        
        setLastUpdated(metadata.lastUpdated)
        
        // Get all series with dates
        const allSeries = Object.entries(metadata.seriesInfo as Record<string, SeriesInfo>).map(([key, info]) => ({
          key,
          latestDate: info.latestDate
        }))
        
        // Group by recency
        const sortedByDate = allSeries.sort((a, b) => 
          new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime()
        )
        
        const newestDate = sortedByDate[0].latestDate
        const groups: SeriesGroup[] = []
        
        // Current (0-1 days old)
        const currentSeries = sortedByDate.filter(s => {
          const daysOld = Math.ceil(
            (new Date(newestDate).getTime() - new Date(s.latestDate).getTime()) / (1000 * 60 * 60 * 24)
          )
          return daysOld <= 1
        })
        
        if (currentSeries.length > 0) {
          groups.push({
            name: 'Current',
            series: currentSeries,
            latestDate: currentSeries[0].latestDate,
            color: 'text-green-600',
            emoji: '✨'
          })
        }
        
        // Recent (2-3 days old)
        const recentSeries = sortedByDate.filter(s => {
          const daysOld = Math.ceil(
            (new Date(newestDate).getTime() - new Date(s.latestDate).getTime()) / (1000 * 60 * 60 * 24)
          )
          return daysOld >= 2 && daysOld <= 3
        })
        
        if (recentSeries.length > 0) {
          groups.push({
            name: 'Recent',
            series: recentSeries,
            latestDate: recentSeries[0].latestDate,
            color: 'text-blue-600',
            emoji: '📅'
          })
        }
        
        // Updating Soon (4-7 days old)
        const updatingSoonSeries = sortedByDate.filter(s => {
          const daysOld = Math.ceil(
            (new Date(newestDate).getTime() - new Date(s.latestDate).getTime()) / (1000 * 60 * 60 * 24)
          )
          return daysOld >= 4 && daysOld <= 7
        })
        
        if (updatingSoonSeries.length > 0) {
          groups.push({
            name: 'Updating Soon',
            series: updatingSoonSeries,
            latestDate: updatingSoonSeries[0].latestDate,
            color: 'text-amber-600',
            emoji: '🔄'
          })
        }
        
        // Refreshing (8+ days old)
        const refreshingSeries = sortedByDate.filter(s => {
          const daysOld = Math.ceil(
            (new Date(newestDate).getTime() - new Date(s.latestDate).getTime()) / (1000 * 60 * 60 * 24)
          )
          return daysOld >= 8
        })
        
        if (refreshingSeries.length > 0) {
          groups.push({
            name: 'Refreshing',
            series: refreshingSeries,
            latestDate: refreshingSeries[0].latestDate,
            color: 'text-purple-600',
            emoji: '♻️'
          })
        }
        
        setSeriesGroups(groups)
      } catch (error) {
        console.error('Failed to load metadata:', error)
      }
    }

    loadStatus()
  }, [])

  if (!lastUpdated || seriesGroups.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse"></div>
        <div className="text-left">
          <div className="text-xs font-medium text-gray-600">Loading...</div>
        </div>
      </div>
    )
  }

  const age = formatDataAge(lastUpdated)
  const totalSeries = seriesGroups.reduce((sum, g) => sum + g.series.length, 0)

  return (
    <div 
      className="relative flex items-center gap-2"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Status Indicator - Always Green */}
      <div className="relative">
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-75"></div>
      </div>
      
      {/* Status Text */}
      <div className="text-left">
        <div className="text-xs font-medium text-green-600">
          Data Active
        </div>
        <div className="text-xs text-gray-500">
          {totalSeries} series • Updated {age}
        </div>
      </div>

      {/* Tooltip with Series Status */}
      {showTooltip && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-white border border-gray-200 rounded-xl shadow-xl p-4 z-50">
          <div className="space-y-4">
            {/* Header */}
            <div className="border-b pb-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">📊</span>
                <span className="text-sm font-semibold text-gray-900">Data Series Status</span>
              </div>
              <div className="text-xs text-gray-600">
                Last system update: {age}
              </div>
            </div>
            
            {/* Series Groups */}
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {seriesGroups.map((group, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base">{group.emoji}</span>
                    <span className={`text-xs font-semibold ${group.color}`}>
                      {group.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({group.series.length} series)
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-600 mb-2">
                    Latest: {new Date(group.latestDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {group.series.map((series, seriesIdx) => (
                      <span
                        key={seriesIdx}
                        className="text-[10px] px-2 py-0.5 bg-white border border-gray-200 rounded text-gray-700"
                      >
                        {series.key}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Footer Info */}
            <div className="border-t pt-3 text-xs text-gray-500">
              <div className="flex items-start gap-2">
                <span>💡</span>
                <div>
                  <p className="font-medium text-gray-700 mb-1">About data timing:</p>
                  <p>Series update on different schedules based on their source (daily markets, weekly reports, monthly releases). This is normal.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
