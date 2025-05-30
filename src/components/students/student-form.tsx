'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Student, Barangay } from '@/types';
import {
  studentSchema,
  StudentFormValues,
  programOptions,
  modalityOptions,
  statusOptions,
  genderOptions
} from '@/validators/student-validators';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface StudentFormProps {
  student?: Student;
  barangays: Barangay[];
  onSubmit: (data: StudentFormValues) => void;
  onCancel: () => void;
}

export function StudentForm({ student, barangays, onSubmit, onCancel }: StudentFormProps) {
  // Initialize form with React Hook Form and Zod validation
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      lrn: student?.lrn || '',
      name: student?.name || '',
      status: student?.status || 'active',
      gender: student?.gender || 'male',
      address: student?.address || '',
      barangayId: student?.barangayId || '',
      program: student?.program || '',
      enrollmentDate: student?.enrollmentDate || new Date().toISOString().split('T')[0],
      modality: student?.modality || 'Face to Face',
      pisScore: student?.pisScore || null,
      assessment: student?.assessment || '',
    },
  });

  // Handle form submission
  const handleSubmit = (data: StudentFormValues) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LRN */}
          <FormField
            control={form.control}
            name="lrn"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-700 font-semibold">Learner Reference Number (LRN)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. 123456789012"
                    maxLength={12}
                    className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-sm text-gray-600">
                  Enter exactly 12 digits
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-700 font-semibold">Full Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. DELA CRUZ, Juan M."
                    className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-700 font-semibold">Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="border-blue-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {statusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Gender */}
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-700 font-semibold">Gender</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="border-blue-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {genderOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Barangay */}
          <FormField
            control={form.control}
            name="barangayId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-700 font-semibold">Barangay</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="border-blue-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select barangay" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {barangays.map(barangay => (
                      <SelectItem key={barangay.id} value={barangay.id}>
                        {barangay.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Address */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-2">
                <FormLabel className="text-blue-700 font-semibold">Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Purok 2, Barangay 1 (POB.), Indang, Cavite"
                    className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Program */}
          <FormField
            control={form.control}
            name="program"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-700 font-semibold">Program</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="border-blue-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select program" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {programOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Enrollment Date */}
          <FormField
            control={form.control}
            name="enrollmentDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-700 font-semibold">Enrollment Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Modality */}
          <FormField
            control={form.control}
            name="modality"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-700 font-semibold">Modality</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="border-blue-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select modality" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {modalityOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* PIS Score */}
          <FormField
            control={form.control}
            name="pisScore"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-700 font-semibold">PIS Score</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g. 85"
                    className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                    {...field}
                    value={field.value === null ? '' : field.value}
                    onChange={e => {
                      const value = e.target.value;
                      field.onChange(value === '' ? null : Number(value));
                    }}
                  />
                </FormControl>
                <FormDescription className="text-sm text-gray-600">
                  Leave blank if not available
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Assessment */}
          <FormField
            control={form.control}
            name="assessment"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-700 font-semibold">Assessment</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Excellent, Good, Satisfactory"
                    className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-sm text-gray-600">
                  Optional assessment remarks
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-blue-200 text-blue-700 hover:bg-blue-50 cursor-pointer transition-all duration-200 hover:shadow-md"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white cursor-pointer transition-all duration-200 hover:shadow-md"
          >
            {student ? 'Update Student' : 'Add Student'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
