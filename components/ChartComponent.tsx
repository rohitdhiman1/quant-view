'use client'

import React, { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { MultiSeriesData, SeriesConfig } from '@/types/data'

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

  // Combine all data points by date
  const combinedData = useMemo(() => {
    const dateMap = new Map<string, Record<string, number | string>>()
    
    data.series.forEach(series => {
      series.data.forEach(point => {
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
    
    // Debug: Log the first few data points to check structure
    console.log('Combined data sample:', sortedData.slice(0, 3))
    
    return sortedData
  }, [data.series])

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
    const latestData = series.data[series.data.length - 1]
    return {
      name: series.name,
      value: latestData?.value || 0,
      color: series.color
    }
  })

  // Calculate Y-axis domain based on visible data
  const yAxisDomain = useMemo(() => {
    if (visibleSeriesConfigs.length === 0) return [0, 10]
    
    const allVisibleValues = visibleSeriesConfigs.flatMap(series => 
      series.data.map(point => point.value)
    ).filter(val => typeof val === 'number' && !isNaN(val))
    
    if (allVisibleValues.length === 0) return [0, 10]
    
    const minVal = Math.min(...allVisibleValues)
    const maxVal = Math.max(...allVisibleValues)
    const padding = (maxVal - minVal) * 0.1 || 0.5 // 10% padding or 0.5 if same values
    
    return [
      Math.max(0, minVal - padding),
      maxVal + padding
    ]
  }, [visibleSeriesConfigs])

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
              
              {/* X Axis */}
              <XAxis 
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                }}
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