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

/**
 * Updates an existing note in the backend.
 * Requires authentication token.
 * @param id The ID of the note to update.
 * @param updatedFields An object containing the fields to update.
 */
export const updateNote = async (id: string, updatedFields: Partial<Omit<Note, 'id' | 'createdAt'>>): Promise<ApiResponse<Note>> => { // <--- UPDATED
  const token = getToken();
  if (!token) {
    return { success: false, message: 'Authentication required. No token found.' };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, { // <--- Backend expects ID in URL
      method: 'PUT', // or 'PATCH' depending on backend
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updatedFields),
    });

    const data = await response.json();

    if (response.ok) { // Check for 2xx status codes
      return { success: true, data: data as Note };
    } else {
      return {
        success: false,
        message: data.message || `Failed to update note: ${response.statusText}`,
        error: data.error,
      };
    }
  } catch (error) {
    console.error(`Network or unexpected error updating note ${id}:`, error);
    return { success: false, message: 'Network error or server unavailable.' };
  }
};

/**
 * Deletes a note from the backend.
 * Requires authentication token.
 * @param id The ID of the note to delete.
 */
export const deleteNote = async (id: string): Promise<ApiResponse<void>> => { // <--- UPDATED
  const token = getToken();
  if (!token) {
    return { success: false, message: 'Authentication required. No token found.' };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, { // <--- Backend expects ID in URL
      method: 'DELETE', // HTTP DELETE method
      headers: {
        'Authorization': `Bearer ${token}`, // Attach the JWT token
      },
    });

    // Backend might return an empty body for successful delete (204 No Content)
    // or a JSON object with a message.
    // We try to parse JSON, but handle if it's empty.
    let data = {};
    try {
        data = await response.json();
    } catch (e) {
        // If response is 204 No Content, response.json() will throw an error
        // We can ignore this for successful deletions
        if (response.status !== 204) {
            console.warn('Response was not JSON but not 204 No Content:', e);
        }
    }


    if (response.ok) { // Check for 2xx status codes (e.g., 200 OK, 204 No Content)
      return { success: true, message: (data as any).message || 'Note deleted successfully.' };
    } else {
      return {
        success: false,
        message: (data as any).message || `Failed to delete note: ${response.statusText}`,
        error: (data as any).error,
      };
    }
  } catch (error) {
    console.error(`Network or unexpected error deleting note ${id}:`, error);
    return { success: false, message: 'Network error or server unavailable.' };
  }
};