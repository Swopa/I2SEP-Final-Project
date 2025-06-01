export interface Note {
  id: string;         // Unique identifier
  course: string;     // Associated course
  title: string;      // Title of the note
  content: string;    // Main content of the note
  link?: string;      // Optional link (e.g., to a resource, Drive doc, etc.)
  createdAt: string;  // ISO date string for when the note was created
  // updatedAt?: string; // Optional: ISO date string for last update
}