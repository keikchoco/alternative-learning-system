'use client';

import { Barangay } from '@/types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface BarangayTabsProps {
  barangays: Barangay[];
  selectedBarangay: string | null;
  onSelectBarangay: (barangayId: string) => void;
}

export function BarangayTabs({
  barangays,
  selectedBarangay,
  onSelectBarangay
}: BarangayTabsProps) {
  // If no barangays available, don't render anything
  if (barangays.length === 0) {
    return null;
  }

  // Use the first barangay as default if none selected
  const currentSelection = selectedBarangay || barangays[0]?.id;

  return (
    <Tabs
      value={currentSelection}
      onValueChange={onSelectBarangay}
      className="w-full"
    >
      <div className="border-b border-gray-300">
        {/* Horizontal scroll container for mobile */}
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <TabsList className="w-fit !bg-transparent rounded-none gap-0 p-0 min-w-full">
            {barangays.map((barangay) => (
              <TabsTrigger
                key={barangay.id}
                value={barangay.id}
                className={`px-4 sm:px-6 py-3 min-w-[100px] sm:min-w-[120px] border-b-2 transition-colors font-bold whitespace-nowrap text-sm sm:text-base ${
                  currentSelection === barangay.id
                    ? '!bg-blue-600 !text-white border-blue-600 rounded-t-lg data-[state=active]:!bg-blue-600 data-[state=active]:!text-white'
                    : '!bg-transparent !text-gray-700 hover:!text-blue-600 border-transparent hover:border-blue-200 rounded-none data-[state=active]:!bg-transparent'
                }`}
              >
                {barangay.name.toUpperCase()}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </div>
    </Tabs>
  );
}
