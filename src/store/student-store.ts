import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Student, StudentState, Barangay } from '@/types';
import { User } from '@/types/auth';
import {
  fetchStudents,
  fetchBarangays,
  createStudent,
  updateStudent,
  deleteStudent
} from '@/services/api';

// Initial state
const initialState: StudentState = {
  data: [],
  filteredData: [],
  filters: {},
  statistics: {
    totalStudents: 0,
    activeStudents: 0,
    inactiveStudents: 0,
    maleCount: 0,
    femaleCount: 0,
    programDistribution: {},
    barangayDistribution: {},
  },
  loading: false,
  error: null,
};

// Create the student store
export const useStudentStore = create<{
  students: StudentState;
  barangays: Barangay[];
  searchQuery: string;
  selectedBarangay: string | null;
  loadingBarangays: boolean;
  errorBarangays: string | null;
  // Actions
  fetchStudents: () => Promise<void>;
  fetchBarangays: (user?: User | null) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSelectedBarangay: (barangayId: string) => void;
  filterStudents: () => void;
  addStudent: (student: Omit<Student, '_id'>) => Promise<Student>;
  editStudent: (student: Student) => Promise<Student>;
  removeStudent: (id: string) => Promise<void>;
  initializeWithUser: (user: User | null) => Promise<void>;
}>()(
  immer((set, get) => ({
    students: initialState,
    barangays: [],
    searchQuery: '',
    selectedBarangay: null, // Will be set to first barangay when barangays are loaded
    loadingBarangays: false,
    errorBarangays: null,

    // Fetch students
    fetchStudents: async () => {
      set(state => {
        state.students.loading = true;
        state.students.error = null;
      });

      try {
        const students = await fetchStudents();

        set(state => {
          state.students.data = students;
          state.students.filteredData = students;
          state.students.loading = false;

          // Calculate statistics
          state.students.statistics = {
            totalStudents: students.length,
            activeStudents: students.filter(s => s.status === 'active').length,
            inactiveStudents: students.filter(s => s.status === 'inactive').length,
            maleCount: students.filter(s => s.gender === 'male').length,
            femaleCount: students.filter(s => s.gender === 'female').length,
            programDistribution: students.reduce((acc, student) => {
              acc[student.program] = (acc[student.program] || 0) + 1;
              return acc;
            }, {} as Record<string, number>),
            barangayDistribution: students.reduce((acc, student) => {
              acc[student.barangayId] = (acc[student.barangayId] || 0) + 1;
              return acc;
            }, {} as Record<string, number>),
          };
        });

        // Apply any existing filters
        get().filterStudents();
      } catch (error) {
        set(state => {
          state.students.loading = false;
          state.students.error = error instanceof Error ? error.message : 'Failed to fetch students';
        });
      }
    },

    // Fetch barangays with optional user context for proper barangay selection
    fetchBarangays: async (user?: User | null) => {
      set(state => {
        state.loadingBarangays = true;
        state.errorBarangays = null;
      });

      try {
        const barangays = await fetchBarangays();

        set(state => {
          state.barangays = barangays;
          state.loadingBarangays = false;

          // Smart barangay selection based on user role
          if (!state.selectedBarangay && barangays.length > 0) {
            if (user?.role === 'admin' && user?.assignedBarangayId) {
              // For Regular Admin: select their assigned barangay
              const assignedBarangay = barangays.find(b => b.id === user.assignedBarangayId);
              if (assignedBarangay) {
                state.selectedBarangay = assignedBarangay.id;
              } else {
                // Fallback to first barangay if assigned barangay not found
                state.selectedBarangay = barangays[0].id;
              }
            } else {
              // For Master Admin or no user: select first barangay
              state.selectedBarangay = barangays[0].id;
            }
          }
        });

        // Re-filter students after barangays are loaded
        get().filterStudents();
      } catch (error) {
        set(state => {
          state.loadingBarangays = false;
          state.errorBarangays = error instanceof Error ? error.message : 'Failed to fetch barangays';
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

    // Filter students based on search query and selected barangay
    filterStudents: () => {
      const { searchQuery, selectedBarangay, students } = get();

      set(state => {
        // Start with all students
        let filtered = students.data;

        // Always filter by barangay (since one is always selected now)
        if (selectedBarangay) {
          filtered = filtered.filter(student => student.barangayId === selectedBarangay);
        }

        // Filter by search query if provided
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(student =>
            student.name.toLowerCase().includes(query) ||
            student.lrn.toLowerCase().includes(query) ||
            student._id.toLowerCase().includes(query) ||
            student.address.toLowerCase().includes(query) ||
            student.program.toLowerCase().includes(query) ||
            student.status.toLowerCase().includes(query) ||
            student.gender.toLowerCase().includes(query)
          );
        }

        state.students.filteredData = filtered;
      });
    },

    // Add a new student
    addStudent: async (studentData: Omit<Student, '_id'>) => {
      set(state => {
        state.students.loading = true;
        state.students.error = null;
      });

      try {
        const newStudent = await createStudent(studentData);

        set(state => {
          state.students.data.push(newStudent);
          state.students.loading = false;
        });

        // Re-apply filters
        get().filterStudents();

        return newStudent;
      } catch (error) {
        set(state => {
          state.students.loading = false;
          state.students.error = error instanceof Error ? error.message : 'Failed to add student';
        });
        throw error;
      }
    },

    // Edit an existing student
    editStudent: async (updatedStudent: Student) => {
      set(state => {
        state.students.loading = true;
        state.students.error = null;
      });

      try {
        const result = await updateStudent(updatedStudent);

        set(state => {
          const index = state.students.data.findIndex(s => s._id === updatedStudent._id);
          if (index !== -1) {
            state.students.data[index] = result;
          }
          state.students.loading = false;
        });

        // Re-apply filters
        get().filterStudents();

        return result;
      } catch (error) {
        set(state => {
          state.students.loading = false;
          state.students.error = error instanceof Error ? error.message : 'Failed to update student';
        });
        throw error;
      }
    },

    // Remove a student
    removeStudent: async (id: string) => {
      set(state => {
        state.students.loading = true;
        state.students.error = null;
      });

      try {
        await deleteStudent(id);

        set(state => {
          state.students.data = state.students.data.filter(s => s._id !== id);
          state.students.loading = false;
        });

        // Re-apply filters
        get().filterStudents();
      } catch (error) {
        set(state => {
          state.students.loading = false;
          state.students.error = error instanceof Error ? error.message : 'Failed to delete student';
        });
        throw error;
      }
    },

    // Initialize store with user context for proper barangay selection
    initializeWithUser: async (user: User | null) => {
      try {
        await Promise.all([
          get().fetchStudents(),
          get().fetchBarangays(user)
        ]);
      } catch (error) {
        console.error('Error initializing student store with user context:', error);
      }
    },
  }))
);
