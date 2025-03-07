import React from 'react';
import './loading-indicator.scss';

interface LoadingIndicatorProps {
  isVisible: boolean;
  message?: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  isVisible, 
  message = 'Processing...' 
}) => {
  if (!isVisible) return null;
  
  return (
    <div className="loading-indicator-container">
      <div className="loading-spinner"></div>
      <div className="loading-message">{message}</div>
    </div>
  );
};

export default LoadingIndicator; 
