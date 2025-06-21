// backend/src/models/course.model.ts
export interface Course {
  id: string;         // UUID
  userId: string;     // Foreign key referencing User.id
  title: string;
  // instructor?: string; // Optional, as per original project description's DB schema
  // schedule?: string;   // Optional
  createdAt: string;  // ISO 8601 date string
  // updatedAt?: string; // Optional
}

// Helper type for creating a new course (userId will come from req.user)
export type NewCourseData = Pick<Course, 'title'>; // Initially, user only provides title
// export type NewCourse = Omit<Course, 'id' | 'createdAt'>; // If service layer constructs full object