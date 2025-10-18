import { FRED_CONFIG, FredApiResponse, FredDataPoint } from './fred-config'

/**
 * FRED API Client with rate limiting and error handling
 */
export class FredApiClient {
  private lastRequestTime = 0

  /**
   * Rate-limited request to avoid hitting FRED API limits
   */
  private async rateLimitedRequest(): Promise<void> {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    
    if (timeSinceLastRequest < FRED_CONFIG.rateLimitDelay) {
      const delay = FRED_CONFIG.rateLimitDelay - timeSinceLastRequest
      await new Promise(resolve => setTimeout(resolve, delay))
    }
    
    this.lastRequestTime = Date.now()
  }

  /**
   * Fetch data from FRED API for a specific series
   */
  async fetchSeries(
    seriesId: string,
    startDate: string,
    endDate?: string
  ): Promise<FredDataPoint[]> {
    if (!FRED_CONFIG.apiKey) {
      throw new Error('FRED API key not configured')
    }

    await this.rateLimitedRequest()

    const params = new URLSearchParams({
      series_id: seriesId,
      api_key: FRED_CONFIG.apiKey,
      file_type: 'json',
      observation_start: startDate,
      ...(endDate && { observation_end: endDate })
    })

    const url = `${FRED_CONFIG.baseUrl}/series/observations?${params}`
    
    try {
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`FRED API error: ${response.status} ${response.statusText}`)
      }

      const data: FredApiResponse = await response.json()
      
      // Filter out invalid data points
      return data.observations
        .filter(point => point.value !== '.' && point.value !== null)
        .map(point => ({
          date: point.date,
          value: parseFloat(point.value.toString())
        }))
    } catch (error) {
      console.error(`Error fetching FRED series ${seriesId}:`, error)
      throw error
    }
  }

  /**
   * Get the latest available date from FRED for a series
   */
  async getLatestDate(seriesId: string): Promise<string | null> {
    try {
      const data = await this.fetchSeries(seriesId, '2020-01-01')
      if (data.length === 0) return null
      
      return data[data.length - 1].date
    } catch (error) {
      console.error(`Error getting latest date for ${seriesId}:`, error)
      return null
    }
  }
}

/**
 * Utility functions for date handling
 */
export const DateUtils = {
  /**
   * Format date to YYYY-MM-DD for FRED API
   */
  formatForFred: (date: Date): string => {
    return date.toISOString().split('T')[0]
  },

  /**
   * Get today's date formatted for FRED
   */
  getToday: (): string => {
    return DateUtils.formatForFred(new Date())
  },

  /**
   * Add days to a date and format for FRED
   */
  addDays: (date: string, days: number): string => {
    const d = new Date(date)
    d.setDate(d.getDate() + days)
    return DateUtils.formatForFred(d)
  },

  /**
   * Check if date1 is after date2
   */
  isAfter: (date1: string, date2: string): boolean => {
    return new Date(date1) > new Date(date2)
  }
}

// Export singleton instance
export const fredClient = new FredApiClient()