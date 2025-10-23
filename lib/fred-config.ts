import dotenv from 'dotenv'

// Load environment variables from .env.local first
dotenv.config({ path: '.env.local' })

/**
 * FRED API Configuration and Types
 */

export interface FredDataPoint {
  date: string
  value: string | number
}

export interface FredSeriesResponse {
  observations: FredDataPoint[]
}

export interface FredApiResponse {
  observations: FredDataPoint[]
}

export interface SeriesConfig {
  key: string
  name: string
  fredSeriesId: string
  color: string
  category: 'yields' | 'inflation' | 'volatility' | 'employment' | 'commodities' | 'currency' | 'economic_indicators'
  frequency: 'daily' | 'monthly'
  requiresInterpolation?: boolean
  unit?: string // Unit for display (e.g., '$/barrel', 'Index', '%', 'points', 'USD')
}

export interface TreasuryYieldConfig extends SeriesConfig {
  frequency: 'daily'
}

export interface InflationConfig extends SeriesConfig {
  frequency: 'monthly'
  requiresInterpolation: true
}

// FRED Series IDs for Treasury Yields (Daily Treasury Yield Curve Rates)
export const TREASURY_YIELD_SERIES: TreasuryYieldConfig[] = [
  {
    key: 'treasury_1y',
    name: '1-Year Treasury',
    fredSeriesId: 'DGS1',
    color: '#3b82f6', // blue-500
    category: 'yields',
    frequency: 'daily'
  },
  {
    key: 'treasury_2y',
    name: '2-Year Treasury',
    fredSeriesId: 'DGS2',
    color: '#0891b2', // cyan-600
    category: 'yields',
    frequency: 'daily'
  },
  {
    key: 'treasury_5y',
    name: '5-Year Treasury',
    fredSeriesId: 'DGS5',
    color: '#10b981', // emerald-500
    category: 'yields',
    frequency: 'daily'
  },
  {
    key: 'treasury_10y',
    name: '10-Year Treasury',
    fredSeriesId: 'DGS10',
    color: '#f59e0b', // amber-500
    category: 'yields',
    frequency: 'daily'
  },
  {
    key: 'treasury_20y',
    name: '20-Year Treasury',
    fredSeriesId: 'DGS20',
    color: '#dc2626', // red-600
    category: 'yields',
    frequency: 'daily'
  }
]

// FRED Series IDs for Inflation Data (Monthly, will be interpolated to daily)
export const INFLATION_SERIES: InflationConfig[] = [
  {
    key: 'cpi',
    name: 'CPI All Items',
    fredSeriesId: 'CPIAUCSL',
    color: '#8b5cf6', // purple-500
    category: 'inflation',
    frequency: 'monthly',
    requiresInterpolation: true
  },
  {
    key: 'core_cpi',
    name: 'Core CPI (ex Food & Energy)',
    fredSeriesId: 'CPILFESL',
    color: '#ec4899', // pink-500
    category: 'inflation',
    frequency: 'monthly',
    requiresInterpolation: true
  }
]

// FRED Series IDs for Volatility Data (Daily)
export const VOLATILITY_SERIES: TreasuryYieldConfig[] = [
  {
    key: 'vix',
    name: 'VIX (S&P 500 Volatility)',
    fredSeriesId: 'VIXCLS',
    color: '#7c3aed', // violet-600
    category: 'volatility',
    frequency: 'daily'
  },
  {
    key: 'gvz',
    name: 'GVZ (Gold Volatility)',
    fredSeriesId: 'GVZCLS',
    color: '#f59e0b', // amber-500
    category: 'volatility',
    frequency: 'daily'
  }
]

// FRED Series IDs for Employment Data (Monthly, will be interpolated to daily)
export const EMPLOYMENT_SERIES: InflationConfig[] = [
  {
    key: 'unemployment_rate',
    name: 'Unemployment Rate',
    fredSeriesId: 'UNRATE',
    color: '#dc2626', // red-600
    category: 'employment',
    frequency: 'monthly',
    requiresInterpolation: true
  }
]

// FRED Series IDs for Commodity Data (Daily)
export const COMMODITY_SERIES: TreasuryYieldConfig[] = [
  {
    key: 'oil_price',
    name: 'Oil Price (WTI)',
    fredSeriesId: 'DCOILWTICO',
    color: '#059669', // emerald-600
    category: 'commodities',
    frequency: 'daily',
    unit: '$/barrel'
  }
]

// FRED Series IDs for Currency & Market Indices (Daily - Absolute Values)
export const CURRENCY_SERIES: TreasuryYieldConfig[] = [
  {
    key: 'dollar_index',
    name: 'US Dollar Index',
    fredSeriesId: 'DTWEXBGS',
    color: '#7c2d92', // purple-700
    category: 'currency',
    frequency: 'daily',
    unit: 'Index'
  },
  {
    key: 'eur_usd',
    name: 'EUR/USD Exchange Rate',
    fredSeriesId: 'DEXUSEU',
    color: '#059669', // emerald-600
    category: 'currency',
    frequency: 'daily',
    unit: 'USD'
  },
  {
    key: 'sp500',
    name: 'S&P 500 Index',
    fredSeriesId: 'SP500',
    color: '#2563eb', // blue-600
    category: 'currency',
    frequency: 'daily',
    unit: 'Index'
  }
]

// FRED Series IDs for Economic Indicators (Daily - calculated from existing data)
export const ECONOMIC_INDICATOR_SERIES: TreasuryYieldConfig[] = [
  {
    key: 'yield_curve_spread',
    name: '10Y-2Y Yield Spread',
    fredSeriesId: 'T10Y2Y',
    color: '#ea580c', // orange-600
    category: 'economic_indicators',
    frequency: 'daily'
  }
]

// Combined series for easy iteration
export const ALL_SERIES: SeriesConfig[] = [
  ...TREASURY_YIELD_SERIES,
  ...INFLATION_SERIES,
  ...VOLATILITY_SERIES,
  ...EMPLOYMENT_SERIES,
  ...COMMODITY_SERIES,
  ...CURRENCY_SERIES,
  ...ECONOMIC_INDICATOR_SERIES
]

// API Configuration
export const FRED_CONFIG = {
  baseUrl: process.env.FRED_API_BASE_URL || 'https://api.stlouisfed.org/fred',
  apiKey: process.env.FRED_API_KEY,
  // Rate limiting: FRED allows 120 requests per minute
  rateLimitDelay: 500, // 500ms between requests
  // Default date range (daily data from 2018)
  defaultStartDate: '2018-01-01',
  // Data file paths
  dataDir: './data',
  metadataFile: './data/metadata.json'
}

// Validate API key is present
if (!FRED_CONFIG.apiKey) {
  console.warn('FRED_API_KEY not found in environment variables')
}