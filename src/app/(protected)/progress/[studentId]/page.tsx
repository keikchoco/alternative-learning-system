'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProgressStore } from '@/store/progress-store';
import { useStore } from '@/store';
import { Student, Module, Progress, Activity } from '@/types';
import Image from 'next/image';

// Components
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ActivityTable } from '@/components/progress/activity-table';
import { ActivityTableSkeleton } from '@/components/progress/activity-table-skeleton';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

export default function StudentActivitySummaryPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.studentId as string; // This is the LRN

  // Get data from stores
  const {
    getStudentByLrn,
    getProgressByStudentId,
    getFilteredStudents,
    updateActivity,
    deleteActivity
  } = useProgressStore();
  const modules = useStore(state => state.modules.data);
  const loadModules = useStore(state => state.modules.loadModules);
  const progress = useStore(state => state.progress.data);
  const loadProgress = useStore(state => state.progress.loadProgress);
  const progressLoading = useStore(state => state.progress.loading);

  // Local state
  const [student, setStudent] = useState<Student | null>(null);
  const [studentProgress, setStudentProgress] = useState<Progress[]>([]);
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [availableModules, setAvailableModules] = useState<Module[]>([]);
  const [showEditSuccess, setShowEditSuccess] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadModules();
    loadProgress();
  }, [loadModules, loadProgress]);

  // Get student data when studentId changes
  useEffect(() => {
    if (studentId) {
      const foundStudent = getStudentByLrn(studentId);
      setStudent(foundStudent || null);
    }
  }, [studentId, getStudentByLrn]);

  // Get student progress and filter modules
  useEffect(() => {
    if (student && progress.length > 0 && modules.length > 0) {
      // Get progress records for this student
      const studentProgressRecords = progress.filter(p => p.studentId === student.lrn);
      setStudentProgress(studentProgressRecords);

      // Filter modules based on student's program
      const filteredModules = modules.filter(module => 
        module.levels.includes(student.program) || module.levels.includes('All Programs')
      );
      setAvailableModules(filteredModules);

      // Set first available module as selected if none selected
      if (!selectedModule && filteredModules.length > 0) {
        setSelectedModule(filteredModules[0].id);
      }
    }
  }, [student, progress, modules, selectedModule]);

  // Handle back navigation
  const handleBack = () => {
    router.push('/progress');
  };

  // Get navigation info
  const filteredStudents = getFilteredStudents();
  const currentStudentIndex = filteredStudents.findIndex(s => s.lrn === studentId);
  const hasPrevious = currentStudentIndex > 0;
  const hasNext = currentStudentIndex < filteredStudents.length - 1;

  // Handle student navigation
  const handlePreviousStudent = () => {
    if (hasPrevious && !isNavigating) {
      setIsNavigating(true);
      const previousStudent = filteredStudents[currentStudentIndex - 1];
      router.push(`/progress/${previousStudent.lrn}`);
      // Reset navigation state after a short delay
      setTimeout(() => setIsNavigating(false), 500);
    }
  };

  const handleNextStudent = () => {
    if (hasNext && !isNavigating) {
      setIsNavigating(true);
      const nextStudent = filteredStudents[currentStudentIndex + 1];
      router.push(`/progress/${nextStudent.lrn}`);
      // Reset navigation state after a short delay
      setTimeout(() => setIsNavigating(false), 500);
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle navigation if no input/textarea is focused
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      if (event.key === 'ArrowLeft' && hasPrevious && !isNavigating) {
        event.preventDefault();
        setIsNavigating(true);
        const previousStudent = filteredStudents[currentStudentIndex - 1];
        router.push(`/progress/${previousStudent.lrn}`);
        setTimeout(() => setIsNavigating(false), 500);
      } else if (event.key === 'ArrowRight' && hasNext && !isNavigating) {
        event.preventDefault();
        setIsNavigating(true);
        const nextStudent = filteredStudents[currentStudentIndex + 1];
        router.push(`/progress/${nextStudent.lrn}`);
        setTimeout(() => setIsNavigating(false), 500);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasPrevious, hasNext, filteredStudents, currentStudentIndex, router, isNavigating]);

  // Activity handlers
  const handleActivityUpdate = async (activityIndex: number, activity: Activity) => {
    try {
      await updateActivity(studentId, selectedModule, activityIndex, activity);
      // Refresh progress data
      loadProgress();
      setShowEditSuccess(true);
      setTimeout(() => setShowEditSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating activity:', error);
      alert('Failed to update activity. Please try again.');
    }
  };



  const handleActivityDelete = async (activityIndex: number) => {
    try {
      await deleteActivity(studentId, selectedModule, activityIndex);
      // Refresh progress data
      loadProgress();
      setShowEditSuccess(true);
      setTimeout(() => setShowEditSuccess(false), 3000);
    } catch (error) {
      console.error('Error deleting activity:', error);
      alert('Failed to delete activity. Please try again.');
    }
  };

  // Get current module progress
  const currentModuleProgress = studentProgress.find(p => p.moduleId === selectedModule);

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
    <div className="min-h-screen bg-gray-100">
      {/* Main Content Area */}
      <div className="bg-white rounded-lg shadow-lg border-4 border-blue-600 mx-4 my-4">
        {/* Student Information Header */}
        <div className="bg-gray-100 p-6 rounded-t-lg border-b-4 border-blue-600">
          <div className="flex items-center justify-between">
            {/* Left side - Back button, navigation, and student info */}
            <div className="flex items-center gap-6">
              {/* Back Arrow */}
              <Button
                onClick={handleBack}
                variant="ghost"
                size="sm"
                className="bg-red-800 text-white hover:bg-red-900 p-2 rounded"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>



              {/* Student Image */}
              <div className="relative h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
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
                <span className="text-gray-600 font-bold text-lg">
                  {student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </span>
              </div>

              {/* Student Details */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 uppercase">{student.name}</h2>
                <p className="text-gray-700 font-medium">{student.lrn}</p>
              </div>
            </div>

            {/* Right side - Program info */}
            <div className="text-right">
              <p className="text-gray-900 font-medium">{student.program}</p>
              <p className="text-gray-700">Group {student.group}</p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {showEditSuccess && (
          <div className="mx-6 mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            ✓ Activity updated successfully!
          </div>
        )}

        {/* Modules Section */}
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Modules</h3>

          {/* Module Tabs */}
          {availableModules.length > 0 ? (
            <Tabs value={selectedModule} onValueChange={setSelectedModule} className="w-full">
              <div className="border-b border-gray-300">
                {/* Horizontal scroll container for mobile */}
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  <TabsList className="w-fit !bg-transparent rounded-none gap-0 p-0 min-w-full">
                    {availableModules.map((module) => (
                      <TabsTrigger
                        key={module.id}
                        value={module.id}
                        className={`px-3 sm:px-4 md:px-6 py-3 min-w-[120px] sm:min-w-[140px] border-b-2 transition-colors font-bold whitespace-nowrap text-xs sm:text-sm md:text-base ${
                          selectedModule === module.id
                            ? '!bg-blue-600 !text-white border-blue-600 rounded-t-lg data-[state=active]:!bg-blue-600 data-[state=active]:!text-white'
                            : '!bg-transparent !text-gray-700 hover:!text-blue-600 border-transparent hover:border-blue-200 rounded-none data-[state=active]:!bg-transparent'
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
              <p className="text-gray-500">No modules available for this student's program.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
