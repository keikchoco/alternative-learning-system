'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useStudentStore } from '@/store/student-store';
import { useAuthStoreState } from '@/store/auth-store';

// Components
import { BarangayTabs } from '@/components/students/barangay-tabs';
import { BarangayTabsSkeleton } from '@/components/students/barangay-tabs-skeleton';
import { MapSkeleton } from '@/components/map/map-skeleton';
import { MapErrorBoundary } from '@/components/map/map-error-boundary';

// Dynamically import the map component to avoid SSR issues
const InteractiveMap = dynamic(
  () => import('@/components/map/interactive-map').then(mod => ({ default: mod.InteractiveMap })),
  {
    ssr: false,
    loading: () => <MapSkeleton className="h-[600px]" />
  }
);

export default function MapPage() {
  // Get user from auth store
  const { user } = useAuthStoreState();

  // Get student store state and actions
  const {
    students,
    barangays,
    selectedBarangay,
    loadingBarangays,
    fetchStudents,
    fetchBarangays,
    setSelectedBarangay,
  } = useStudentStore();

  // Local loading state for initial data fetch
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Stable map key to prevent unnecessary re-mounts
  const [mapKey] = useState(() => `map-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  // Track if component has been mounted to prevent double initialization
  const [isMounted, setIsMounted] = useState(false);

  // Component mount tracking
  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    if (!isMounted) return;

    const fetchData = async () => {
      setIsInitialLoading(true);
      try {
        await Promise.all([
          fetchStudents(),
          fetchBarangays()
        ]);
      } catch (error) {
        console.error('Error fetching map data:', error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchData();
  }, [isMounted, fetchStudents, fetchBarangays]);

  // Filter barangays based on user role
  const filteredBarangays = user?.role === 'admin' && user?.assignedBarangayId
    ? barangays.filter(b => b.id === user.assignedBarangayId)
    : barangays;

  // Calculate enrollment statistics for each barangay
  const enrollmentStats = useMemo(() => {
    const stats: Record<string, { total: number; active: number }> = {};

    barangays.forEach(barangay => {
      const barangayStudents = students.data.filter(student => student.barangayId === barangay.id);
      stats[barangay.id] = {
        total: barangayStudents.length,
        active: barangayStudents.filter(student => student.status === 'active').length
      };
    });

    return stats;
  }, [students.data, barangays]);

  // Handle barangay tab selection with map navigation
  const handleBarangaySelect = (barangayId: string) => {
    setSelectedBarangay(barangayId);
    // The map will automatically navigate to the selected barangay
    // due to the selectedBarangay prop being passed to InteractiveMap
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">MAP</h1>
      </div>

      {/* Barangay Tabs */}
      {loadingBarangays || isInitialLoading ? (
        <BarangayTabsSkeleton />
      ) : (
        <BarangayTabs
          barangays={filteredBarangays}
          selectedBarangay={selectedBarangay}
          onSelectBarangay={handleBarangaySelect}
        />
      )}

      {/* Interactive Map */}
      <div className="bg-white rounded-lg shadow-lg border-4 border-blue-600">
        <div className="p-1">
          {loadingBarangays || isInitialLoading || !isMounted ? (
            <MapSkeleton className="h-[600px]" />
          ) : (
            <MapErrorBoundary key={`error-boundary-${mapKey}`}>
              <div className="map-wrapper" key={`wrapper-${mapKey}`}>
                <InteractiveMap
                  key={mapKey}
                  barangays={filteredBarangays}
                  selectedBarangay={selectedBarangay}
                  enrollmentStats={enrollmentStats}
                  className="h-[600px]"
                />
              </div>
            </MapErrorBoundary>
          )}
        </div>
      </div>

      {/* Map Legend/Info */}
      <div className="bg-white rounded-lg shadow-lg border-4 border-blue-600 p-6">
        <h3 className="text-lg font-bold text-blue-600 mb-4">Map Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
            <span className="text-sm text-gray-700">Barangay Location</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-blue-600 rounded"></div>
            <span className="text-sm text-gray-700">Current Enrollees</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-green-600 rounded"></div>
            <span className="text-sm text-gray-700">Active Enrollees</span>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-4">
          Click on map markers to view detailed enrollment information for each barangay.
          Use the tabs above to navigate to specific barangays.
        </p>
      </div>
    </div>
  );
}
