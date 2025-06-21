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

// Placeholder for updateAssignment and deleteAssignment (to be added in C14)
export const updateAssignment = async (id: string, updatedFields: Partial<Assignment>): Promise<ApiResponse<Assignment>> => {
    console.log(`AssignmentService Stub: Updating assignment ${id} with`, updatedFields);
    return { success: true, message: 'Update not yet implemented.' };
};

export const deleteAssignment = async (id: string): Promise<ApiResponse<void>> => {
    console.log(`AssignmentService Stub: Deleting assignment ${id}`);
    return { success: true, message: 'Delete not yet implemented.' };
};