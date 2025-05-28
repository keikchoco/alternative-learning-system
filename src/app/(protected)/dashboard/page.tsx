'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { SchoolCalendar } from '@/components/dashboard/school-calendar';
import { UpcomingEvents } from '@/components/dashboard/upcoming-events';
import { VisionMission } from '@/components/dashboard/vision-mission';

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const user = useAuthStore(state => state.auth.user);

  useEffect(() => {
    // Add a small delay to ensure the component is properly mounted
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-container space-y-4 sm:space-y-6">
      {/* Welcome Header */}
      <div className="text-center px-2 sm:px-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Welcome to Alternative Learning System!
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Hello, {user?.name || 'Staff Name'}! Manage your ALS programs and track student progress.
        </p>
      </div>

      {/* Main Dashboard Layout - Responsive Grid */}
      <div className="dashboard-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Calendar - Full width on mobile, half on tablet, third on desktop */}
        <div className="md:col-span-1 lg:col-span-1">
          <SchoolCalendar />
        </div>

        {/* Events List - Full width on mobile, half on tablet, third on desktop */}
        <div className="md:col-span-1 lg:col-span-1">
          <UpcomingEvents />
        </div>

        {/* Vision and Mission - Full width on mobile and tablet, third on desktop */}
        <div className="md:col-span-2 lg:col-span-1">
          <VisionMission />
        </div>
      </div>
    </div>
  );
}
