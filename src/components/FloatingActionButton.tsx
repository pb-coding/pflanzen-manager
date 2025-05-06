import React from 'react';

interface FloatingActionButtonProps {
  onClick: () => void;
  color?: 'primary' | 'secondary';
  icon?: 'plus' | 'camera' | 'leaf';
  ariaLabel?: string;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  color = 'primary',
  icon = 'plus',
  ariaLabel = 'Action Button',
}) => {
  const colorClass = color === 'primary' ? 'fab-primary' : 'fab-secondary';
  
  // Render the appropriate icon
  const renderIcon = () => {
    switch (icon) {
      case 'camera':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
            <circle cx="12" cy="13" r="4"></circle>
          </svg>
        );
      case 'leaf':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 22l10-10"></path>
            <path d="M16 8l-4 4"></path>
            <path d="M18 2c-1.8 1.8-4 3-6.5 3.5C8 6 2 12 2 12s5.5 6 12 6c1.3 0 2.5-.2 3.6-.5"></path>
            <path d="M20 9c.5-.5 1.5-.5 2 0s.5 1.5 0 2-3 1-3-1 .5-1.5 1-1z"></path>
            <path d="M15.1 2.8c-.1-.1-.1-.1 0 0-4 4-5 8-5 8s4 1 8-3c0 0 .1-.1 0 0"></path>
          </svg>
        );
      default:
        return <span className="text-2xl leading-none">+</span>;
    }
  };
  
  return (
    <button
      onClick={onClick}
      className={`fab ${colorClass}`}
      aria-label={ariaLabel}
    >
      {renderIcon()}
    </button>
  );
};

export default FloatingActionButton;
