// frontend/src/context/LoadingContext.tsx

import React, { createContext, useContext, useState } from 'react';
import type { FC, ReactNode } from 'react'; // Using type-only imports for ReactNode and FC

// Define the shape of the Loading Context
interface LoadingContextType {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

// Create the context
const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

// Custom hook to consume the LoadingContext
export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

// Props for the LoadingProvider component
interface LoadingProviderProps {
  children: ReactNode;
}

// LoadingProvider component that manages and provides the loading state
export const LoadingProvider: FC<LoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false); // Initial loading state is false

  // Functions to change the loading state
  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);

  // The value provided to consumers of this context
  const contextValue: LoadingContextType = {
    isLoading,
    startLoading,
    stopLoading,
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
    </LoadingContext.Provider>
  );
};