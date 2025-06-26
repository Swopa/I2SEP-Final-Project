// frontend/src/components/LoadingOverlay.tsx

import React from 'react';
import '../App.css'; // This will contain the styling for the overlay and spinner

interface LoadingOverlayProps {
  isLoading: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading }) => {
  if (!isLoading) {
    return null; // Don't render anything if not loading
  }

  return (
    <div className="modal-overlay loading-overlay"> {/* Reusing modal-overlay class for backdrop */}
      <div className="spinner"></div>
      <p style={{ color: 'white', marginTop: 'var(--spacing-unit)', fontSize: '1.2em' }}>Loading...</p>
    </div>
  );
};

export default LoadingOverlay;