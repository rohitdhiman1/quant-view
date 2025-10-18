'use client'

import CompactDataStatus from './CompactDataStatus'

interface HeaderActionsProps {
  formattedBuildTime: string
}

export default function HeaderActions({ formattedBuildTime }: HeaderActionsProps) {
  return (
    <div className="flex items-center gap-6">
      {/* Data Status Indicator */}
      <CompactDataStatus />
      
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
