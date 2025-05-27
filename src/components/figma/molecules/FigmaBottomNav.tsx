import React from 'react';
import FigmaIcon from '../atoms/FigmaIcon';

interface FigmaBottomNavItem {
  icon: 'plus' | 'home' | 'plant' | 'settings' | 'back' | 'chevron-down' | 'camera';
  label: string;
  active?: boolean;
  onClick?: () => void;
}

interface FigmaBottomNavProps {
  items: FigmaBottomNavItem[];
  className?: string;
}

/**
 * FigmaBottomNav - Bottom navigation component
 * Shows navigation items with icons and labels
 */
const FigmaBottomNav: React.FC<FigmaBottomNavProps> = ({
  items,
  className = ''
}) => {
  return (
    <nav className={`figma-bottom-nav ${className}`}>
      <div className="figma-flex justify-around items-center max-w-md mx-auto">
        {items.map((item, index) => (
          <button
            key={index}
            className={`figma-nav-item ${item.active ? 'active' : ''}`}
            onClick={item.onClick}
          >
            <div className="figma-nav-icon">
              <FigmaIcon name={item.icon} />
            </div>
            <span className="figma-text-small">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default FigmaBottomNav;