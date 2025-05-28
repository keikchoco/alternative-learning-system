'use client';

import { Student, Barangay } from '@/types';
import { StudentFormValues } from '@/validators/student-validators';
import { StudentForm } from './student-form';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface StudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  student?: Student;
  barangays: Barangay[];
  onSubmit: (data: StudentFormValues) => void;
}

export function StudentDialog({
  open,
  onOpenChange,
  title,
  description,
  student,
  barangays,
  onSubmit,
}: StudentDialogProps) {
  const handleSubmit = (data: StudentFormValues) => {
    onSubmit(data);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto border-2 border-blue-200">
        <DialogHeader className="pb-4 border-b border-blue-100">
          <DialogTitle className="text-xl font-bold text-blue-800">{title}</DialogTitle>
          <DialogDescription className="text-gray-600">{description}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <StudentForm
            student={student}
            barangays={barangays}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
