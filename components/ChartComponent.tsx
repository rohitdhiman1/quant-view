'use client'

import React, { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { MultiSeriesData, SeriesConfig } from '@/types/data'
import MonthSelector from './MonthSelector'

/**
 * Props interface for the MultiSeriesChartComponent
 */
interface MultiSeriesChartComponentProps {
  /** Multi-series data with all available series */
  data: MultiSeriesData
  /** Optional title for the chart */
  title?: string
}

/**
 * Props interface for the custom tooltip
 */
interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    value: number
    dataKey: string
    name: string
    color: string
  }>
  label?: string
  seriesConfigs?: SeriesConfig[]
}

/**
 * Custom tooltip component for the chart
 */
const CustomTooltip = ({ active, payload, label, seriesConfigs = [] }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const date = new Date(label || '').toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-xs">
        <p className="text-gray-600 text-sm font-medium mb-2">{date}</p>
        {payload.map((entry, index) => {
          // Find the series config to get the correct unit
          const seriesConfig = seriesConfigs.find((s: SeriesConfig) => s.key === entry.dataKey)
          const unit = seriesConfig?.unit || '%'
          
          let formattedValue = ''
          if (unit === '$/barrel') {
            formattedValue = `$${entry.value.toFixed(2)}`
          } else if (unit === 'Index') {
            formattedValue = entry.value.toFixed(2)
          } else if (unit === '%') {
            formattedValue = `${entry.value.toFixed(2)}%`
          } else {
            formattedValue = `${entry.value.toFixed(2)}${unit}`
          }
          
          return (
            <div key={index} className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="text-xs text-gray-600">{entry.name}</span>
              </div>
              <span className="text-sm font-semibold" style={{ color: entry.color }}>
                {formattedValue}
              </span>
            </div>
          )
        })}
      </div>
    )
  }
  return null
}

/**
 * Professional multi-series chart component with interactive filtering
 * Uses Recharts with Tailwind CSS for modern styling
 */
