'use client';

import { Tabs, TabsList } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

export function BarangayTabsSkeleton() {
  // Create an array of 3 items to represent loading tabs (no "ALL BARANGAYS" tab)
  const loadingTabs = Array.from({ length: 3 }, (_, i) => i);

  return (
    <Tabs className="w-full">
      <div className="border-b border-gray-300">
        <TabsList className="w-full bg-transparent rounded-none gap-0">
          <div className="flex w-full">
            {loadingTabs.map((index) => (
              <Skeleton key={index} className="h-12 flex-1 mx-0.5 rounded-none" />
            ))}
          </div>
        </TabsList>
      </div>
    </Tabs>
  );
}
