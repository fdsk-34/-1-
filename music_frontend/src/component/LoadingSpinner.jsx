import React from 'react';
import '../styles/LoadingSpinner.css';

const LoadingSpinner = ({ message }) => {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p>{message || '로딩 중...'}</p>
    </div>
  );
};

export default LoadingSpinner;