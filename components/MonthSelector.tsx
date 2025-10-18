'use client'

import React from 'react'

interface MonthSelectorProps {
  selectedMonths: number[]
  onMonthsChange: (months: number[]) => void
  disabled?: boolean
  availableMonths?: number[]
  selectedYear?: string
}

const MONTHS = [
  { value: 1, label: 'Jan', fullLabel: 'January' },
  { value: 2, label: 'Feb', fullLabel: 'February' },
  { value: 3, label: 'Mar', fullLabel: 'March' },
  { value: 4, label: 'Apr', fullLabel: 'April' },
  { value: 5, label: 'May', fullLabel: 'May' },
  { value: 6, label: 'Jun', fullLabel: 'June' },
  { value: 7, label: 'Jul', fullLabel: 'July' },
  { value: 8, label: 'Aug', fullLabel: 'August' },
  { value: 9, label: 'Sep', fullLabel: 'September' },
  { value: 10, label: 'Oct', fullLabel: 'October' },
  { value: 11, label: 'Nov', fullLabel: 'November' },
  { value: 12, label: 'Dec', fullLabel: 'December' },
]

export default function MonthSelector({ 
  selectedMonths, 
  onMonthsChange, 
  disabled = false, 
  availableMonths = [],
  selectedYear 
}: MonthSelectorProps) {
  
  // Determine which months should be disabled
  const getMonthDisabledState = (monthValue: number) => {
    if (disabled) return true
    
    // If no availableMonths provided, don't disable any month
    if (availableMonths.length === 0) return false
    
    // Check if month has data
    const hasData = availableMonths.includes(monthValue)
    if (!hasData) return true
    
    // Check if month is in the future
    if (selectedYear) {
      const currentDate = new Date()
      const currentYear = currentDate.getFullYear()
      const currentMonth = currentDate.getMonth() + 1 // 1-based
      
      const yearNum = parseInt(selectedYear)
      if (yearNum > currentYear || (yearNum === currentYear && monthValue > currentMonth)) {
        return true
      }
    }
    
    return false
  }

  const handleMonthClick = (monthValue: number) => {
    if (getMonthDisabledState(monthValue)) return

    const isSelected = selectedMonths.includes(monthValue)
    
    if (isSelected) {
      // Remove the month
      const newSelection = selectedMonths.filter(m => m !== monthValue)
      onMonthsChange(newSelection)
    } else {
      // Add the month and keep consecutive selection
      const newSelection = [...selectedMonths, monthValue].sort((a, b) => a - b)
      
      // Check if we can make a consecutive range
      const minMonth = Math.min(...newSelection)
      const maxMonth = Math.max(...newSelection)
      
      // If the range is small enough (≤ 6 months), fill in gaps to make consecutive
      if (maxMonth - minMonth <= 5) {
        const consecutiveRange = []
        for (let i = minMonth; i <= maxMonth; i++) {
          consecutiveRange.push(i)
        }
        onMonthsChange(consecutiveRange)
      } else {
        onMonthsChange(newSelection)
      }
    }
  }

  const handleSelectAll = () => {
    if (disabled) return
    // Only select available, non-future months
    const selectableMonths = MONTHS.filter(m => !getMonthDisabledState(m.value)).map(m => m.value)
    onMonthsChange(selectableMonths)
  }

  const handleClearAll = () => {
    if (disabled) return
    onMonthsChange([])
  }

  const getSelectionSummary = () => {
    if (selectedMonths.length === 0) return 'No months selected'
    if (selectedMonths.length === 12) return 'All months selected'
    
    const sortedMonths = [...selectedMonths].sort((a, b) => a - b)
    const monthNames = sortedMonths.map(m => MONTHS.find(month => month.value === m)?.label).join(', ')
    
    if (sortedMonths.length <= 3) {
      return monthNames
    } else {
      const firstMonth = MONTHS.find(m => m.value === sortedMonths[0])?.label
      const lastMonth = MONTHS.find(m => m.value === sortedMonths[sortedMonths.length - 1])?.label
      return `${firstMonth} - ${lastMonth} (${sortedMonths.length} months)`
    }
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
  <h3 className="text-sm font-semibold text-gray-700">Select Months</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSelectAll}
            disabled={disabled || selectedMonths.length === MONTHS.filter(m => !getMonthDisabledState(m.value)).length}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Select All
          </button>
          <span className="text-gray-300">•</span>
          <button
            onClick={handleClearAll}
            disabled={disabled || selectedMonths.length === 0}
            className="text-xs font-medium text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Month Grid - Ultra Compact Modern Design */}
      <div className="grid grid-cols-12 gap-1.5">
        {MONTHS.map((month) => {
          const isSelected = selectedMonths.includes(month.value)
          const isDisabled = getMonthDisabledState(month.value)
          return (
            <button
              key={month.value}
              onClick={() => handleMonthClick(month.value)}
              disabled={isDisabled}
              className={`
                group relative px-2 py-2.5 text-xs font-semibold rounded-lg transition-all duration-200
                ${isSelected && !isDisabled
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/30 border-2 border-blue-400'
                  : isDisabled
                  ? 'bg-gray-100 text-gray-300 border-2 border-gray-200 cursor-not-allowed opacity-50'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:shadow-sm hover:bg-blue-50 cursor-pointer'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
                ${!isDisabled && !isSelected ? 'hover:scale-105' : ''}
                ${isSelected && !isDisabled ? 'scale-105' : ''}
              `}
              title={month.fullLabel}
            >
              <span className="relative z-10 block text-center">{month.label}</span>
            </button>
          )
        })}
      </div>

      {/* Selection Summary - Compact */}
      {selectedMonths.length > 0 && (
        <div className="flex items-center justify-between bg-white border border-blue-200 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-gray-700">
              {getSelectionSummary()}
            </span>
          </div>
          <div className="text-xs text-gray-500 font-medium">
            ~{Math.round(selectedMonths.length * 21.7)} pts
          </div>
        </div>
      )}
    </div>
  )
}