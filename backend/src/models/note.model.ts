// backend/src/models/note.model.ts
export interface Note {
  id: string;
  userId: string;     // Essential for user association
  course?: string;    // Optional: Name of the course (was courseTitle)
  title: string;
  content: string;
  link?: string;      // Optional: A URL link
  createdAt: string;
  // No 'tags' in this new structure
}

// Data needed from the client to create or update a new note.
// Title and content are required. Course and link are optional.
export type NoteDataPayload = Pick<Note, 'title' | 'content'> & Partial<Pick<Note, 'course' | 'link'>>;