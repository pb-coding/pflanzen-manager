import React from 'react';

interface FigmaScreenProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  bottomNav?: React.ReactNode;
  className?: string;
}

/**
 * FigmaScreen - Screen-level layout template
 * Provides header, content area, and bottom navigation structure
 */
const FigmaScreen: React.FC<FigmaScreenProps> = ({ 
  children, 
  header,
  bottomNav,
  className = '' 
}) => {
  return (
    <div className={`figma-screen ${className}`}>
      {/* Header */}
      {header && header}
      
      {/* Main Content */}
      <div className="figma-content">
        {children}
      </div>
      
      {/* Bottom Navigation */}
      {bottomNav && bottomNav}
    </div>
  );
};

export default FigmaScreen;