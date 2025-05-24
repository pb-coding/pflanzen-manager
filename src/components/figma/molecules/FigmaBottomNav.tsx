import React from 'react';
import FigmaIcon from '../atoms/FigmaIcon';

interface NavItem {
  icon: 'home' | 'plant' | 'settings';
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
    <div className={`figma-bottom-nav ${className}`}>
      {items.map((item, index) => (
        <button
          key={index}
          className={`figma-nav-item ${item.active ? 'active' : ''}`}
          onClick={item.onClick}
        >
          <div className="figma-nav-icon">
            <FigmaIcon name={item.icon} />
          </div>
        </button>
      ))}
    </div>
  );
};

export default FigmaBottomNav;