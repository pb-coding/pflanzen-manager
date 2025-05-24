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
        <div key={index} className={`figma-nav-item ${item.active ? 'active' : ''}`}>
          <div
            className="figma-nav-button"
            onClick={item.onClick}
          >
            <div className="figma-nav-icon">
              <FigmaIcon name={item.icon} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FigmaBottomNav;