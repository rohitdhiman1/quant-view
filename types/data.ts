/**
 * Type definition for individual data points in financial time series
 * Used throughout the application for type safety
 */
export interface DataPoint {
  /** Date in YYYY-MM-DD format */
  date: string;
  /** Value as a percentage or rate (e.g., 4.25 for 4.25%) */
  value: number;
}

/**
 * Type for an array of data points
 * Commonly used for chart data and API responses
 */
export type DataSeries = DataPoint[]

/**
 * Legacy type for backward compatibility
 * @deprecated Use DataPoint instead
 */
export interface YieldDataPoint extends DataPoint {}

/**
 * Legacy type for backward compatibility
 * @deprecated Use DataSeries instead
 */
export type YieldData = DataSeries

/**
 * Configuration for each data series in the chart
 */
export interface SeriesConfig {
  /** Unique identifier for the series */
  key: string;
  /** Display name for the series */
  name: string;
  /** Color for the line in the chart */
  color: string;
  /** Data points for this series */
  data: DataSeries;
  /** Whether this series is currently visible */
  visible: boolean;
  /** Category of the data */
  category: 'yields' | 'inflation' | 'volatility' | 'employment' | 'commodities' | 'currency' | 'economic_indicators';
  /** Unit for display (%, bps, $, etc.) */
  unit: string;
}

/**
 * Multi-series chart data structure
 */
export interface MultiSeriesData {
  /** All available data series */
  series: SeriesConfig[];
  /** Date range covered by the data */
  dateRange: {
    start: string;
    end: string;
  };
}

/**
 * Predefined series configurations with distinct, high-contrast colors
 */
export const SERIES_CONFIGS: Omit<SeriesConfig, 'data'>[] = [
  // Treasury Yields
  {
    key: 'treasury_1y',
    name: '1-Year Treasury',
    color: '#2563eb', // bright blue
    visible: false,
    category: 'yields',
    unit: '%'
  },
  {
    key: 'treasury_2y',
    name: '2-Year Treasury',
    color: '#0891b2', // cyan-600
    visible: false,
    category: 'yields',
    unit: '%'
  },
  {
    key: 'treasury_5y',
    name: '5-Year Treasury',    
    color: '#059669', // emerald green
    visible: true,
    category: 'yields',
    unit: '%'
  },
  {
    key: 'treasury_10y',
    name: '10-Year Treasury',
    color: '#ea580c', // bright orange
    visible: false,
    category: 'yields',
    unit: '%'
  },
  {
    key: 'treasury_20y',
    name: '20-Year Treasury',
    color: '#dc2626', // bright red
    visible: false,
    category: 'yields',
    unit: '%'
  },
  // Inflation Metrics
  {
    key: 'cpi',
    name: 'CPI All Items',
    color: '#7c2d92', // deep purple
    visible: true,
    category: 'inflation',
    unit: '%'
  },
  {
    key: 'core_cpi',
    name: 'Core CPI (ex Food & Energy)',
    color: '#be185d', // hot pink/magenta
    visible: false,
    category: 'inflation',
    unit: '%'
  },
  // Market Volatility
  {
    key: 'vix',
    name: 'VIX (S&P 500 Volatility)',
    color: '#1f2937', // dark gray/charcoal
    visible: false,
    category: 'volatility',
    unit: '%'
  },
  {
    key: 'gvz',
    name: 'GVZ (Gold Volatility)',
    color: '#b45309', // brown/bronze (for gold)
    visible: false,
    category: 'volatility',
    unit: '%'
  },
  // Economic Indicators
  {
    key: 'yield_curve_spread',
    name: '10Y-2Y Yield Spread',
    color: '#0d9488', // teal-600
    visible: false,
    category: 'economic_indicators',
    unit: '%'
  },
  // Labor Market
  {
    key: 'unemployment_rate',
    name: 'Unemployment Rate',
    color: '#991b1b', // dark red
    visible: false,
    category: 'employment',
    unit: '%'
  },
  // Commodities
  {
    key: 'oil_price',
    name: 'Oil Price (WTI)',
    color: '#166534', // green-800
    visible: false,
    category: 'commodities',
    unit: '$/barrel'
  },
  // Currency & FX
  {
    key: 'dollar_index',
    name: 'US Dollar Index',
    color: '#581c87', // purple-800
    visible: false,
    category: 'currency',
    unit: 'Index'
  }
];