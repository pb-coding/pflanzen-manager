import React from 'react';

interface FigmaLayoutProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
  className?: string;
}

/**
 * FigmaLayout - Main layout container for Figma screens
 * Provides the 390px mobile container with proper styling
 */
const FigmaLayout: React.FC<FigmaLayoutProps> = ({ 
  children, 
  showBottomNav = true,
  className = '' 
}) => {
  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-900 p-4">
      <div className={`figma-container ${className}`}>
        <div className="figma-screen">
          {children}
        </div>
      </div>
    </div>
  );
};

export default FigmaLayout;