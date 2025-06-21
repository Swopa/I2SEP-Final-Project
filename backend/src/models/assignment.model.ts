export interface Assignment {
  id: string;           // UUID
  userId: string;       // Foreign key to users table
  title: string;
  description?: string; // Optional description
  dueDate: string;      // ISO 8601 date string for the deadline
  courseTitle?: string; // Optional: For now, a simple string. Could link to a Course ID later.
                        // Or courseId: string; if you link to the courses table.
  status: 'pending' | 'in-progress' | 'completed' | 'archived'; // Example statuses
  createdAt: string;    // ISO 8601 date string
  updatedAt?: string;   // ISO 8601 date string, updated on modification
}

// Helper type for data needed from the client to create a new assignment
export type NewAssignmentData = Pick<Assignment, 'title' | 'dueDate'> &
                               Partial<Pick<Assignment, 'description' | 'courseTitle' | 'status'>>;
                               // userId will come from req.user

// Helper type for data needed to update an assignment
export type UpdateAssignmentData = Partial<Omit<Assignment, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;

/*
-- Schema for 'assignments' table:
-- id TEXT PRIMARY KEY,
-- userId TEXT NOT NULL,
-- title TEXT NOT NULL,
-- description TEXT,
-- dueDate TEXT NOT NULL, -- Store as ISO8601 string
-- courseTitle TEXT,
-- status TEXT NOT NULL DEFAULT 'pending',
-- createdAt TEXT NOT NULL,
-- updatedAt TEXT,
-- FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
*/