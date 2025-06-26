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
  logout: () => void; 
  isLoadingAuth: boolean;
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
  const [user, setUser] = useState<User | null>(null); 
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);

  useEffect(() => {
    const checkAuthStatus = async () => { // Made async to simulate potential async token validation later
      setIsLoadingAuth(true); // Ensure loading is true at start
      const storedToken = getToken();

      if (storedToken) {
        // In a real app, you'd decode/validate the token on the backend or frontend.
        // For now, if a token exists, we consider it authenticated.
        setIsAuthenticated(true);
        // Using a placeholder user. Later, you might decode user info from the token.
        // Or make a call to a /me endpoint to get the user's current profile from backend.
        setUser({ id: 'persisted-user-id', email: 'persisted@example.com' });
        console.log('AuthContext: User authenticated from persisted token.');
      } else {
        setIsAuthenticated(false);
        setUser(null);
        console.log('AuthContext: No persisted token found.');
      }
      setIsLoadingAuth(false); // <--- Set loading to false once check is complete
    };

    checkAuthStatus();
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
    isLoadingAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};