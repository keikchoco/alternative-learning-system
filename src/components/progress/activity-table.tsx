'use client';

import { useState } from 'react';
import { Activity } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Edit, Trash2 } from 'lucide-react';
import { EditActivityModal } from './edit-activity-modal';

interface ActivityTableProps {
  activities: Activity[];
  moduleTitle: string;
  studentId: string;
  moduleId: string;
  onActivityUpdate: (activityIndex: number, activity: Activity) => void;
  onActivityDelete: (activityIndex: number) => void;
  // Student navigation props
  currentStudentIndex?: number;
  totalStudents?: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
  onPreviousStudent?: () => void;
  onNextStudent?: () => void;
  isNavigating?: boolean;
}

export function ActivityTable({
  activities,
  moduleTitle,
  studentId,
  moduleId,
  onActivityUpdate,
  onActivityDelete,
  // Student navigation props
  currentStudentIndex,
  totalStudents,
  hasPrevious,
  hasNext,
  onPreviousStudent,
  onNextStudent,
  isNavigating
}: ActivityTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedActivityIndex, setSelectedActivityIndex] = useState<number>(-1);
  const [isNewActivity, setIsNewActivity] = useState(false);

  // Format date to match the design (MM/DD/YY)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit'
    });
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">
          No activities recorded for {moduleTitle} yet.
        </p>
      </div>
    );
  }

  // Handler functions
  const handleEditActivity = (activity: Activity, index: number) => {
    setSelectedActivity(activity);
    setSelectedActivityIndex(index);
    setIsNewActivity(false);
    setEditModalOpen(true);
  };

  const handleDeleteActivity = (index: number) => {
    if (confirm('Are you sure you want to delete this activity?')) {
      onActivityDelete(index);
    }
  };

  const handleSaveActivity = (activity: Activity) => {
    onActivityUpdate(selectedActivityIndex, activity);
    setEditModalOpen(false);
  };

  const handleCloseModal = () => {
    setEditModalOpen(false);
    setSelectedActivity(null);
    setSelectedActivityIndex(-1);
    setIsNewActivity(false);
  };

  // Pagination logic
  const totalPages = Math.ceil(activities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentActivities = activities.slice(startIndex, endIndex);

  return (
    <div className="space-y-4">
      {/* Activities Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900">Activities</h3>
      </div>

      {/* Activity Table */}
      <div className="overflow-x-auto">
        <Table className="border-4 border-blue-600 dark:border-blue-500">
          <TableHeader>
            <TableRow className="bg-blue-600 dark:bg-blue-700 hover:bg-blue-600 dark:hover:bg-blue-700">
              <TableHead className="text-white font-bold text-left border-r-2 border-blue-500 dark:border-blue-400 px-4 py-3">
                Activity Name
              </TableHead>
              <TableHead className="text-white font-bold text-left border-r-2 border-blue-500 dark:border-blue-400 px-4 py-3">
                Type
              </TableHead>
              <TableHead className="text-white font-bold text-left border-r-2 border-blue-500 dark:border-blue-400 px-4 py-3">
                Score
              </TableHead>
              <TableHead className="text-white font-bold text-left border-r-2 border-blue-500 dark:border-blue-400 px-4 py-3">
                Total
              </TableHead>
              <TableHead className="text-white font-bold text-left border-r-2 border-blue-500 dark:border-blue-400 px-4 py-3">
                Date
              </TableHead>
              <TableHead className="text-white font-bold text-left border-r-2 border-blue-500 dark:border-blue-400 px-4 py-3">
                Remarks
              </TableHead>
              <TableHead className="text-white font-bold text-left px-4 py-3">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentActivities.map((activity, index) => {
              const actualIndex = startIndex + index; // Get the actual index in the full activities array
              return (
                <TableRow
                  key={actualIndex}
                  className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors border-b border-gray-200 dark:border-gray-600 bg-white dark:bg-slate-800"
                >
                  <TableCell className="font-medium border-r border-gray-200 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white">
                    {activity.name}
                  </TableCell>
                  <TableCell className="border-r border-gray-200 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white">
                    {activity.type}
                  </TableCell>
                  <TableCell className="border-r border-gray-200 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white">
                    {activity.score}
                  </TableCell>
                  <TableCell className="border-r border-gray-200 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white">
                    {activity.total}
                  </TableCell>
                  <TableCell className="border-r border-gray-200 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white">
                    {formatDate(activity.date)}
                  </TableCell>
                  <TableCell className="border-r border-gray-200 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white">
                    {activity.remarks}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditActivity(activity, actualIndex)}
                        className="bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-500 dark:hover:bg-blue-600 border-blue-600 dark:border-blue-700 hover:border-blue-500 dark:hover:border-blue-600 cursor-pointer transition-all duration-200 hover:shadow-md"
                        title="Edit Activity"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteActivity(actualIndex)}
                        className="bg-red-600 dark:bg-red-700 text-white hover:bg-red-500 dark:hover:bg-red-600 border-red-600 dark:border-red-700 hover:border-red-500 dark:hover:border-red-600 cursor-pointer transition-all duration-200 hover:shadow-md"
                        title="Delete Activity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Summary Statistics */}
      <div className="bg-gray-100 dark:bg-slate-700 rounded-lg p-4 mt-4">
        <h4 className="font-bold text-gray-900 dark:text-white mb-3">Summary Statistics</h4>
        <div className="text-sm">
          <span className="text-gray-700 dark:text-gray-300">Total Activities: </span>
          <span className="font-medium text-gray-900 dark:text-white">{activities.length}</span>
        </div>
      </div>

      {/* Student Navigation */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">
          {totalStudents !== undefined && currentStudentIndex !== undefined && currentStudentIndex >= 0 ? (
            <>Student {currentStudentIndex + 1} of {totalStudents}</>
          ) : (
            <>{activities.length} activities</>
          )}
        </div>
        {/* Show student navigation if props are provided, otherwise show activity pagination */}
        {totalStudents !== undefined && onPreviousStudent && onNextStudent ? (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onPreviousStudent}
              disabled={!hasPrevious || isNavigating}
              className="bg-blue-600 text-white hover:bg-blue-500 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed cursor-pointer transition-all duration-200 hover:shadow-md flex items-center gap-1"
              title="Previous Student"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onNextStudent}
              disabled={!hasNext || isNavigating}
              className="bg-blue-600 text-white hover:bg-blue-500 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed cursor-pointer transition-all duration-200 hover:shadow-md flex items-center gap-1"
              title="Next Student"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="bg-green-600 text-white hover:bg-green-500 disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer transition-all duration-200 hover:shadow-md"
              title="Previous Page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="bg-green-600 text-white hover:bg-green-500 disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer transition-all duration-200 hover:shadow-md"
              title="Next Page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Edit Activity Modal */}
      <EditActivityModal
        isOpen={editModalOpen}
        onClose={handleCloseModal}
        activity={selectedActivity}
        onSave={handleSaveActivity}
        isNew={isNewActivity}
      />
    </div>
  );
}
