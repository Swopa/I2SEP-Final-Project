const BACKEND_BASE_URL = 'http://localhost:3001';


interface AuthResponse {
  success: boolean;
  message: string;
  token?: string; 
  user?: {
    id: string;
    email: string;
  };
}

export const signup = async (email: string, password: string): Promise<AuthResponse> => {
  //console.log('AuthService Stub: Attempting signup...');
  //console.log(`Email: ${email}, Password: [hidden for security]`); // Log email, but never raw password
  // Simulate a network delay (optional, but good for testing UI loading states)
  //await new Promise(resolve => setTimeout(resolve, 500));
console.log('AuthService: Attempting real signup...');
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/signup`, { // Real API endpoint
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json(); // Parse the JSON response from backend

    if (response.ok) { // Check if HTTP status is 2xx (e.g., 200, 201)
      console.log('AuthService: Signup successful, response data:', data);
      return {
        success: true,
        message: data.message || 'Signup successful!',
        token: data.token, // Expect backend to send a token
        user: data.user,   // Expect backend to send user data
      };
    } else {
      // Handle non-2xx responses (e.g., 400, 401, 500)
      console.error('AuthService: Signup failed, response data:', data);
      return {
        success: false,
        message: data.message || 'Signup failed due to an unknown error.',
      };
    }
  } catch (error) {
    // This catches network errors (server not running, CORS issues, etc.)
    console.error('AuthService: Error during signup API call:', error);
    return { success: false, message: 'Network error or server unavailable. Check backend console.' };
  }

};


export const login = async (email: string, password: string): Promise<AuthResponse> => {
  //console.log('AuthService Stub: Attempting login...');
  //console.log(`Email: ${email}, Password: [hidden for security]`); // Log email, but never raw password
  // Simulate a network delay
  //await new Promise(resolve => setTimeout(resolve, 500));

  console.log('AuthService: Attempting real login...');
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/login`, { // Real API endpoint
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('AuthService: Login successful, response data:', data);
      return {
        success: true,
        message: data.message || 'Login successful!',
        token: data.token,
        user: data.user,
      };
    } else {
      console.error('AuthService: Login failed, response data:', data);
      return {
        success: false,
        message: data.message || 'Login failed due to invalid credentials.',
      };
    }
  } catch (error) {
    console.error('AuthService: Error during login API call:', error);
    return { success: false, message: 'Network error or server unavailable. Check backend console.' };
  }
};