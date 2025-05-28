import { Student, Barangay, Module, Progress, Event } from '@/types';

// Simulated API service that loads data from JSON files
// In a real application, this would be replaced with actual API calls to MongoDB

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Load students data
export const fetchStudents = async (): Promise<Student[]> => {
  try {
    // Simulate network delay
    await delay(500);

    // For development, load directly from JSON file
    // In a real app, this would be replaced with an API call:
    // const response = await fetch('/api/students');
    // const students = await response.json();

    const studentsModule = await import('@/data/students.json');
    const students: Student[] = studentsModule.default;

    return students;
  } catch (error) {
    console.error('Error fetching students:', error);
    throw new Error('Failed to fetch students data');
  }
};

// Load barangays data
export const fetchBarangays = async (): Promise<Barangay[]> => {
  try {
    await delay(300);

    // For development, load from JSON file
    const barangaysModule = await import('@/data/barangays.json');
    const barangays: Barangay[] = barangaysModule.default;

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

// Load progress data
export const fetchProgress = async (): Promise<Progress[]> => {
  try {
    await delay(400);

    // For development, load from JSON file
    const progressModule = await import('@/data/progress.json');
    const progress: Progress[] = progressModule.default;

    return progress;
  } catch (error) {
    console.error('Error fetching progress:', error);
    throw new Error('Failed to fetch progress data');
  }
};

// Create a new student
export const createStudent = async (student: Omit<Student, 'id'>): Promise<Student> => {
  try {
    await delay(600);

    // Generate a new ID (in a real app, this would be done by the backend)
    const newStudent: Student = {
      ...student,
      id: `student-${Date.now()}`
    };

    // In a real app, this would be a POST request to the API
    // For now, we'll just return the new student
    return newStudent;
  } catch (error) {
    console.error('Error creating student:', error);
    throw new Error('Failed to create student');
  }
};

// Update an existing student
export const updateStudent = async (student: Student): Promise<Student> => {
  try {
    await delay(600);

    // In a real app, this would be a PUT request to the API
    // For now, we'll just return the updated student
    return student;
  } catch (error) {
    console.error('Error updating student:', error);
    throw new Error('Failed to update student');
  }
};

// Delete a student
export const deleteStudent = async (id: string): Promise<void> => {
  try {
    await delay(600);

    // In a real app, this would be a DELETE request to the API
    // For now, we'll just simulate success
    return;
  } catch (error) {
    console.error('Error deleting student:', error);
    throw new Error('Failed to delete student');
  }
};

// Create a new progress record
export const createProgress = async (progress: Omit<Progress, 'id'>): Promise<Progress> => {
  try {
    await delay(500);

    // Generate a new ID
    const newProgress: Progress = {
      ...progress,
      id: `progress-${Date.now()}`
    };

    // In a real app, this would be a POST request to the API
    return newProgress;
  } catch (error) {
    console.error('Error creating progress:', error);
    throw new Error('Failed to create progress record');
  }
};

// Update an existing progress record
export const updateProgress = async (progress: Progress): Promise<Progress> => {
  try {
    await delay(500);

    // In a real app, this would be a PUT request to the API
    return progress;
  } catch (error) {
    console.error('Error updating progress:', error);
    throw new Error('Failed to update progress record');
  }
};

// Delete a progress record
export const deleteProgress = async (id: string): Promise<void> => {
  try {
    await delay(500);

    // In a real app, this would be a DELETE request to the API
    return;
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
