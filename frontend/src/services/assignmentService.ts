import type { Assignment } from '../types'; // Import the Assignment type
import { getToken } from '../utils/tokenStorage'; // Import the utility to get the JWT token

const API_BASE_URL = 'http://localhost:3001'; // Ensure this matches your backend URL

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Fetches all assignments from the backend.
 * Requires authentication token.
 */
export const fetchAllAssignments = async (): Promise<ApiResponse<Assignment[]>> => {
  const token = getToken();
  if (!token) {
    return { success: false, message: 'Authentication required. No token found.' };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/assignments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Attach the JWT token
      },
    });

    const data = await response.json();

    if (response.ok) { // Check for 2xx status codes
      return { success: true, data: data as Assignment[] };
    } else {
      return {
        success: false,
        message: data.message || `Failed to fetch assignments: ${response.statusText}`,
        error: data.error,
      };
    }
  } catch (error) {
    console.error('Network or unexpected error fetching assignments:', error);
    return { success: false, message: 'Network error or server unavailable.' };
  }
};

/**
 * Adds a new assignment to the backend.
 * Requires authentication token.
 */
export const addAssignment = async (newAssignment: Omit<Assignment, 'id'>): Promise<ApiResponse<Assignment>> => {
  const token = getToken();
  if (!token) {
    return { success: false, message: 'Authentication required. No token found.' };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/assignments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Attach the JWT token
      },
      body: JSON.stringify(newAssignment),
    });

    const data = await response.json();

    if (response.ok) { // Check for 2xx status codes (e.g., 201 Created)
      return { success: true, data: data as Assignment };
    } else {
      return {
        success: false,
        message: data.message || `Failed to add assignment: ${response.statusText}`,
        error: data.error,
      };
    }
  } catch (error) {
    console.error('Network or unexpected error adding assignment:', error);
    return { success: false, message: 'Network error or server unavailable.' };
  }
};

/**
 * Updates an existing assignment in the backend.
 * Requires authentication token.
 * @param id The ID of the assignment to update.
 * @param updatedFields An object containing the fields to update.
 */
export const updateAssignment = async (id: string, updatedFields: Partial<Omit<Assignment, 'id'>>): Promise<ApiResponse<Assignment>> => { // <--- UPDATED
  const token = getToken();
  if (!token) {
    return { success: false, message: 'Authentication required. No token found.' };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/assignments/${id}`, { // <--- Backend expects ID in URL
      method: 'PUT', // or 'PATCH' depending on backend
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updatedFields),
    });

    const data = await response.json();

    if (response.ok) { // Check for 2xx status codes
      return { success: true, data: data as Assignment };
    } else {
      return {
        success: false,
        message: data.message || `Failed to update assignment: ${response.statusText}`,
        error: data.error,
      };
    }
  } catch (error) {
    console.error(`Network or unexpected error updating assignment ${id}:`, error);
    return { success: false, message: 'Network error or server unavailable.' };
  }
};

// Placeholder for deleteAssignment (to be added later)
export const deleteAssignment = async (id: string): Promise<ApiResponse<void>> => {
    console.log(`AssignmentService Stub: Deleting assignment ${id}`);
    return { success: true, message: 'Delete not yet implemented.' };
};