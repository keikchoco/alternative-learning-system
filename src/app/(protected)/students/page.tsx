'use client';

import { useState, useEffect } from 'react';
import { useStudentStore } from '@/store/student-store';
import { useAuthStore } from '@/store/auth-store';
import { Student, StudentFormValues } from '@/types';

// Components
import { Button } from '@/components/ui/button';
import { BarangayTabs } from '@/components/students/barangay-tabs';
import { BarangayTabsSkeleton } from '@/components/students/barangay-tabs-skeleton';
import { SearchBar } from '@/components/students/search-bar';
import { StudentTable } from '@/components/students/student-table';
import { StudentTableSkeleton } from '@/components/students/student-table-skeleton';
import { StudentDialog } from '@/components/students/student-dialog';
import { StudentDetailsDialog } from '@/components/students/student-details-dialog';
import { ConfirmationDialog } from '@/components/students/confirmation-dialog';
import { Plus } from 'lucide-react';

export default function StudentsPage() {
  // Get user from auth store
  const user = useAuthStore(state => state.auth.user);

  // Get student store state and actions
  const {
    students,
    barangays,
    searchQuery,
    selectedBarangay,
    loadingBarangays,
    fetchStudents,
    fetchBarangays,
    setSearchQuery,
    setSelectedBarangay,
    addStudent,
    editStudent,
    removeStudent
  } = useStudentStore();

  // Local state for dialogs
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchStudents();
    fetchBarangays();
  }, [fetchStudents, fetchBarangays]);

  // For regular admin, the barangay selection will be automatically handled
  // by the store when barangays are loaded (it will auto-select the first available barangay)
  // Since filteredBarangays will only contain their assigned barangay, this works correctly

  // Handle add student
  const handleAddStudent = async (data: StudentFormValues) => {
    try {
      await addStudent(data);
    } catch (error) {
      console.error('Error adding student:', error);
    }
  };

  // Handle edit student
  const handleEditStudent = async (data: StudentFormValues) => {
    if (!selectedStudent) return;

    try {
      await editStudent({
        ...data,
        id: selectedStudent.id
      });
    } catch (error) {
      console.error('Error updating student:', error);
    }
  };

  // Handle delete student
  const handleDeleteStudent = async () => {
    if (!selectedStudent) return;

    try {
      await removeStudent(selectedStudent.id);
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  // Open edit dialog
  const openEditDialog = (student: Student) => {
    setSelectedStudent(student);
    setEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (student: Student) => {
    setSelectedStudent(student);
    setDeleteDialogOpen(true);
  };

  // Open details dialog
  const openDetailsDialog = (student: Student) => {
    setSelectedStudent(student);
    setDetailsDialogOpen(true);
  };

  // Filter barangays based on user role
  const filteredBarangays = user?.role === 'admin' && user?.assignedBarangayId
    ? barangays.filter(b => b.id === user.assignedBarangayId)
    : barangays;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">STUDENT MASTERLIST</h1>
        <SearchBar
          onSearch={setSearchQuery}
          initialValue={searchQuery}
          placeholder="Search students..."
        />
      </div>

      {/* Barangay Tabs */}
      {loadingBarangays ? (
        <BarangayTabsSkeleton />
      ) : (
        <BarangayTabs
          barangays={filteredBarangays}
          selectedBarangay={selectedBarangay}
          onSelectBarangay={setSelectedBarangay}
        />
      )}

      {/* Student Table */}
      <div className="bg-white rounded-lg shadow-lg border-4 border-blue-600">
        <div className="p-1">
          {students.loading ? (
            <StudentTableSkeleton />
          ) : (
            <StudentTable
              students={students.filteredData}
              barangays={barangays}
              onEdit={openEditDialog}
              onDelete={openDeleteDialog}
              onRowClick={openDetailsDialog}
            />
          )}
        </div>
      </div>

      {/* Add Student Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => setAddDialogOpen(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Student
        </Button>
      </div>

      {/* Add Student Dialog */}
      <StudentDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        title="Add New Student"
        description="Fill in the details to add a new student to the system."
        barangays={barangays}
        onSubmit={handleAddStudent}
      />

      {/* Edit Student Dialog */}
      {selectedStudent && (
        <StudentDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          title="Edit Student"
          description="Update the student's information."
          student={selectedStudent}
          barangays={barangays}
          onSubmit={handleEditStudent}
        />
      )}

      {/* Student Details Dialog */}
      <StudentDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        student={selectedStudent}
        barangays={barangays}
      />

      {/* Delete Confirmation Dialog */}
      {selectedStudent && (
        <ConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Student"
          description={`Are you sure you want to delete ${selectedStudent.name}? This action cannot be undone.`}
          onConfirm={handleDeleteStudent}
        />
      )}
    </div>
  );
}
