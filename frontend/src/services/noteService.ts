import type { Note } from '../types'; // Import the Note type
import { getToken } from '../utils/tokenStorage'; // Import the utility to get the JWT token

const API_BASE_URL = 'http://localhost:3001'; // Ensure this matches your backend URL

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Fetches all notes from the backend.
 * Requires authentication token.
 */
export const fetchAllNotes = async (): Promise<ApiResponse<Note[]>> => {
  const token = getToken();
  if (!token) {
    return { success: false, message: 'Authentication required. No token found.' };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/notes`, { // <--- Backend expects /notes
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Attach the JWT token
      },
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data: data as Note[] };
    } else {
      return {
        success: false,
        message: data.message || `Failed to fetch notes: ${response.statusText}`,
        error: data.error,
      };
    }
  } catch (error) {
    console.error('Network or unexpected error fetching notes:', error);
    return { success: false, message: 'Network error or server unavailable.' };
  }
};

/**
 * Adds a new note to the backend.
 * Requires authentication token.
 */
export const addNote = async (newNote: Omit<Note, 'id' | 'createdAt'>): Promise<ApiResponse<Note>> => { // Omit createdAt as backend generates it
  const token = getToken();
  if (!token) {
    return { success: false, message: 'Authentication required. No token found.' };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/notes`, { // <--- Backend expects /notes
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Attach the JWT token
      },
      body: JSON.stringify(newNote),
    });

    const data = await response.json();

    if (response.ok) { // Check for 2xx status codes (e.g., 201 Created)
      return { success: true, data: data as Note };
    } else {
      return {
        success: false,
        message: data.message || `Failed to add note: ${response.statusText}`,
        error: data.error,
      };
    }
  } catch (error) {
    console.error('Network or unexpected error adding note:', error);
    return { success: false, message: 'Network error or server unavailable.' };
  }
};

// Placeholder for updateNote and deleteNote (to be added in C19 and C20)
export const updateNote = async (id: string, updatedFields: Partial<Omit<Note, 'id' | 'createdAt'>>): Promise<ApiResponse<Note>> => {
    console.log(`NoteService Stub: Updating note ${id} with`, updatedFields);
    return { success: true, message: 'Update not yet implemented.' };
};

export const deleteNote = async (id: string): Promise<ApiResponse<void>> => {
    console.log(`NoteService Stub: Deleting note ${id}`);
    return { success: true, message: 'Delete not yet implemented.' };
};