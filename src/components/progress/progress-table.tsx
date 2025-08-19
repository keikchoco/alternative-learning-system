'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Student, Barangay } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useSearchStore } from '@/store/search-store';

interface ProgressTableProps {
  students: Student[];
  barangays: Barangay[];
  selectedBarangay: string | null;
}

export function ProgressTable({
  students,
  barangays,
  selectedBarangay
}: ProgressTableProps) {
  const router = useRouter();
  const { query: searchQuery } = useSearchStore();

  // Filter students based on selected barangay and search query
  const filteredStudents = useMemo(() => {
    let filtered = [...students];

    // Filter by barangay
    if (selectedBarangay) {
      filtered = filtered.filter(student => student.barangayId === selectedBarangay);
    }

    // Filter by search query (name or LRN)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(query) ||
        student.lrn.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [students, selectedBarangay, searchQuery]);

  // Handle activity summary click
  const handleActivitySummary = (student: Student) => {
    router.push(`/progress/${student.lrn}`);
  };

  // Get barangay name by ID
  const getBarangayName = (barangayId: string) => {
    const barangay = barangays.find(b => b.id === barangayId);
    return barangay ? barangay.name : 'Unknown';
  };

  if (filteredStudents.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">
          {searchQuery ? 'No students found matching your search.' : 'No students found.'}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-blue-600 dark:bg-blue-700 hover:bg-blue-600 dark:hover:bg-blue-700">
            <TableHead className="text-white font-bold text-left">
              LEARNER'S ID NO.
            </TableHead>
            <TableHead className="text-white font-bold text-left">
              NAME
            </TableHead>
            <TableHead className="text-white font-bold text-left">
              GRADE LEVEL
            </TableHead>
            <TableHead className="text-white font-bold text-left">
              GROUP
            </TableHead>
            <TableHead className="text-white font-bold text-left">
              ACTION
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredStudents.map((student, index) => (
            <TableRow
              key={student._id}
              className={`${
                index % 2 === 0
                  ? 'bg-gray-50 dark:bg-slate-700'
                  : 'bg-white dark:bg-slate-800'
              } hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer`}
              onClick={() => handleActivitySummary(student)}
            >
              <TableCell className="text-left font-medium text-gray-900 dark:text-white">
                {student.lrn}
              </TableCell>
              <TableCell className="text-left text-gray-900 dark:text-white">
                {student.name}
              </TableCell>
              <TableCell className="text-left text-gray-900 dark:text-white">
                {student.program}
              </TableCell>
              <TableCell className="text-left text-gray-900 dark:text-white">
                Group {student.group}
              </TableCell>
              <TableCell className="text-left">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleActivitySummary(student);
                  }}
                  variant="outline"
                  size="sm"
                  className="bg-green-600 dark:bg-green-700 text-white hover:bg-green-500 dark:hover:bg-green-600 border-green-600 dark:border-green-700 hover:border-green-500 dark:hover:border-green-600 cursor-pointer transition-all duration-200 hover:shadow-md"
                >
                  VIEW MODULES
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
