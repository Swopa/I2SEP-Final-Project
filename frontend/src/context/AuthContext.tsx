import React, { createContext, useContext, useState } from 'react';
import type { ReactNode, FC } from 'react';


interface User {
  id: string;
  email: string;
  // Add other user properties you might get from backend, e.g., name, roles
}

interface AuthContextType {
  isAuthenticated: boolean; // Indicates if a user is logged in
  user: User | null;      // The logged-in user's data
  login: (email: string, password: string) => Promise<boolean>; // Placeholder login function
  logout: () => void;     // Placeholder logout function
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to easily consume the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode; 
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
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
  };

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