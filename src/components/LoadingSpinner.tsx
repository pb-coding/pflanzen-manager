import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'white';
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = 'primary',
  message,
}) => {
  // Size classes
  const sizeClasses = {
    small: 'w-5 h-5',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  // Color classes for the spinner
  const getSpinnerStyle = () => {
    switch (color) {
      case 'primary':
        return {
          borderColor: 'rgba(124, 181, 24, 0.2)',
          borderLeftColor: 'var(--color-green-primary)',
        };
      case 'secondary':
        return {
          borderColor: 'rgba(91, 192, 235, 0.2)',
          borderLeftColor: 'var(--color-blue-light)',
        };
      case 'white':
        return {
          borderColor: 'rgba(255, 255, 255, 0.2)',
          borderLeftColor: 'white',
        };
      default:
        return {
          borderColor: 'rgba(124, 181, 24, 0.2)',
          borderLeftColor: 'var(--color-green-primary)',
        };
    }
  };

  // Border width based on size
  const getBorderWidth = () => {
    switch (size) {
      case 'small': return '2px';
      case 'medium': return '3px';
      case 'large': return '4px';
      default: return '3px';
    }
  };

  const spinnerStyle = getSpinnerStyle();
  const borderWidth = getBorderWidth();

  return (
    <div className="flex flex-col items-center justify-center animate-fade-in">
      <div
        className={`${sizeClasses[size]} rounded-full animate-spin`}
        style={{
          borderWidth,
          borderStyle: 'solid',
          borderColor: spinnerStyle.borderColor,
          borderLeftColor: spinnerStyle.borderLeftColor,
        }}
        role="status"
        aria-label="Loading"
      />
      {message && (
        <p className="mt-3 text-sm font-medium" style={{ color: 'var(--color-anthracite)' }}>
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
