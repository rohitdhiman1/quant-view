'use client'

import CompactDataStatus from './CompactDataStatus'

interface MetadataJson {
  lastUpdated: string
  seriesInfo: Record<string, { latestDate: string; recordCount: number; fredSeriesId: string }>
}

interface HeaderActionsProps {
  formattedBuildTime: string
  metadata: MetadataJson | null
}

export default function HeaderActions({ formattedBuildTime, metadata }: HeaderActionsProps) {
  return (
    <div className="flex items-center gap-6">
      {/* Data Status Indicator */}
      <CompactDataStatus metadata={metadata} />
      
      {/* Build Time */}
      <div className="text-right border-l border-gray-200 pl-6">
        <div className="text-sm text-gray-500">Last Build Update</div>
        <div className="text-sm font-medium text-gray-700">
          {formattedBuildTime}
        </div>
      </div>
    </div>
  )
}
