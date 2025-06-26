// frontend/src/utils/apiClient.ts

import { getToken } from './tokenStorage';
import { useLoading } from '../context/LoadingContext'; // <--- Import useLoading
import { useRef } from 'react'; // <--- Import useRef to hold context functions

// Base URL for your backend API (no /api prefix based on your server.ts)
const BACKEND_BASE_URL = 'http://localhost:3001';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

// Global variables to hold loading context functions
// This pattern allows non-React components (like this utility) to interact with React Context.
// The `useApiClientContext` hook ensures these are set within React's lifecycle.
let _startLoading: (() => void) | null = null;
let _stopLoading: (() => void) | null = null;

/**
 * Hook to initialize the API client with React context functions.
 * Call this hook once at a top level component (e.g., App.tsx)
 * to allow the apiClient to control the global loading state.
 */
export const useApiClientContext = () => {
  const { startLoading, stopLoading } = useLoading();

  // Use useRef to hold the latest functions provided by the context.
  // This ensures that the global variables (_startLoading, _stopLoading)
  // always reference the most up-to-date functions from the currently
  // rendered context provider.
  const startLoadingRef = useRef(startLoading);
  const stopLoadingRef = useRef(stopLoading);

  startLoadingRef.current = startLoading;
  stopLoadingRef.current = stopLoading;

  // Assign to global variables for use in makeAuthenticatedRequest
  _startLoading = startLoadingRef.current;
  _stopLoading = stopLoadingRef.current;
};


const makeAuthenticatedRequest = async <T>(
  endpoint: string,
  method: string = 'GET',
  body?: object | FormData
): Promise<ApiResponse<T>> => {
  const token = getToken();

  const headers: HeadersInit = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let requestBody: string | FormData | undefined;
  if (body) {
    if (body instanceof FormData) {
      requestBody = body;
    } else {
      headers['Content-Type'] = 'application/json';
      requestBody = JSON.stringify(body);
    }
  }

  // --- Start Global Loading ---
  _startLoading?.(); // Call startLoading if the function is available

  try {
    const response = await fetch(`${BACKEND_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: requestBody,
    });

    // Handle authentication errors globally (e.g., redirect to login)
    if (response.status === 401 || response.status === 403) {
        // In a real app, you might trigger `logout()` from AuthContext here
        // or a global redirect to login. For now, just log.
        console.error("Authentication required or forbidden. Please log in.");
    }

    const responseData = await response.json().catch(() => ({})); // Try to parse, catch if no JSON body

    if (!response.ok) { // Check if HTTP status is NOT 2xx
      return {
        success: false,
        message: responseData.message || `API error: ${response.statusText}`,
        error: responseData.error || 'Request failed',
        statusCode: response.status
      };
    }

    // Success response (status 2xx)
    // For 204 No Content, data will be null/empty, but success is true
    if (response.status === 204) {
        return { success: true, data: null as T, message: 'Operation successful (No Content).', statusCode: response.status };
    }

    return {
      success: true,
      data: responseData as T,
      message: responseData.message || 'Success',
      statusCode: response.status
    };

  } catch (networkError: any) {
    console.error(`Network or unexpected error during ${method} ${endpoint}:`, networkError);
    return {
      success: false,
      message: 'Network error. Please check your internet connection or server status.',
      error: networkError.message || 'Unknown network error'
    };
  } finally {
    // --- Stop Global Loading ---
    _stopLoading?.(); // Call stopLoading regardless of success or failure
  }
};

// Export specific HTTP method functions for convenience
export const api = {
  get: <T>(endpoint: string) => makeAuthenticatedRequest<T>(endpoint, 'GET'),
  post: <T>(endpoint: string, body: object | FormData) => makeAuthenticatedRequest<T>(endpoint, 'POST', body),
  put: <T>(endpoint: string, body: object | FormData) => makeAuthenticatedRequest<T>(endpoint, 'PUT', body),
  delete: <T>(endpoint: string) => makeAuthenticatedRequest<T>(endpoint, 'DELETE'),
};