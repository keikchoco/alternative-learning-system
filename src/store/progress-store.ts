import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Student, Progress, ProgressState, ProgressFilters, Barangay, Activity } from '@/types';
import {
  fetchStudents,
  fetchBarangays,
  fetchProgress,
  fetchModules
} from '@/services/api';

// Initial state
const initialState: ProgressState = {
  data: [],
  filteredData: [],
  filters: {},
  statistics: {
    averageScore: 0,
    completionRate: 0,
    moduleDistribution: {},
    activityTypeDistribution: {
      'Assessment': 0,
      'Quiz': 0,
      'Assignment': 0,
      'Activity': 0,
      'Project': 0,
      'Participation': 0
    }
  },
  loading: false,
  error: null,
};

// Create the progress store
export const useProgressStore = create<{
  progress: ProgressState;
  students: Student[];
  barangays: Barangay[];
  searchQuery: string;
  selectedBarangay: string | null;
  loadingBarangays: boolean;
  loadingStudents: boolean;
  errorBarangays: string | null;
  errorStudents: string | null;
  // Actions
  fetchProgress: () => Promise<void>;
  fetchStudents: () => Promise<void>;
  fetchBarangays: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSelectedBarangay: (barangayId: string) => void;
  filterStudents: () => void;
  getFilteredStudents: () => Student[];
  getStudentById: (studentId: string) => Student | undefined;
  getStudentByLrn: (lrn: string) => Student | undefined;
  getProgressByStudentId: (studentId: string) => Progress[];
  updateActivity: (studentId: string, moduleId: string, activityIndex: number, activity: Activity) => Promise<void>;
  deleteActivity: (studentId: string, moduleId: string, activityIndex: number) => Promise<void>;
}>()(
  immer((set, get) => ({
    progress: initialState,
    students: [],
    barangays: [],
    searchQuery: '',
    selectedBarangay: null,
    loadingBarangays: false,
    loadingStudents: false,
    errorBarangays: null,
    errorStudents: null,

    // Fetch progress data
    fetchProgress: async () => {
      set(state => {
        state.progress.loading = true;
        state.progress.error = null;
      });

      try {
        const progressData = await fetchProgress();
        
        set(state => {
          state.progress.data = progressData;
          state.progress.loading = false;
        });

        // Apply current filters
        get().filterStudents();
      } catch (error) {
        set(state => {
          state.progress.error = error instanceof Error ? error.message : 'Failed to fetch progress data';
          state.progress.loading = false;
        });
      }
    },

    // Fetch students data
    fetchStudents: async () => {
      set(state => {
        state.loadingStudents = true;
        state.errorStudents = null;
      });

      try {
        const studentsData = await fetchStudents();
        
        set(state => {
          state.students = studentsData;
          state.loadingStudents = false;
        });

        // Apply current filters
        get().filterStudents();
      } catch (error) {
        set(state => {
          state.errorStudents = error instanceof Error ? error.message : 'Failed to fetch students data';
          state.loadingStudents = false;
        });
      }
    },

    // Fetch barangays data
    fetchBarangays: async () => {
      set(state => {
        state.loadingBarangays = true;
        state.errorBarangays = null;
      });

      try {
        const barangaysData = await fetchBarangays();
        
        set(state => {
          state.barangays = barangaysData;
          state.loadingBarangays = false;
          
          // Set first barangay as selected if none selected
          if (!state.selectedBarangay && barangaysData.length > 0) {
            state.selectedBarangay = barangaysData[0].id;
          }
        });

        // Apply current filters
        get().filterStudents();
      } catch (error) {
        set(state => {
          state.errorBarangays = error instanceof Error ? error.message : 'Failed to fetch barangays data';
          state.loadingBarangays = false;
        });
      }
    },

    // Set search query
    setSearchQuery: (query: string) => {
      set(state => {
        state.searchQuery = query;
      });
      get().filterStudents();
    },

    // Set selected barangay
    setSelectedBarangay: (barangayId: string) => {
      set(state => {
        state.selectedBarangay = barangayId;
      });
      get().filterStudents();
    },

    // Filter students based on current filters
    filterStudents: () => {
      const { students, searchQuery, selectedBarangay } = get();

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

      // Store filtered students separately since ProgressTable expects Student objects
      set(state => {
        state.progress.filteredData = []; // We'll use this for actual progress data if needed
      });
    },

    // Get filtered students for the progress table
    getFilteredStudents: () => {
      const { students, searchQuery, selectedBarangay } = get();

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
    },

    // Get student by ID
    getStudentById: (studentId: string) => {
      return get().students.find(student => student.id === studentId);
    },

    // Get student by LRN
    getStudentByLrn: (lrn: string) => {
      return get().students.find(student => student.lrn === lrn);
    },

    // Get progress records for a specific student
    getProgressByStudentId: (studentId: string) => {
      return get().progress.data.filter(progress => progress.studentId === studentId);
    },

    // Update an existing activity
    updateActivity: async (studentId: string, moduleId: string, activityIndex: number, activity: Activity) => {
      try {
        set(state => {
          const progressRecord = state.progress.data.find(p => p.studentId === studentId && p.moduleId === moduleId);
          if (progressRecord && progressRecord.activities[activityIndex]) {
            progressRecord.activities[activityIndex] = { ...activity };
          }
        });

        // In a real app, this would make an API call to update the backend
        // For now, we'll just simulate the API call
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.error('Error updating activity:', error);
        throw error;
      }
    },



    // Delete an activity
    deleteActivity: async (studentId: string, moduleId: string, activityIndex: number) => {
      try {
        set(state => {
          const progressRecord = state.progress.data.find(p => p.studentId === studentId && p.moduleId === moduleId);
          if (progressRecord && progressRecord.activities[activityIndex]) {
            progressRecord.activities.splice(activityIndex, 1);
          }
        });

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.error('Error deleting activity:', error);
        throw error;
      }
    }
  }))
);
