'use client';

import { Student, Barangay } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, User, GraduationCap, Monitor, FileText, Hash } from 'lucide-react';

interface StudentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  barangays: Barangay[];
}

export function StudentDetailsDialog({
  open,
  onOpenChange,
  student,
  barangays,
}: StudentDetailsDialogProps) {
  if (!student) return null;

  const barangay = barangays.find(b => b.id === student.barangayId);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto border-2 border-blue-200">
        <DialogHeader className="pb-4 border-b border-blue-100">
          <DialogTitle className="text-xl font-bold text-blue-800">Student Details</DialogTitle>
          <DialogDescription className="text-gray-600">
            Complete information for {student.name}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-8">
          {/* Header with LRN and Status */}
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <Hash className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-600">Learner Reference Number (LRN)</p>
                  <p className="text-2xl font-bold text-blue-900">{student.lrn}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge
                  variant={student.status === 'active' ? 'default' : 'secondary'}
                  className={`text-sm px-3 py-1 ${student.status === 'active'
                    ? 'bg-green-100 text-green-800 hover:bg-green-100 border-green-300'
                    : 'bg-red-100 text-red-800 hover:bg-red-100 border-red-300'
                  }`}
                >
                  {student.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-500 mb-1">Full Name</p>
                  <p className="text-lg font-semibold text-gray-900">{student.name}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-500 mb-1">Gender</p>
                  <p className="text-base text-gray-900 capitalize">{student.gender}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-500 mb-1">Barangay</p>
                  <p className="text-base text-gray-900">{barangay?.name || 'Unknown'}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-500 mb-1">Enrollment Date</p>
                  <p className="text-base text-gray-900">{formatDate(student.enrollmentDate)}</p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-500 mb-1">Complete Address</p>
                <p className="text-base text-gray-900">{student.address}</p>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div>
            <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
              <GraduationCap className="h-5 w-5 mr-2" />
              Academic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-500 mb-1">Program</p>
                <p className="text-base font-semibold text-gray-900">{student.program}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-500 mb-1">Learning Modality</p>
                <p className="text-base text-gray-900">{student.modality}</p>
              </div>

              {student.pisScore !== null && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-500 mb-1">PIS Score</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-lg font-bold text-blue-600">{student.pisScore}%</p>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${student.pisScore}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {student.assessment && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-500 mb-1">Assessment</p>
                  <p className="text-base text-gray-900">{student.assessment}</p>
                </div>
              )}
            </div>
          </div>

          {/* System Information */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              System Information
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-500 mb-1">Internal Student ID</p>
              <p className="text-sm text-gray-600 font-mono">{student.id}</p>
              <p className="text-xs text-gray-500 mt-1">This is the system-generated unique identifier for this student record.</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
