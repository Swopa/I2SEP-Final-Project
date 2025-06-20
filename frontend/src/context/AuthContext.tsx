import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode, FC } from 'react';
import { saveToken, getToken, removeToken } from '../utils/tokenStorage';


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
  // isLoadingAuth: boolean
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

  useEffect(() => {
    // setIsLoadingAuth(true); // Set loading true
    const storedToken = getToken(); 
    if (storedToken) {
      // For the stub, we just assume a token means authenticated
      setIsAuthenticated(true);
      setUser({ id: 'persisted-user', email: 'persisted@example.com' }); // Dummy user for persisted session
      console.log('AuthContext: User authenticated from persisted token.');
    } else {
      setIsAuthenticated(false);
      setUser(null);
      console.log('AuthContext: No persisted token found.');
    }
    // setIsLoadingAuth(false); // Set loading false
  }, []); 

 
  const login = async (email: string, password: string): Promise<boolean> => {
    const response = await (await import('../services/AuthService')).login(email, password);

    if (response.success && response.user && response.token) {
      saveToken(response.token);
      setIsAuthenticated(true);
      setUser(response.user);
      console.log('AuthContext: Login successful and token saved.');
      return true;
    } else {
      console.log('AuthContext: Login failed.');
      removeToken(); // Ensure any old token is cleared on failed login
      setIsAuthenticated(false);
      setUser(null);
      return false;
    }
  };
    

  const logout = () => {
    removeToken();
    setIsAuthenticated(false);
    setUser(null);
    console.log('AuthContext: User logged out and token removed.');
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