export default function MultiSeriesChartComponent({ 
  data, 
  title = "Financial Markets Dashboard" 
}: MultiSeriesChartComponentProps) {
  const [visibleSeries, setVisibleSeries] = useState<Set<string>>(
    new Set(data.series.filter(s => s.visible).map(s => s.key))
  )
  
  // Helper function to determine if a metric uses absolute values
  const isAbsoluteMetric = (unit: string) => {
    return unit === '$/barrel' || unit === 'Index'
  }
  
  // Helper function to determine if a metric uses percentage values
  const isPercentageMetric = (unit: string) => {
    return unit === '%'
  }
  
  // Get currently selected metric types
  const selectedMetricTypes = useMemo(() => {
    const visibleSeriesConfigs = data.series.filter(s => visibleSeries.has(s.key))
    const hasAbsolute = visibleSeriesConfigs.some(s => isAbsoluteMetric(s.unit))
    const hasPercentage = visibleSeriesConfigs.some(s => isPercentageMetric(s.unit))
    return { hasAbsolute, hasPercentage }
  }, [data.series, visibleSeries])
  
  // Year filtering for daily data
  const [selectedYear, setSelectedYear] = useState<string>(() => {
    const currentYear = new Date().getFullYear()
    return currentYear.toString()
  })
  
  // Month filtering for enhanced focus - default to current month
  const [selectedMonths, setSelectedMonths] = useState<number[]>(() => {
    const currentMonth = new Date().getMonth() + 1 // 1-based month
    return [currentMonth]
  })
  
  // Get available months for the selected year (currently unused but ready for future enhancements)
  const availableMonths = useMemo(() => {
    const months = new Set<number>()
    data.series.forEach(series => {
      series.data.forEach(point => {
        const date = new Date(point.date)
        const year = date.getFullYear().toString()
        if (year === selectedYear) {
          months.add(date.getMonth() + 1) // 1-based month
        }
      })
    })
    return Array.from(months).sort()
  }, [data.series, selectedYear])
  
  // Get available years from data
  const availableYears = useMemo(() => {
    const years = new Set<string>()
    data.series.forEach(series => {
      series.data.forEach(point => {
        const year = new Date(point.date).getFullYear().toString()
        years.add(year)
      })
    })
    return Array.from(years).sort().reverse() // Most recent first
  }, [data.series])

  // Combine all data points by date with year and month filtering
  const combinedData = useMemo(() => {
    const dateMap = new Map<string, Record<string, number | string>>()
    
    data.series.forEach(series => {
      series.data.forEach(point => {
        const date = new Date(point.date)
        const pointYear = date.getFullYear().toString()
        const pointMonth = date.getMonth() + 1 // 1-based month
        
        // Filter by selected year
        if (pointYear !== selectedYear) return
        
        // Filter by selected months (if any months are selected)
        if (selectedMonths.length > 0 && !selectedMonths.includes(pointMonth)) return
        
        if (!dateMap.has(point.date)) {
          dateMap.set(point.date, { date: point.date })
        }
        const entry = dateMap.get(point.date)!
        // Ensure the value is a number
        entry[series.key] = Number(point.value)
      })
    })
    
    const sortedData = Array.from(dateMap.values()).sort((a, b) => 
      new Date(a.date as string).getTime() - new Date(b.date as string).getTime()
    )
    
    return sortedData
  }, [data.series, selectedYear, selectedMonths])

  const toggleSeries = (seriesKey: string) => {
    const series = data.series.find(s => s.key === seriesKey)
    if (!series) return
    
    const newVisibleSeries = new Set(visibleSeries)
    
    if (newVisibleSeries.has(seriesKey)) {
      // If already selected, just remove it
      newVisibleSeries.delete(seriesKey)
    } else {
      // If adding a new series, check for mutual exclusion
      const isSelectingAbsolute = isAbsoluteMetric(series.unit)
      const isSelectingPercentage = isPercentageMetric(series.unit)
      
      if (isSelectingAbsolute && selectedMetricTypes.hasPercentage) {
        // Remove all percentage metrics when selecting absolute
        data.series.forEach(s => {
          if (isPercentageMetric(s.unit)) {
            newVisibleSeries.delete(s.key)
          }
        })
      } else if (isSelectingPercentage && selectedMetricTypes.hasAbsolute) {
        // Remove all absolute metrics when selecting percentage
        data.series.forEach(s => {
          if (isAbsoluteMetric(s.unit)) {
            newVisibleSeries.delete(s.key)
          }
        })
      }
      
      newVisibleSeries.add(seriesKey)
    }
    
    setVisibleSeries(newVisibleSeries)
  }

  const visibleSeriesConfigs = data.series.filter(s => visibleSeries.has(s.key))
  const currentValues = visibleSeriesConfigs.map(series => {
    // Get latest data for selected year
    const yearData = series.data.filter(point => 
      new Date(point.date).getFullYear().toString() === selectedYear
    )
    const latestData = yearData[yearData.length - 1]
    return {
      name: series.name,
      value: latestData?.value || 0,
      color: series.color
    }
  })

  // Calculate Y-axis domain based on visible data for selected year
  const yAxisDomain = useMemo(() => {
    if (visibleSeriesConfigs.length === 0) return [0, 10]
    
    const allVisibleValues = visibleSeriesConfigs.flatMap(series => 
      series.data
        .filter(point => new Date(point.date).getFullYear().toString() === selectedYear)
        .map(point => point.value)
    ).filter(val => typeof val === 'number' && !isNaN(val))
    
    if (allVisibleValues.length === 0) return [0, 10]
    
    const minVal = Math.min(...allVisibleValues)
    const maxVal = Math.max(...allVisibleValues)
    const padding = (maxVal - minVal) * 0.1 || 0.5 // 10% padding or 0.5 if same values
    
    return [
      Math.max(0, minVal - padding),
      maxVal + padding
    ]
  }, [visibleSeriesConfigs, selectedYear, selectedMonths])

  // Group series by category for better organization
  const seriesByCategory = data.series.reduce((acc, series) => {
    if (!acc[series.category]) {
      acc[series.category] = []
    }
    acc[series.category].push(series)
    return acc
  }, {} as Record<string, SeriesConfig[]>)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-300">
      {/* Chart Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">{title}</h2>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span>Interactive Multi-Series Analysis</span>
          <span>•</span>
          <span>{data.dateRange.start} to {data.dateRange.end}</span>
        </div>
      </div>

      {/* Series Selection - Compact Horizontal Layout */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Select Data Series</h3>
          {(selectedMetricTypes.hasAbsolute || selectedMetricTypes.hasPercentage) && (
            <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full font-medium">
              {selectedMetricTypes.hasAbsolute ? 'Absolute values selected' : 'Percentage values selected'}
            </div>
          )}
        </div>
        {(selectedMetricTypes.hasAbsolute && selectedMetricTypes.hasPercentage) === false && 
         (selectedMetricTypes.hasAbsolute || selectedMetricTypes.hasPercentage) && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            💡 {selectedMetricTypes.hasAbsolute 
              ? 'Percentage metrics are disabled while absolute metrics are selected.' 
              : 'Absolute metrics are disabled while percentage metrics are selected.'
            }
          </p>
        )}
        
        {/* Unified Horizontal Grid with Divider */}
        <div className="flex items-start gap-4">
          {/* Percentage Metrics */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-md text-[10px] font-bold">
                <span>%</span>
                <span>PERCENTAGE</span>
              </div>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(seriesByCategory)
                .filter(([_, seriesGroup]) => 
                  seriesGroup.some(s => isPercentageMetric(s.unit))
                )
                .map(([category, seriesGroup]) => {
                const categoryName = category === 'yields' ? 'Treasury Yields' : 
                                    category === 'inflation' ? 'Inflation Metrics' : 
                                    category === 'volatility' ? 'Market Volatility' :
                                    category === 'employment' ? 'Labor Market' :
                                    category === 'economic_indicators' ? 'Economic Indicators' :
                                    'Other'
                
                const categoryIcon = category === 'yields' ? '📊' :
                                    category === 'inflation' ? '📈' :
                                    category === 'volatility' ? '⚡' :
                                    category === 'employment' ? '👥' :
                                    category === 'economic_indicators' ? '📉' : '�'
                
                const selectedCount = seriesGroup.filter(s => visibleSeries.has(s.key)).length
                const hasSelected = selectedCount > 0
                
                return (
                  <div key={category} className="group relative">
                    <div className={`
                      relative overflow-hidden rounded-lg border-2 transition-all duration-200 cursor-pointer
                      ${hasSelected 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-sm' 
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md'
                      }
                    `}>
                      <div className="p-3">
                        <div className="text-xl mb-1.5">{categoryIcon}</div>
                        <div className="text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-0.5 leading-tight uppercase tracking-wide">
                          {categoryName}
                        </div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400">
                          {selectedCount > 0 ? `${selectedCount} sel` : `${seriesGroup.length} avail`}
                        </div>
                      </div>
                      <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-3 h-3 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    <div className="absolute left-0 top-full mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 transform group-hover:translate-y-0 translate-y-2">
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100 dark:border-gray-700">
                          <span className="text-xl">{categoryIcon}</span>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{categoryName}</h4>
                        </div>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {seriesGroup.map(series => {
                            const isSelected = visibleSeries.has(series.key)
                            const isDisabled = (!isSelected) && selectedMetricTypes.hasAbsolute
                            
                            return (
                              <button
                                key={series.key}
                                onClick={() => !isDisabled && toggleSeries(series.key)}
                                disabled={isDisabled}
                                className={`
                                  w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200
                                  ${isSelected
                                    ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100 font-medium shadow-sm'
                                    : isDisabled
                                      ? 'bg-gray-50 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
                                      : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-pointer'
                                  }
                                `}
                              >
                                <div 
                                  className="w-3 h-3 rounded-full flex-shrink-0" 
                                  style={{ backgroundColor: isDisabled ? '#d1d5db' : series.color }}
                                ></div>
                                <span className="text-xs flex-1">{series.name}</span>
                                {isSelected && (
                                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="flex flex-col items-center px-2 self-stretch">
            <div className="w-px flex-1 bg-gradient-to-b from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
          </div>

          {/* Absolute Metrics */}
          <div className="flex-shrink-0" style={{ width: '280px' }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-md text-[10px] font-bold">
                <span>#</span>
                <span>ABSOLUTE</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(seriesByCategory)
                .filter(([_, seriesGroup]) => 
                  seriesGroup.some(s => isAbsoluteMetric(s.unit))
                )
                .map(([category, seriesGroup]) => {
                  const categoryName = category === 'commodities' ? 'Commodities' :
                                      category === 'currency' ? 'Currency & FX' : 'Other'
                  
                  const categoryIcon = category === 'commodities' ? '🛢️' :
                                      category === 'currency' ? '💵' : '📋'
                  
                  const selectedCount = seriesGroup.filter(s => visibleSeries.has(s.key)).length
                  const hasSelected = selectedCount > 0
                  
                  return (
                    <div key={category} className="group relative">
                      <div className={`
                        relative overflow-hidden rounded-lg border-2 transition-all duration-200 cursor-pointer
                        ${hasSelected 
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/30 shadow-sm' 
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-green-300 dark:hover:border-green-600 hover:shadow-md'
                        }
                      `}>
                        <div className="p-3">
                          <div className="text-xl mb-1.5">{categoryIcon}</div>
                          <div className="text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-0.5 leading-tight uppercase tracking-wide">
                            {categoryName}
                          </div>
                          <div className="text-[10px] text-gray-500 dark:text-gray-400">
                            {selectedCount > 0 ? `${selectedCount} sel` : `${seriesGroup.length} avail`}
                          </div>
                        </div>
                        <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-3 h-3 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>

                      <div className="absolute left-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 transform group-hover:translate-y-0 translate-y-2">
                        <div className="p-3">
                          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                            <span className="text-lg">{categoryIcon}</span>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-xs">{categoryName}</h4>
                          </div>
                          <div className="space-y-1.5 max-h-60 overflow-y-auto">
                            {seriesGroup.map(series => {
                              const isSelected = visibleSeries.has(series.key)
                              const isDisabled = (!isSelected) && selectedMetricTypes.hasPercentage
                              
                              return (
                                <button
                                  key={series.key}
                                  onClick={() => !isDisabled && toggleSeries(series.key)}
                                  disabled={isDisabled}
                                  className={`
                                    w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-all duration-150
                                    ${isSelected
                                      ? 'bg-green-100 dark:bg-green-900/40 text-green-900 dark:text-green-100 font-medium shadow-sm'
                                      : isDisabled
                                        ? 'bg-gray-50 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
                                        : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-pointer'
                                    }
                                  `}
                                >
                                  <div 
                                    className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                                    style={{ backgroundColor: isDisabled ? '#d1d5db' : series.color }}
                                  ></div>
                                  <span className="text-[11px] flex-1">{series.name}</span>
                                  {isSelected && (
                                    <svg className="w-3.5 h-3.5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
      </div>



      {/* Current Values Display */}
      {currentValues.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Current Values</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {currentValues.map(item => {
              // Find the series config to get the correct unit
              const seriesConfig = data.series.find(s => s.name === item.name)
              const unit = seriesConfig?.unit || '%'
              
              let formattedValue = ''
              if (unit === '$/barrel') {
                formattedValue = `$${item.value.toFixed(2)}`
              } else if (unit === 'Index') {
                formattedValue = item.value.toFixed(2)
              } else if (unit === '%') {
                formattedValue = `${item.value.toFixed(2)}%`
              } else {
                formattedValue = `${item.value.toFixed(2)}${unit}`
              }
              
              return (
                <div key={item.name} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 truncate">{item.name}</span>
                  <span className="text-sm font-semibold" style={{ color: item.color }}>
                    {formattedValue}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Time Period Selection - Modern Compact Design */}
      <div className="mb-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Year Selection */}
          <div className="lg:col-span-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Select Year</h3>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{combinedData.length} data points</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {availableYears.map(year => {
                const isSelected = selectedYear === year
                const isCurrent = year === new Date().getFullYear().toString()
                return (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`
                      group relative px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ease-out
                      ${isSelected
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 transform scale-105 border-2 border-blue-400'
                        : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:shadow-md hover:bg-blue-50 cursor-pointer'
                      }
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                      ${!isSelected ? 'hover:transform hover:scale-105' : ''}
                    `}
                  >
                    <span className="relative z-10 flex flex-col items-center">
                      <span>{year}</span>
                      {isCurrent && (
                        <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-blue-100' : 'text-blue-600'}`}>
                          Current
                        </span>
                      )}
                    </span>
                    {isSelected && (
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Month Selection */}
          <div className="lg:col-span-7">
            <MonthSelector
              selectedMonths={selectedMonths}
              onMonthsChange={(months) => {
                setSelectedMonths(months)
              }}
              disabled={false}
              availableMonths={availableMonths}
              selectedYear={selectedYear}
            />
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-96 w-full">
        {visibleSeries.size > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={combinedData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 20,
              }}
            >
              {/* Grid */}
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#f0f0f0"
                horizontal={true}
                vertical={false}
              />
              
              {/* X Axis - Intelligent Labeling */}
              <XAxis 
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#6b7280' }}
                tickCount={(() => {
                  if (selectedMonths.length === 0) return 6 // Full year - quarterly view
                  if (selectedMonths.length === 1) return 6 // Single month - weekly view
                  if (selectedMonths.length <= 2) return 8 // 2 months - bi-weekly view
                  if (selectedMonths.length <= 4) return 6 // 3-4 months - monthly view
                  if (selectedMonths.length <= 6) return 5 // 5-6 months - monthly markers
                  return 4 // 7+ months - broader view
                })()}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  
                  // No months selected (full year): Show month only for better spacing
                  if (selectedMonths.length === 0) {
                    return date.toLocaleDateString('en-US', { 
                      month: 'short'
                    })
                  }
                  
                  // Single month: Show date with weekday for clarity
                  if (selectedMonths.length === 1) {
                    const day = date.getDate()
                    const isFirstOrFifteenth = day === 1 || day === 15
                    
                    if (isFirstOrFifteenth || combinedData.length <= 20) {
                      return date.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })
                    }
                    return day.toString()
                  }
                  
                  // 2 months: Show month + day for key dates
                  if (selectedMonths.length === 2) {
                    return date.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })
                  }
                  
                  // 3-4 months: Smart month + day labeling to avoid repetition
                  if (selectedMonths.length <= 4) {
                    const day = date.getDate()
                    // Always show month + day for clarity and to avoid repetition
                    if (day === 1) {
                      return date.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })
                    } else if (day >= 15 && day <= 16) {
                      return date.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })
                    }
                    // For other days, show month + day to maintain context
                    return date.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })
                  }
                  
                  // 5-6 months: Smart month labeling with dates to avoid repetition
                  if (selectedMonths.length <= 6) {
                    const day = date.getDate()
                    // Show month + day for first of month and mid-month to create variety
                    if (day === 1) {
                      return date.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })
                    } else if (day >= 15 && day <= 16) {
                      return date.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })
                    }
                    return date.toLocaleDateString('en-US', { 
                      month: 'short'
                    })
                  }
                  
                  // 7+ months: Month only for clean overview
                  return date.toLocaleDateString('en-US', { 
                    month: 'short'
                  })
                }}
                interval={(() => {
                  if (selectedMonths.length === 0) return Math.max(1, Math.floor(combinedData.length / 6))
                  if (selectedMonths.length >= 7) return Math.max(1, Math.floor(combinedData.length / 4))
                  if (selectedMonths.length >= 5) return Math.max(1, Math.floor(combinedData.length / 5))
                  if (selectedMonths.length >= 3) return Math.max(1, Math.floor(combinedData.length / 6))
                  return 'preserveStartEnd'
                })()}
                minTickGap={35}
              />
              
              {/* Y Axis */}
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickFormatter={(value) => {
                  // Format Y-axis based on the type of currently visible metrics
                  if (selectedMetricTypes.hasAbsolute && !selectedMetricTypes.hasPercentage) {
                    // If only absolute metrics are visible, check which type
                    const hasOilPrice = visibleSeriesConfigs.some(s => s.unit === '$/barrel')
                    const hasDollarIndex = visibleSeriesConfigs.some(s => s.unit === 'Index')
                    
                    if (hasOilPrice && !hasDollarIndex) {
                      return `$${Number(value).toFixed(0)}`
                    } else if (hasDollarIndex && !hasOilPrice) {
                      return Number(value).toFixed(1)
                    } else {
                      // Mixed absolute units - use generic format
                      return Number(value).toFixed(1)
                    }
                  } else {
                    // Default to percentage format for percentage metrics or mixed
                    return `${Number(value).toFixed(1)}%`
                  }
                }}
                domain={yAxisDomain}
                type="number"
              />
              
              {/* Tooltip */}
              <Tooltip content={<CustomTooltip seriesConfigs={data.series} />} />
              
              {/* Legend */}
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />
              
              {/* Lines */}
              {visibleSeriesConfigs.map(series => (
                <Line 
                  key={series.key}
                  type="monotone" 
                  dataKey={series.key}
                  name={series.name}
                  stroke={series.color}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 6, fill: series.color, strokeWidth: 2 }}
                  connectNulls={true}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="font-medium">No data series selected</p>
              <p className="text-sm">Select one or more data series above to view the chart</p>
            </div>
          </div>
        )}
      </div>

      {/* Chart Footer */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          {visibleSeries.size} of {data.series.length} series displayed | 
          Data spans {combinedData.length} time periods | 
          Interactive analysis dashboard
        </p>
      </div>
    </div>
  )
}