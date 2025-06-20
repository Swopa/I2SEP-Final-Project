import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

// Define the shape of your user (example, will be more detailed later)
interface User {
  id: string;
  email: string;
  // Add other user properties you might get from backend, e.g., name, roles
}

// Define the shape of the AuthContext
interface AuthContextType {
  isAuthenticated: boolean; // Indicates if a user is logged in
  user: User | null;      // The logged-in user's data
  login: (email: string, password: string) => Promise<boolean>; // Placeholder login function
  logout: () => void;     // Placeholder logout function
}

// Create the AuthContext with a default value
// The default value is used when a component tries to consume the context
// without being wrapped by its Provider. It's often a good practice to
// throw an error for un-provided contexts to catch development mistakes.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to easily consume the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component that will wrap your application
// It manages the authentication state and provides it to its children
interface AuthProviderProps {
  children: ReactNode; // ReactNode type allows any valid React child (elements, strings, numbers, fragments, etc.)
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // State to track authentication status and user data
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false); // Starts as false
  const [user, setUser] = useState<User | null>(null); // No user initially

  // --- Placeholder Auth Functions ---
  // These will be replaced by actual API calls in later tasks (B6 & B7)
  const login = async (email: string, password: string): Promise<boolean> => {
    console.log(`AuthContext Stub: Attempting to log in user: ${email}`);
    // Simulate a successful login for now
    setIsAuthenticated(true);
    setUser({ id: 'stub-user-id-123', email: email });
    console.log('AuthContext Stub: Login successful!');
    return true; // Indicate success
  };

  const logout = () => {
    console.log('AuthContext Stub: Logging out user.');
    setIsAuthenticated(false);
    setUser(null);
    // In later tasks, this will also clear the JWT from local storage
  };

  // The value provided to consumers of this context
  const contextValue: AuthContextType = {
    isAuthenticated,
    user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};