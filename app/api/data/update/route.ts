import { NextRequest, NextResponse } from 'next/server'
import { updateData, needsUpdate, getDataFreshness } from '@/scripts/update-data'

// Make this route compatible with static export
export const dynamic = 'force-static'
export const revalidate = false

/**
 * API endpoint for data updates
 * GET: Check data freshness
 * POST: Trigger data update
 */

export async function GET() {
  try {
    const freshness = await getDataFreshness()
    
    if (!freshness) {
      return NextResponse.json(
        { error: 'No data metadata found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      lastUpdated: freshness.lastUpdated,
      isStale: freshness.isStale,
      needsUpdate: await needsUpdate(),
      seriesInfo: freshness.seriesInfo
    })
  } catch (error) {
    console.error('Error checking data freshness:', error)
    return NextResponse.json(
      { error: 'Failed to check data freshness' },
      { status: 500 }
    )
  }
}

export async function POST(_request: NextRequest) {
  try {
    // For static export, this route won't be available
    // Users should use the CLI commands instead
    return NextResponse.json(
      { 
        success: false, 
        error: 'API routes not available in static export. Use CLI commands: pnpm run fetch-data or pnpm run update-data' 
      },
      { status: 501 }
    )
  } catch (error) {
    console.error('Error updating data:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}