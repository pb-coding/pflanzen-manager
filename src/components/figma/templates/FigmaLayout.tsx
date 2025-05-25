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
    <div className="
      min-h-screen bg-gray-900
      p-4 md:p-6 lg:p-8
      flex justify-center items-start
    ">
      <div className={`
        w-full
        max-w-[390px] md:max-w-2xl lg:max-w-4xl xl:max-w-6xl
        bg-figma-bg-dark
        rounded-none md:rounded-xl lg:rounded-2xl
        overflow-hidden
        shadow-none md:shadow-2xl
        min-h-screen md:min-h-[600px]
        ${className}
      `}>
        <div className="figma-screen">
          {children}
        </div>
      </div>
    </div>
  );
};

export default FigmaLayout;