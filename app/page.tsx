import { promises as fs } from 'fs'
import path from 'path'
import { MultiSeriesData, SeriesConfig, DataSeries, SERIES_CONFIGS } from '@/types/data'
import MultiSeriesChartComponent from '@/components/ChartComponent'
import HeaderActions from '@/components/HeaderActions'

/**
 * Load data for a specific series
 */
async function loadSeriesData(filename: string): Promise<DataSeries> {
  try {
    const dataPath = path.join(process.cwd(), 'data', filename)
    const fileContents = await fs.readFile(dataPath, 'utf8')
    return JSON.parse(fileContents)
  } catch (error) {
    console.warn(`Failed to load ${filename}:`, error)
    return []
  }
}

/**
 * Server Component: Enhanced Quant View Dashboard
 * Demonstrates static site generation by reading multiple local JSON data sources
 * and rendering a professional multi-series financial dashboard
 */
export default async function QuantViewDashboard() {
  // Load all data series
  const seriesDataPromises = [
    { key: 'treasury_1y', filename: 'treasury_1y.json' },
    { key: 'treasury_2y', filename: 'treasury_2y.json' },
    { key: 'treasury_5y', filename: 'treasury_5y.json' },
    { key: 'treasury_10y', filename: 'treasury_10y.json' },
    { key: 'treasury_20y', filename: 'treasury_20y.json' },
    { key: 'cpi', filename: 'cpi.json' },
    { key: 'core_cpi', filename: 'core_cpi.json' },
    { key: 'vix', filename: 'vix.json' },
    { key: 'gvz', filename: 'gvz.json' },
    { key: 'unemployment_rate', filename: 'unemployment_rate.json' },
    { key: 'oil_price', filename: 'oil_price.json' },
    { key: 'dollar_index', filename: 'dollar_index.json' },
    { key: 'yield_curve_spread', filename: 'yield_curve_spread.json' }
  ]

  const loadedSeriesData = await Promise.all(
    seriesDataPromises.map(async ({ key, filename }) => ({
      key,
      data: await loadSeriesData(filename)
    }))
  )

  // Combine series configurations with loaded data
  const series: SeriesConfig[] = SERIES_CONFIGS.map(config => {
    const loadedData = loadedSeriesData.find(s => s.key === config.key)
    return {
      ...config,
      data: loadedData?.data || []
    }
  })

  // Calculate date range
  const allDates = series.flatMap(s => s.data.map(d => d.date))
  const sortedDates = allDates.sort()
  const dateRange = {
    start: sortedDates[0] || '',
    end: sortedDates[sortedDates.length - 1] || ''
  }

  const multiSeriesData: MultiSeriesData = {
    series,
    dateRange
  }

  // Generate build timestamp
  const buildTime = new Date().toISOString()
  const formattedBuildTime = new Date(buildTime).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  })

  // Calculate aggregate metrics
  const totalDataPoints = series.reduce((sum, s) => sum + s.data.length, 0)
  const activeSeries = series.filter(s => s.data.length > 0).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="mx-auto px-6 sm:px-8 lg:px-12 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quant View</h1>
              <p className="mt-1 text-sm text-gray-600">
                Multi-Series Financial Analytics Dashboard
              </p>
            </div>
            <HeaderActions formattedBuildTime={formattedBuildTime} />
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Active Series */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Active Series</p>
                <p className="text-2xl font-bold text-gray-900">{activeSeries}</p>
                <p className="text-sm text-gray-500 mt-1">of {series.length} available</p>
              </div>
              <div className="ml-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Data Coverage */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Data Coverage</p>
                <p className="text-2xl font-bold text-gray-900">{allDates.length}</p>
                <p className="text-sm text-gray-500 mt-1">unique dates</p>
              </div>
              <div className="ml-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Total Data Points */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Data Points</p>
                <p className="text-2xl font-bold text-gray-900">{totalDataPoints}</p>
                <p className="text-sm text-gray-500 mt-1">across all series</p>
              </div>
              <div className="ml-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Date Range */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Date Range</p>
                <p className="text-lg font-bold text-gray-900">
                  {new Date(dateRange.start).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  to {new Date(dateRange.end).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div className="ml-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Consolidated Multi-Series Chart */}
        <div className="mb-8">
          <MultiSeriesChartComponent 
            data={multiSeriesData}
            title="Comprehensive Financial Markets Analysis"
          />
        </div>

        {/* Data Series Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Data Series</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {series.map(s => (
              <div key={s.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: s.color }}
                  ></div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{s.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{s.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-700">{s.data.length}</p>
                  <p className="text-xs text-gray-500">points</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Enhanced Multi-Series Dashboard
            </h3>
            <p className="text-gray-600 max-w-4xl mx-auto">
              This comprehensive financial dashboard combines Treasury yields, inflation data (CPI), and market 
              volatility indicators (VIX & GVZ) in one interactive chart. Users can easily compare and analyze 
              relationships between bond markets, inflation trends, and market sentiment with smart default 
              selections and intuitive filtering capabilities.
            </p>
            <div className="mt-4 flex items-center justify-center space-x-6 text-sm text-gray-500">
              <span>Built with Next.js 15</span>
              <span>•</span>
              <span>Styled with Tailwind CSS</span>
              <span>•</span>
              <span>Charts by Recharts</span>
              <span>•</span>
              <span>Multi-Series Interactive</span>
              <span>•</span>
              <span>Static Export Ready</span>
            </div>
          </div>
        </div>
      </main>

      {/* Copyright Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="mx-auto px-6 sm:px-8 lg:px-12 py-4">
          <div className="text-center text-sm text-gray-600">
            © {new Date().getFullYear()} Rohit Dhiman. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
