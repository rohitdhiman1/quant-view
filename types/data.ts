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
  /** Category of the data (yields, inflation, rates, volatility) */
  category: 'yields' | 'inflation' | 'rates' | 'volatility';
  /** Unit for display (%, bps, etc.) */
  unit: '%';
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
 * Predefined series configurations
 */
export const SERIES_CONFIGS: Omit<SeriesConfig, 'data'>[] = [
  {
    key: 'yield_5y',
    name: '5-Year Treasury',
    color: '#3b82f6', // blue-500
    visible: true,
    category: 'yields',
    unit: '%'
  },
  {
    key: 'yield_10y',
    name: '10-Year Treasury',
    color: '#1d4ed8', // blue-700
    visible: true,
    category: 'yields',
    unit: '%'
  },
  {
    key: 'yield_15y',
    name: '15-Year Treasury',
    color: '#1e40af', // blue-800
    visible: false,
    category: 'yields',
    unit: '%'
  },
  {
    key: 'yield_20y',
    name: '20-Year Treasury',
    color: '#1e3a8a', // blue-900
    visible: false,
    category: 'yields',
    unit: '%'
  },
  {
    key: 'cpi',
    name: 'CPI Inflation Rate',
    color: '#dc2626', // red-600
    visible: false,
    category: 'inflation',
    unit: '%'
  },
  {
    key: 'fed_rate',
    name: 'Federal Interest Rate',
    color: '#16a34a', // green-600
    visible: false,
    category: 'rates',
    unit: '%'
  },
  {
    key: 'vix',
    name: 'VIX (Volatility Index)',
    color: '#7c3aed', // violet-600
    visible: false,
    category: 'volatility',
    unit: '%'
  },
  {
    key: 'gvz',
    name: 'GVZ (Gold Volatility)',
    color: '#f59e0b', // amber-500
    visible: false,
    category: 'volatility',
    unit: '%'
  }
];