import { Student, Barangay, Module, Progress, Event } from "@/types";
import { StorageService } from "./storage-service";

// Simulated API service that loads data from JSON files with localStorage persistence
// In a real application, this would be replaced with actual API calls to MongoDB

// Helper function to simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Load students data
export const fetchStudents = async (): Promise<Student[]> => {
  try {
    let students: Student[] = [];
    const res = await fetch("/api/students", {
      method: "GET",
    });
    if (res.ok) {
      const response = await res.json();
      students = response as Student[];
    }
    console.log(`📊 Loaded ${students?.length} students from storage`);
    return students;
  } catch (error) {
    console.error("Error fetching students:", error);
    throw new Error("Failed to fetch students data");
  }
};

// Load barangays data with persistence
export const fetchBarangays = async (): Promise<Barangay[]> => {
  try {
    let barangays: Barangay[] = [];

    const res = await fetch("/api/barangays", {
      method: "GET",
    });
    if (res.ok) {
      const response = await res.json();
      barangays = response as Barangay[];
    }

    console.log(`📊 Loaded ${barangays.length} barangays from storage`);
    return barangays;
  } catch (error) {
    console.error("Error fetching barangays:", error);
    throw new Error("Failed to fetch barangays data");
  }
};

// Load modules data
export const fetchModules = async (): Promise<Module[]> => {
  try {
    await delay(300);

    // For development, load from JSON file
    const modulesModule = await import("@/data/modules.json");
    const modules: Module[] = modulesModule.default as Module[];

    return modules;
  } catch (error) {
    console.error("Error fetching modules:", error);
    throw new Error("Failed to fetch modules data");
  }
};

// Load progress data with persistence
export const fetchProgress = async (): Promise<Progress[]> => {
  try {
    let progress: Progress[] = [];

    const res = await fetch("/api/progress", {
      method: "GET",
    });
    if (res.ok) {
      const response = await res.json();
      progress = response as Progress[];
    }

    console.log(`📊 Loaded ${progress.length} progress records from storage`);
    return progress;
  } catch (error) {
    console.error("Error fetching progress:", error);
    throw new Error("Failed to fetch progress data");
  }
};

// Create a new student with persistence
export const createStudent = async (
  student: Omit<Student, "_id">
): Promise<Student> => {
  try {
    const res = await fetch("/api/students", {
      method: "POST",
      body: JSON.stringify(student),
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Check if the response is not successful
    if (!res.ok) {
      throw new Error("Failed to create student");
    }

    const response = await res.json();
    const newStudent: Student = {
      ...student,
      _id: response.data.insertedId.toString()
    };

    console.log(
      `✅ Created new student: ${newStudent.name} (${newStudent._id})`
    );
    return newStudent;
  } catch (error) {
    console.error("Error creating student:", error);
    throw new Error("Failed to create student");
  }
};

// Update an existing student with persistence
export const updateStudent = async (student: Student): Promise<Student> => {
  try {
    const res = await fetch("/api/students", {
      method: "PATCH",
      body: JSON.stringify(student),
      headers: {
        "Content-Type": "application/json",
      },
    });
    // Check if the response is not successful
    if (!res.ok) {
      throw new Error("Failed to update student");
    }
    
    console.log(`✅ Updated student: ${student.name} (${student._id})`);
    return student;
  } catch (error) {
    console.error("Error updating student:", error);
    throw new Error("Failed to update student");
  }
};

// Delete a student with persistence
export const deleteStudent = async (_id: string): Promise<void> => {
  try {
    const res = await fetch(`/api/students`, {
      method: "DELETE",
      body: JSON.stringify({ _id }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error("Failed to delete student");
    }

    console.log(`✅ Deleted and removed student from storage: ${_id}`);
  } catch (error) {
    console.error("Error deleting student:", error);
    throw new Error("Failed to delete student");
  }
};

// Create a new progress record with persistence
export const createProgress = async (
  progress: Omit<Progress, "id">
): Promise<Progress> => {
  try {
    await delay(500);

    // Generate a new ID
    const newProgress: Progress = {
      ...progress,
      id: `progress-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    // Persist the new progress to localStorage
    StorageService.addProgress(newProgress);

    console.log(
      `✅ Created and persisted new progress record: ${newProgress.id}`
    );
    return newProgress;
  } catch (error) {
    console.error("Error creating progress:", error);
    throw new Error("Failed to create progress record");
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
    console.error("Error updating progress:", error);
    throw new Error("Failed to update progress record");
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
    console.error("Error deleting progress:", error);
    throw new Error("Failed to delete progress record");
  }
};

// Load events data
export const fetchEvents = async (): Promise<Event[]> => {
  try {
    await delay(300);

    // For development, load directly from JSON file
    const eventsModule = await import("@/data/events.json");
    const events: Event[] = eventsModule.default as Event[];

    return events;
  } catch (error) {
    console.error("Error fetching events:", error);
    throw new Error("Failed to fetch events data");
  }
};

// Create a new event
export const createEvent = async (event: Omit<Event, "id">): Promise<Event> => {
  try {
    await delay(500);

    // Generate a new ID
    const newEvent: Event = {
      ...event,
      id: `event-${Date.now()}`,
    };

    // In a real app, this would be a POST request to the API
    return newEvent;
  } catch (error) {
    console.error("Error creating event:", error);
    throw new Error("Failed to create event");
  }
};

// Update an existing event
export const updateEvent = async (event: Event): Promise<Event> => {
  try {
    await delay(500);

    // In a real app, this would be a PUT request to the API
    return event;
  } catch (error) {
    console.error("Error updating event:", error);
    throw new Error("Failed to update event");
  }
};

// Delete an event
export const deleteEvent = async (id: string): Promise<void> => {
  try {
    await delay(500);

    // In a real app, this would be a DELETE request to the API
    return;
  } catch (error) {
    console.error("Error deleting event:", error);
    throw new Error("Failed to delete event");
  }
};
