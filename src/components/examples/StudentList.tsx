'use client';

import { useStore } from '@/store';
import { useState } from 'react';
import { Student, StudentFilters } from '@/types';

export function StudentList() {
  const students = useStore(state => state.students.filteredData);
  const loading = useStore(state => state.students.loading);
  const error = useStore(state => state.students.error);
  const setFilters = useStore(state => state.students.setFilters);
  const clearFilters = useStore(state => state.students.clearFilters);
  const getBarangayNameById = useStore(state => state.barangays.getBarangayNameById);
  
  const [nameFilter, setNameFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | ''>('');
  
  const handleFilter = () => {
    const filters: StudentFilters = {};
    
    if (nameFilter) {
      filters.name = nameFilter;
    }
    
    if (statusFilter) {
      filters.status = statusFilter as 'active' | 'inactive';
    }
    
    setFilters(filters);
  };
  
  const handleClearFilters = () => {
    setNameFilter('');
    setStatusFilter('');
    clearFilters();
  };
  
  if (loading) {
    return <div>Loading students...</div>;
  }
  
  if (error) {
    return <div>Error: {error}</div>;
  }
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Students</h2>
      
      <div className="flex gap-4 mb-4">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input
            type="text"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="border p-2 rounded"
            placeholder="Filter by name"
          />
        </div>
        
        <div>
          <label className="block text-sm mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'active' | 'inactive' | '')}
            className="border p-2 rounded"
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        
        <div className="flex items-end">
          <button
            onClick={handleFilter}
            className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
          >
            Apply Filters
          </button>
          
          <button
            onClick={handleClearFilters}
            className="bg-gray-300 px-4 py-2 rounded"
          >
            Clear
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border">Name</th>
              <th className="py-2 px-4 border">Status</th>
              <th className="py-2 px-4 border">Gender</th>
              <th className="py-2 px-4 border">Barangay</th>
              <th className="py-2 px-4 border">Program</th>
              <th className="py-2 px-4 border">Enrollment Date</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-4 px-4 text-center">
                  No students found
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id}>
                  <td className="py-2 px-4 border">{student.name}</td>
                  <td className="py-2 px-4 border">
                    <span className={`px-2 py-1 rounded text-xs ${
                      student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="py-2 px-4 border">{student.gender}</td>
                  <td className="py-2 px-4 border">{getBarangayNameById(student.barangayId)}</td>
                  <td className="py-2 px-4 border">{student.program}</td>
                  <td className="py-2 px-4 border">{student.enrollmentDate}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
