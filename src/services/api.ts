import { Student, Barangay, Module, Progress, Event } from '@/types';
import { StorageService } from './storage-service';

// Simulated API service that loads data from JSON files with localStorage persistence
// In a real application, this would be replaced with actual API calls to MongoDB

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Load students data with persistence
export const fetchStudents = async (): Promise<Student[]> => {
  try {
    // Simulate network delay
    await delay(500);

    // Try to load from localStorage first
    let students = StorageService.loadStudents();

    if (!students) {
      // If no persisted data, initialize from static data
      console.log('📥 No persisted student data found, loading from static files...');
      await StorageService.initializeFromStaticData();
      students = StorageService.loadStudents();
    }

    if (!students) {
      // Fallback: load directly from JSON file
      console.log('⚠️ Storage initialization failed, falling back to direct JSON import...');
      const studentsModule = await import('@/data/students.json');
      students = studentsModule.default as Student[];
    }

    console.log(`📊 Loaded ${students.length} students from storage`);
    return students;
  } catch (error) {
    console.error('Error fetching students:', error);
    throw new Error('Failed to fetch students data');
  }
};

// Load barangays data with persistence
export const fetchBarangays = async (): Promise<Barangay[]> => {
  try {
    await delay(300);

    // Try to load from localStorage first
    let barangays = StorageService.loadBarangays();

    if (!barangays) {
      // If no persisted data, initialize from static data
      console.log('📥 No persisted barangay data found, loading from static files...');
      await StorageService.initializeFromStaticData();
      barangays = StorageService.loadBarangays();
    }

    if (!barangays) {
      // Fallback: load directly from JSON file
      console.log('⚠️ Storage initialization failed, falling back to direct JSON import...');
      const barangaysModule = await import('@/data/barangays.json');
      barangays = barangaysModule.default as Barangay[];
    }

    console.log(`📊 Loaded ${barangays.length} barangays from storage`);
    return barangays;
  } catch (error) {
    console.error('Error fetching barangays:', error);
    throw new Error('Failed to fetch barangays data');
  }
};

// Load modules data
export const fetchModules = async (): Promise<Module[]> => {
  try {
    await delay(300);

    // For development, load from JSON file
    const modulesModule = await import('@/data/modules.json');
    const modules: Module[] = modulesModule.default;

    return modules;
  } catch (error) {
    console.error('Error fetching modules:', error);
    throw new Error('Failed to fetch modules data');
  }
};

// Load progress data with persistence
export const fetchProgress = async (): Promise<Progress[]> => {
  try {
    await delay(400);

    // Try to load from localStorage first
    let progress = StorageService.loadProgress();

    if (!progress) {
      // If no persisted data, initialize from static data
      console.log('📥 No persisted progress data found, loading from static files...');
      await StorageService.initializeFromStaticData();
      progress = StorageService.loadProgress();
    }

    if (!progress) {
      // Fallback: load directly from JSON file
      console.log('⚠️ Storage initialization failed, falling back to direct JSON import...');
      const progressModule = await import('@/data/progress.json');
      progress = progressModule.default as Progress[];
    }

    console.log(`📊 Loaded ${progress.length} progress records from storage`);
    return progress;
  } catch (error) {
    console.error('Error fetching progress:', error);
    throw new Error('Failed to fetch progress data');
  }
};

// Create a new student with persistence
export const createStudent = async (student: Omit<Student, 'id'>): Promise<Student> => {
  try {
    await delay(600);

    // Generate a new ID (in a real app, this would be done by the backend)
    const newStudent: Student = {
      ...student,
      id: `student-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    // Persist the new student to localStorage
    StorageService.addStudent(newStudent);

    console.log(`✅ Created and persisted new student: ${newStudent.name} (${newStudent.id})`);
    return newStudent;
  } catch (error) {
    console.error('Error creating student:', error);
    throw new Error('Failed to create student');
  }
};

// Update an existing student with persistence
export const updateStudent = async (student: Student): Promise<Student> => {
  try {
    await delay(600);

    // Persist the updated student to localStorage
    StorageService.updateStudent(student);

    console.log(`✅ Updated and persisted student: ${student.name} (${student.id})`);
    return student;
  } catch (error) {
    console.error('Error updating student:', error);
    throw new Error('Failed to update student');
  }
};

// Delete a student with persistence
export const deleteStudent = async (id: string): Promise<void> => {
  try {
    await delay(600);

    // Remove the student from localStorage
    StorageService.removeStudent(id);

    console.log(`✅ Deleted and removed student from storage: ${id}`);
  } catch (error) {
    console.error('Error deleting student:', error);
    throw new Error('Failed to delete student');
  }
};

// Create a new progress record with persistence
export const createProgress = async (progress: Omit<Progress, 'id'>): Promise<Progress> => {
  try {
    await delay(500);

    // Generate a new ID
    const newProgress: Progress = {
      ...progress,
      id: `progress-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    // Persist the new progress to localStorage
    StorageService.addProgress(newProgress);

    console.log(`✅ Created and persisted new progress record: ${newProgress.id}`);
    return newProgress;
  } catch (error) {
    console.error('Error creating progress:', error);
    throw new Error('Failed to create progress record');
  }
};

// Update an existing progress record with persistence
export const updateProgress = async (progress: Progress): Promise<Progress> => {
  try {
    await delay(500);

    // Persist the updated progress to localStorage
    StorageService.updateProgress(progress);

    console.log(`✅ Updated and persisted progress record: ${progress.id}`);
    return progress;
  } catch (error) {
    console.error('Error updating progress:', error);
    throw new Error('Failed to update progress record');
  }
};

// Delete a progress record with persistence
export const deleteProgress = async (id: string): Promise<void> => {
  try {
    await delay(500);

    // Remove the progress from localStorage
    StorageService.removeProgress(id);

    console.log(`✅ Deleted and removed progress record: ${id}`);
  } catch (error) {
    console.error('Error deleting progress:', error);
    throw new Error('Failed to delete progress record');
  }
};

// Load events data
export const fetchEvents = async (): Promise<Event[]> => {
  try {
    await delay(300);

    // For development, load directly from JSON file
    const eventsModule = await import('@/data/events.json');
    const events: Event[] = eventsModule.default;

    return events;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw new Error('Failed to fetch events data');
  }
};

// Create a new event
export const createEvent = async (event: Omit<Event, 'id'>): Promise<Event> => {
  try {
    await delay(500);

    // Generate a new ID
    const newEvent: Event = {
      ...event,
      id: `event-${Date.now()}`
    };

    // In a real app, this would be a POST request to the API
    return newEvent;
  } catch (error) {
    console.error('Error creating event:', error);
    throw new Error('Failed to create event');
  }
};

// Update an existing event
export const updateEvent = async (event: Event): Promise<Event> => {
  try {
    await delay(500);

    // In a real app, this would be a PUT request to the API
    return event;
  } catch (error) {
    console.error('Error updating event:', error);
    throw new Error('Failed to update event');
  }
};

// Delete an event
export const deleteEvent = async (id: string): Promise<void> => {
  try {
    await delay(500);

    // In a real app, this would be a DELETE request to the API
    return;
  } catch (error) {
    console.error('Error deleting event:', error);
    throw new Error('Failed to delete event');
  }
};
