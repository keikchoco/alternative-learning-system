'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProgressStore } from '@/store/progress-store';
import { useStore } from '@/store';
import { Student, Module, Progress, Activity } from '@/types';
import Image from 'next/image';
import { shallow } from 'zustand/shallow';

// Import static data directly as fallback
import studentsData from '@/data/students.json';
import progressData from '@/data/progress.json';
import modulesData from '@/data/modules.json';

// Components
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ActivityTable } from '@/components/progress/activity-table';
import { ActivityTableSkeleton } from '@/components/progress/activity-table-skeleton';
import { ErrorBoundary } from '@/components/error-boundary';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

// Custom hook to safely manage store subscriptions
function useStableStoreData() {
  const [storeData, setStoreData] = useState({
    modules: [] as Module[],
    loadModules: null as any,
    progress: [] as Progress[],
    loadProgress: null as any,
    progressLoading: false,
    students: [] as Student[],
    loadStudents: null as any
  });

  const [progressStoreData, setProgressStoreData] = useState({
    getStudentByLrn: null as any,
    getFilteredStudents: null as any,
    updateActivity: null as any,
    deleteActivity: null as any,
    fetchStudents: null as any,
    fetchProgress: null as any
  });

  const isInitialized = useRef(false);

  // Subscribe to main store once
  useEffect(() => {
    const unsubscribe = useStore.subscribe((state) => {
      if (!isInitialized.current) {
        isInitialized.current = true;
      }

      setStoreData({
        modules: state.modules?.data || [],
        loadModules: state.modules?.loadModules,
        progress: state.progress?.data || [],
        loadProgress: state.progress?.loadProgress,
        progressLoading: state.progress?.loading || false,
        // Add students data from main store
        students: state.students?.data || [],
        loadStudents: state.students?.loadStudents
      });
    });

    return unsubscribe;
  }, []);

  // Subscribe to progress store once
  useEffect(() => {
    const unsubscribe = useProgressStore.subscribe((state) => {
      setProgressStoreData({
        getStudentByLrn: state.getStudentByLrn,
        getFilteredStudents: state.getFilteredStudents,
        updateActivity: state.updateActivity,
        deleteActivity: state.deleteActivity,
        fetchStudents: state.fetchStudents,
        fetchProgress: state.fetchProgress
      });
    });

    return unsubscribe;
  }, []);

  return { ...storeData, ...progressStoreData };
}

