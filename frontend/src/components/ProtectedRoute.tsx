import React from 'react';
import { Navigate } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext'; 
interface ProtectedRouteProps {
  children: React.ReactNode; 
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', fontSize: '1.2em', color: 'var(--light-text-color)' }}>
        Authenticating...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;