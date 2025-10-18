/**
 * Data Interpolation Utilities
 * Functions for interpolating monthly economic data to daily values
 */

export interface DataPoint {
  date: string
  value: number
}

/**
 * Linear interpolation between two points
 */
function linearInterpolate(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x: number
): number {
  if (x1 === x0) return y0
  return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0)
}

/**
 * Convert date string to timestamp for calculations
 */
function dateToTimestamp(dateString: string): number {
  return new Date(dateString).getTime()
}

/**
 * Convert timestamp back to YYYY-MM-DD format
 */
function timestampToDate(timestamp: number): string {
  return new Date(timestamp).toISOString().split('T')[0]
}

/**
 * Generate array of business days between two dates (excluding weekends)
 */
function getBusinessDaysBetween(startDate: string, endDate: string): string[] {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const businessDays: string[] = []
  
  const current = new Date(start)
  while (current <= end) {
    const dayOfWeek = current.getDay()
    // Include Monday (1) through Friday (5), exclude Saturday (6) and Sunday (0)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      businessDays.push(timestampToDate(current.getTime()))
    }
    current.setDate(current.getDate() + 1)
  }
  
  return businessDays
}

/**
 * Interpolate monthly data points to match existing daily treasury yield dates
 * Uses linear interpolation between consecutive monthly data points
 * @param monthlyData - Monthly CPI data points
 * @param targetDates - Existing treasury yield dates to match (optional)
 * @param startDate - Optional start date override
 * @param endDate - Optional end date override
 */
export function interpolateMonthlyToDaily(
  monthlyData: DataPoint[],
  startDate?: string,
  endDate?: string,
  targetDates?: string[]
): DataPoint[] {
  if (monthlyData.length === 0) {
    return []
  }

  // Sort data by date to ensure proper ordering
  const sortedData = [...monthlyData].sort(
    (a, b) => dateToTimestamp(a.date) - dateToTimestamp(b.date)
  )

  // Determine date range
  const rangeStart = startDate || sortedData[0].date
  const rangeEnd = endDate || sortedData[sortedData.length - 1].date

  // Use target dates if provided, otherwise generate business days
  const interpolationDates = targetDates && targetDates.length > 0 
    ? targetDates.filter(date => date >= rangeStart && date <= rangeEnd).sort()
    : getBusinessDaysBetween(rangeStart, rangeEnd)

  const interpolatedData: DataPoint[] = []

  // Convert monthly data to timestamps for easier calculation
  const monthlyTimestamps = sortedData.map(point => ({
    timestamp: dateToTimestamp(point.date),
    value: point.value,
    date: point.date
  }))

  for (const targetDate of interpolationDates) {
    const targetTimestamp = dateToTimestamp(targetDate)
    
    // Find the two monthly data points that bracket this target date
    let leftPoint = monthlyTimestamps[0]
    let rightPoint = monthlyTimestamps[monthlyTimestamps.length - 1]
    
    for (let i = 0; i < monthlyTimestamps.length - 1; i++) {
      if (
        monthlyTimestamps[i].timestamp <= targetTimestamp &&
        monthlyTimestamps[i + 1].timestamp >= targetTimestamp
      ) {
        leftPoint = monthlyTimestamps[i]
        rightPoint = monthlyTimestamps[i + 1]
        break
      }
    }
    
    // If the target date is before the first data point, use the first value
    if (targetTimestamp < monthlyTimestamps[0].timestamp) {
      interpolatedData.push({
        date: targetDate,
        value: monthlyTimestamps[0].value
      })
      continue
    }
    
    // If the target date is after the last data point, use the last value
    if (targetTimestamp > monthlyTimestamps[monthlyTimestamps.length - 1].timestamp) {
      interpolatedData.push({
        date: targetDate,
        value: monthlyTimestamps[monthlyTimestamps.length - 1].value
      })
      continue
    }
    
    // Perform linear interpolation
    const interpolatedValue = linearInterpolate(
      leftPoint.timestamp,
      leftPoint.value,
      rightPoint.timestamp,
      rightPoint.value,
      targetTimestamp
    )
    
    interpolatedData.push({
      date: targetDate,
      value: Number(interpolatedValue.toFixed(4)) // Round to 4 decimal places
    })
  }

  return interpolatedData
}

/**
 * Calculate year-over-year percentage change from CPI index values
 * CPI data from FRED comes as index values, not percentage changes
 */
export function calculateInflationRate(cpiData: DataPoint[]): DataPoint[] {
  if (cpiData.length === 0) {
    return []
  }

  const inflationData: DataPoint[] = []
  
  // Sort by date
  const sortedData = [...cpiData].sort(
    (a, b) => dateToTimestamp(a.date) - dateToTimestamp(b.date)
  )

  for (let i = 0; i < sortedData.length; i++) {
    const currentPoint = sortedData[i]
    const currentDate = new Date(currentPoint.date)
    
    // Find the data point from 12 months ago
    const yearAgoDate = new Date(currentDate)
    yearAgoDate.setFullYear(currentDate.getFullYear() - 1)
    
    // Find closest data point to 12 months ago
    let yearAgoPoint: DataPoint | null = null
    let minDiff = Infinity
    
    for (const point of sortedData) {
      const pointDate = new Date(point.date)
      const diff = Math.abs(pointDate.getTime() - yearAgoDate.getTime())
      if (diff < minDiff) {
        minDiff = diff
        yearAgoPoint = point
      }
    }
    
    if (yearAgoPoint && yearAgoPoint.value > 0) {
      // Calculate year-over-year percentage change
      const inflationRate = ((currentPoint.value - yearAgoPoint.value) / yearAgoPoint.value) * 100
      
      inflationData.push({
        date: currentPoint.date,
        value: Number(inflationRate.toFixed(4))
      })
    }
  }

  return inflationData
}

/**
 * Helper function to merge new monthly data with existing data and re-interpolate
 */
export function updateInterpolatedData(
  existingDailyData: DataPoint[],
  newMonthlyData: DataPoint[],
  originalMonthlyData: DataPoint[],
  targetDates?: string[]
): DataPoint[] {
  // Combine original and new monthly data
  const allMonthlyData = [...originalMonthlyData, ...newMonthlyData]
  
  // Remove duplicates by date
  const uniqueMonthlyData = allMonthlyData.reduce((acc, current) => {
    const existingIndex = acc.findIndex(item => item.date === current.date)
    if (existingIndex >= 0) {
      // Update existing entry with newer data
      acc[existingIndex] = current
    } else {
      acc.push(current)
    }
    return acc
  }, [] as DataPoint[])

  // Determine the date range for interpolation
  const existingDates = existingDailyData.map(d => d.date)
  const newDates = newMonthlyData.map(d => d.date)
  const allDates = [...existingDates, ...newDates]
  
  const startDate = allDates.sort()[0]
  const endDate = allDates.sort().reverse()[0]

  // Re-interpolate with the complete monthly dataset
  return interpolateMonthlyToDaily(uniqueMonthlyData, startDate, endDate, targetDates)
}