function StudentActivitySummaryPageContent() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.studentId as string; // This is the LRN

  // Component render tracking (remove in production)
  // console.log('🔄 StudentActivitySummaryPageContent render', { studentId });

  // Use the stable store data hook to prevent infinite loops
  const {
    modules,
    loadModules,
    progress,
    loadProgress,
    progressLoading,
    students,
    loadStudents,
    getFilteredStudents,
    updateActivity,
    deleteActivity,
    fetchStudents,
    fetchProgress
  } = useStableStoreData();

  // Create our own getStudentByLrn function using main store data with fallback
  const getStudentByLrn = useCallback((lrn: string) => {
    // First try to find in store data
    let found = students.find(student => student.lrn === lrn);

    // If not found in store, use static data as fallback
    if (!found) {
      found = studentsData.find(student => student.lrn === lrn);
    }

    return found;
  }, [students]);

  // Local state
  const [student, setStudent] = useState<Student | null>(null);
  const [studentProgress, setStudentProgress] = useState<Progress[]>([]);
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [availableModules, setAvailableModules] = useState<Module[]>([]);
  const [showEditSuccess, setShowEditSuccess] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Load data on mount with proper error handling - run once only
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsInitialLoading(true);

        // Load students data from main store first
        if (loadStudents && typeof loadStudents === 'function') {
          await loadStudents();
        }

        // Load modules from main store
        if (loadModules && typeof loadModules === 'function') {
          await loadModules();
        }

        // Load progress data from main store
        if (loadProgress && typeof loadProgress === 'function') {
          await loadProgress();
        }

        // Also load students and progress data from progress store for navigation
        if (fetchStudents && typeof fetchStudents === 'function') {
          await fetchStudents();
        }

        if (fetchProgress && typeof fetchProgress === 'function') {
          await fetchProgress();
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadData();
  }, []); // Empty dependency array - run once on mount

  // Get student data when studentId changes
  useEffect(() => {
    if (studentId && getStudentByLrn) {
      const foundStudent = getStudentByLrn(studentId);
      setStudent(foundStudent || null);
    }
  }, [studentId, getStudentByLrn]); // Include stable getStudentByLrn

  // Create stable empty arrays for memoization
  const emptyStudentProgress = useMemo(() => [], []);
  const emptyAvailableModules = useMemo(() => [], []);

  // Memoize student progress to prevent recalculation
  const studentProgressRecords = useMemo(() => {
    if (student) {
      // First try store data
      let progressRecords = progress.filter(p => p.studentId === student.lrn);

      // If no progress in store, use static data as fallback
      if (progressRecords.length === 0) {
        progressRecords = progressData.filter(p => p.studentId === student.lrn);
      }

      return progressRecords;
    }
    return emptyStudentProgress;
  }, [student, progress, emptyStudentProgress]);

  // Memoize available modules to prevent recalculation
  const availableModulesData = useMemo(() => {
    if (student) {
      // First try store data
      let modulesList = modules;

      // If no modules in store, use static data as fallback
      if (modulesList.length === 0) {
        modulesList = modulesData as Module[];
      }

      return modulesList.filter(module =>
        module.levels.includes(student.program) || module.levels.includes('All Programs')
      );
    }
    return emptyAvailableModules;
  }, [student, modules, emptyAvailableModules]);

  // Update state when data changes
  useEffect(() => {
    setStudentProgress(studentProgressRecords);
  }, [studentProgressRecords]);

  useEffect(() => {
    setAvailableModules(availableModulesData);
  }, [availableModulesData]);

  // Set first available module as selected if none selected
  useEffect(() => {
    if (!selectedModule && availableModulesData.length > 0) {
      setSelectedModule(availableModulesData[0].id);
    }
  }, [selectedModule, availableModulesData]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    router.push('/progress');
  }, [router]);

  // Create stable empty array for navigation
  const emptyFilteredStudents = useMemo(() => [], []);

  // Memoize navigation info to prevent recalculation
  const navigationInfo = useMemo(() => {
    if (!getFilteredStudents) return {
      filteredStudents: emptyFilteredStudents,
      currentStudentIndex: -1,
      hasPrevious: false,
      hasNext: false
    };

    const filteredStudents = getFilteredStudents();
    const currentStudentIndex = filteredStudents.findIndex(s => s.lrn === studentId);
    return {
      filteredStudents,
      currentStudentIndex,
      hasPrevious: currentStudentIndex > 0,
      hasNext: currentStudentIndex < filteredStudents.length - 1
    };
  }, [getFilteredStudents, studentId, emptyFilteredStudents]);

  const { filteredStudents, currentStudentIndex, hasPrevious, hasNext } = navigationInfo;

  // Handle student navigation with useCallback to prevent recreation
  const handlePreviousStudent = useCallback(() => {
    if (hasPrevious && !isNavigating) {
      setIsNavigating(true);
      const previousStudent = filteredStudents[currentStudentIndex - 1];
      router.push(`/progress/${previousStudent.lrn}`);
      // Reset navigation state after a short delay
      setTimeout(() => setIsNavigating(false), 500);
    }
  }, [hasPrevious, isNavigating, filteredStudents, currentStudentIndex, router]);

  const handleNextStudent = useCallback(() => {
    if (hasNext && !isNavigating) {
      setIsNavigating(true);
      const nextStudent = filteredStudents[currentStudentIndex + 1];
      router.push(`/progress/${nextStudent.lrn}`);
      // Reset navigation state after a short delay
      setTimeout(() => setIsNavigating(false), 500);
    }
  }, [hasNext, isNavigating, filteredStudents, currentStudentIndex, router]);

  // Handle keyboard navigation with memoized handler
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Only handle navigation if no input/textarea is focused
    if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      handlePreviousStudent();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      handleNextStudent();
    }
  }, [handlePreviousStudent, handleNextStudent]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Activity handlers with useCallback to prevent recreation
  const handleActivityUpdate = useCallback(async (activityIndex: number, activity: Activity) => {
    try {
      if (updateActivity) {
        await updateActivity(studentId, selectedModule, activityIndex, activity);
      }
      // Refresh progress data
      if (loadProgress && typeof loadProgress === 'function') {
        await loadProgress();
      }
      setShowEditSuccess(true);
      setTimeout(() => setShowEditSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating activity:', error);
      alert('Failed to update activity. Please try again.');
    }
  }, [updateActivity, studentId, selectedModule, loadProgress]);

  const handleActivityDelete = useCallback(async (activityIndex: number) => {
    try {
      if (deleteActivity) {
        await deleteActivity(studentId, selectedModule, activityIndex);
      }
      // Refresh progress data
      if (loadProgress && typeof loadProgress === 'function') {
        await loadProgress();
      }
      setShowEditSuccess(true);
      setTimeout(() => setShowEditSuccess(false), 3000);
    } catch (error) {
      console.error('Error deleting activity:', error);
      alert('Failed to delete activity. Please try again.');
    }
  }, [deleteActivity, studentId, selectedModule, loadProgress]);

  // Get current module progress with memoization
  const currentModuleProgress = useMemo(() => {
    return studentProgress.find(p => p.moduleId === selectedModule);
  }, [studentProgress, selectedModule]);

  // Show loading state during initial data load
  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg border-4 border-blue-600 p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading student data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            onClick={handleBack}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Progress
          </Button>


        </div>
        <div className="text-center py-8">
          <p className="text-gray-500">Student not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900">
      {/* Main Content Area */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border-4 border-blue-600 dark:border-blue-500 mx-4 my-4">
        {/* Student Information Header */}
        <div className="bg-gray-100 dark:bg-slate-700 p-6 rounded-t-lg border-b-4 border-blue-600 dark:border-blue-500">
          <div className="flex items-center justify-between">
            {/* Left side - Back button, navigation, and student info */}
            <div className="flex items-center gap-6">
              {/* Back Arrow */}
              <Button
                onClick={handleBack}
                variant="ghost"
                size="sm"
                className="bg-red-800 dark:bg-red-900 text-white hover:bg-red-900 dark:hover:bg-red-800 p-2 rounded"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>



              {/* Student Image */}
              <div className="relative h-16 w-16 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                {student.image ? (
                  <Image
                    src={student.image}
                    alt={student.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="rounded-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : null}
                {/* Initials fallback */}
                <span className="text-gray-600 dark:text-gray-300 font-bold text-lg">
                  {student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </span>
              </div>

              {/* Student Details */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white uppercase">{student.name}</h2>
                <p className="text-gray-700 dark:text-gray-300 font-medium">{student.lrn}</p>
              </div>
            </div>

            {/* Right side - Program info */}
            <div className="text-right">
              <p className="text-gray-900 dark:text-white font-medium">{student.program}</p>
              <p className="text-gray-700 dark:text-gray-300">Group {student.group}</p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {showEditSuccess && (
          <div className="mx-6 mt-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 rounded">
            ✓ Activity updated successfully!
          </div>
        )}

        {/* Modules Section */}
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Modules</h3>

          {/* Module Tabs */}
          {availableModules.length > 0 ? (
            <Tabs value={selectedModule} onValueChange={setSelectedModule} className="w-full">
              <div className="border-b border-gray-300 dark:border-gray-600">
                {/* Horizontal scroll container for mobile */}
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
                  <TabsList className="w-full !bg-transparent rounded-none gap-0 p-0 justify-start">
                    {availableModules.map((module) => (
                      <TabsTrigger
                        key={module.id}
                        value={module.id}
                        className={`px-3 sm:px-4 md:px-6 py-3 min-w-[120px] sm:min-w-[140px] border-b-2 transition-colors font-bold whitespace-nowrap text-xs sm:text-sm md:text-base ${
                          selectedModule === module.id
                            ? '!bg-blue-600 dark:!bg-blue-700 !text-white border-blue-600 dark:border-blue-500 rounded-t-lg data-[state=active]:!bg-blue-600 dark:data-[state=active]:!bg-blue-700 data-[state=active]:!text-white'
                            : '!bg-transparent !text-gray-700 dark:!text-gray-300 hover:!text-blue-600 dark:hover:!text-blue-400 border-transparent hover:border-blue-200 dark:hover:border-blue-400 rounded-none data-[state=active]:!bg-transparent'
                        }`}
                      >
                        {module.title}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
              </div>

              {/* Module Content */}
              {availableModules.map((module) => (
                <TabsContent key={module.id} value={module.id} className="mt-0">
                  <div className="p-0">
                    {progressLoading ? (
                      <ActivityTableSkeleton />
                    ) : (
                      <ActivityTable
                        activities={currentModuleProgress?.activities || []}
                        moduleTitle={module.title}
                        studentId={studentId}
                        moduleId={module.id}
                        onActivityUpdate={handleActivityUpdate}
                        onActivityDelete={handleActivityDelete}
                        // Student navigation props
                        currentStudentIndex={currentStudentIndex}
                        totalStudents={filteredStudents.length}
                        hasPrevious={hasPrevious}
                        hasNext={hasNext}
                        onPreviousStudent={handlePreviousStudent}
                        onNextStudent={handleNextStudent}
                        isNavigating={isNavigating}
                      />
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">No modules available for this student's program.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Wrap with error boundary to handle any remaining issues
export default function StudentActivitySummaryPage() {
  return (
    <ErrorBoundary>
      <StudentActivitySummaryPageContent />
    </ErrorBoundary>
  );
}
