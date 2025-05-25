import React from 'react';
import FigmaIcon from '../atoms/FigmaIcon';

interface NavItem {
  icon: 'home' | 'plant' | 'settings';
  label: string;
  active?: boolean;
  onClick?: () => void;
}

interface FigmaBottomNavProps {
  items: NavItem[];
  className?: string;
}

/**
 * FigmaBottomNav - Bottom navigation component
 * Extracted from FigmaDesignTest for reusability
 */
const FigmaBottomNav: React.FC<FigmaBottomNavProps> = ({
  items,
  className = ''
}) => {
  return (
    <nav className={`
      bg-figma-card-bg border-t border-figma-border
      p-2 md:p-4
      ${className}
    `}>
      <div className="flex justify-around items-center max-w-md mx-auto">
        {items.map((item, index) => (
          <button
            key={index}
            className={`
              flex flex-col items-center gap-1 p-2 min-w-[60px]
              md:flex-row md:gap-2 md:px-4 md:min-w-[100px]
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-figma-accent-green
              ${item.active
                ? 'text-figma-text-white'
                : 'text-figma-accent-green hover:text-figma-text-white'
              }
            `}
            onClick={item.onClick}
          >
            <div className="w-6 h-6 md:w-5 md:h-5 flex items-center justify-center">
              <FigmaIcon name={item.icon} />
            </div>
            <span className="text-xs md:text-sm font-medium">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default FigmaBottomNav;