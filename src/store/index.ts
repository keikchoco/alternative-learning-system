import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { StoreState } from '@/types';
import { AuthState } from '@/types/auth';

// Import store slices
import { createStudentSlice } from './slices/students.slice';
import { createBarangaySlice } from './slices/barangaySlice';
import { createModuleSlice } from './slices/moduleSlice';
import { createProgressSlice } from './slices/progressSlice';
import { createAuthSlice } from './slices/auth-slice';

// Extended store state with auth
interface ExtendedStoreState extends StoreState {
  auth: AuthState;
}

// Create the store with all slices
export const useStore = create<ExtendedStoreState>()(
  devtools(
    persist(
      immer((...a) => ({
        // Combine all slices
        ...createStudentSlice(...a),
        ...createBarangaySlice(...a),
        ...createModuleSlice(...a),
        ...createProgressSlice(...a),
        ...createAuthSlice(...a),
      })),
      {
        name: 'als-student-tracker',
        // Only persist specific parts of the state
        partialize: (state) => ({
          students: {
            filters: state.students.filters,
          },
          progress: {
            filters: state.progress.filters,
          },
          // Don't persist auth state here as it's handled by the auth service
        }),
      }
    )
  )
);

// Export type for the store
export type AppStore = typeof useStore;

// Export a hook that can be reused to resolve the store
export const useAppStore = useStore;
