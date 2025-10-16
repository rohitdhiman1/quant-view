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
}

/**
 * Custom tooltip component for the chart
 */
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const date = new Date(label || '').toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-xs">
        <p className="text-gray-600 text-sm font-medium mb-2">{date}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between mb-1">
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="text-xs text-gray-600">{entry.name}</span>
            </div>
            <span className="text-sm font-semibold" style={{ color: entry.color }}>
              {entry.value.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

/**
 * Chip component for series selection
 */
interface ChipProps {
  series: SeriesConfig
  isSelected: boolean
  onClick: () => void
}

const Chip = ({ series, isSelected, onClick }: ChipProps) => (
  <button
    onClick={onClick}
    className={`
      inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
      ${isSelected 
        ? 'text-white shadow-md transform scale-105' 
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
      }
    `}
    style={{
      backgroundColor: isSelected ? series.color : undefined,
      borderColor: isSelected ? series.color : undefined,
    }}
  >
    <div 
      className="w-2 h-2 rounded-full mr-2" 
      style={{ backgroundColor: isSelected ? 'white' : series.color }}
    ></div>
    {series.name}
  </button>
)

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
    const newVisibleSeries = new Set(visibleSeries)
    if (newVisibleSeries.has(seriesKey)) {
      newVisibleSeries.delete(seriesKey)
    } else {
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
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
      {/* Chart Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <span>Interactive Multi-Series Analysis</span>
          <span>•</span>
          <span>{data.dateRange.start} to {data.dateRange.end}</span>
        </div>
      </div>

      {/* Year Selection */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Select Year</h3>
        <div className="flex flex-wrap gap-2">
          {availableYears.map(year => {
            const isSelected = selectedYear === year
            const isCurrent = year === new Date().getFullYear().toString()
            return (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`
                  group relative px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 ease-out
                  ${isSelected
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 transform scale-105 border border-blue-500'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:shadow-md hover:bg-gray-50 cursor-pointer hover:transform hover:scale-105'
                  }
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                `}
              >
                <span className="relative z-10">
                  {year}
                  {isCurrent && (
                    <span className="ml-1 text-xs opacity-75">Current</span>
                  )}
                </span>
                {isSelected && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                )}
              </button>
            )
          })}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          📊 Showing daily data for {selectedYear} • {combinedData.length} data points
        </p>
      </div>

      {/* Month Selection */}
      <div className="mb-8">
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

      {/* Series Selection Chips */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Select Data Series</h3>
        <div className="space-y-3">
          {Object.entries(seriesByCategory).map(([category, seriesGroup]) => (
            <div key={category}>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                {category === 'yields' ? 'Treasury Yields' : 
                 category === 'inflation' ? 'Inflation Metrics' : 
                 category === 'volatility' ? 'Market Volatility' :
                 'Interest Rates'}
              </div>
              <div className="flex flex-wrap gap-2">
                {seriesGroup.map(series => (
                  <Chip
                    key={series.key}
                    series={series}
                    isSelected={visibleSeries.has(series.key)}
                    onClick={() => toggleSeries(series.key)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Current Values Display */}
      {currentValues.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Current Values</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {currentValues.map(item => (
              <div key={item.name} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-xs text-gray-600 truncate">{item.name}</span>
                <span className="text-sm font-semibold" style={{ color: item.color }}>
                  {item.value.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

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
                tickFormatter={(value) => `${Number(value).toFixed(1)}%`}
                domain={yAxisDomain}
                type="number"
              />
              
              {/* Tooltip */}
              <Tooltip content={<CustomTooltip />} />
              
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
                  dot={{ fill: series.color, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: series.color, strokeWidth: 2 }}
                  connectNulls={false}
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