
// Define expected return types for clarity, even for stubs
interface AuthResponse {
  success: boolean;
  message: string;
  token?: string; // JWT token will be here in a real scenario
  user?: {
    id: string;
    email: string;
    // other user data
  };
}

/**
 * Stubbed signup function.
 * Simulates a signup API call.
 */
export const signup = async (email: string, password: string): Promise<AuthResponse> => {
  console.log('AuthService Stub: Attempting signup...');
  console.log(`Email: ${email}, Password: [hidden for security]`); // Log email, but never raw password

  // Simulate a network delay (optional, but good for testing UI loading states)
  await new Promise(resolve => setTimeout(resolve, 500));

  // Simulate a successful signup response
  return {
    success: true,
    message: 'Signup successful (stubbed)!',
    token: 'dummy-signup-jwt-token-12345',
    user: { id: 'user-signup-1', email: email },
  };

  // You could also simulate an error:
  // return { success: false, message: 'Signup failed: User already exists (stubbed).' };
};

/**
 * Stubbed login function.
 * Simulates a login API call.
 */
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  console.log('AuthService Stub: Attempting login...');
  console.log(`Email: ${email}, Password: [hidden for security]`); // Log email, but never raw password

  // Simulate a network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Simulate a successful login response
  if (email === 'test@example.com' && password === 'password123') {
    return {
      success: true,
      message: 'Login successful (stubbed)!',
      token: 'dummy-login-jwt-token-abcde',
      user: { id: 'user-login-1', email: email },
    };
  } else {
    // Simulate a failed login for incorrect credentials
    return {
      success: false,
      message: 'Login failed: Invalid credentials (stubbed).',
    };
  }
};