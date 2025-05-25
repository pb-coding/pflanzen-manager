import React from 'react';
import FigmaButton from '../atoms/FigmaButton';
import FigmaIcon from '../atoms/FigmaIcon';

interface ActionConfig {
  icon: 'plus' | 'back' | 'settings' | 'home' | 'plant' | 'camera';
  onClick: () => void;
}

interface FigmaHeaderProps {
  title: string;
  
  // New flexible action props
  leftAction?: ActionConfig;
  rightAction?: ActionConfig;
  
  // Backward compatibility props (deprecated but supported)
  onActionClick?: () => void;
  actionIcon?: 'plus' | 'back';
  
  className?: string;
}

/**
 * FigmaHeader - Enhanced header component with flexible left and right action buttons
 * Supports both new leftAction/rightAction props and legacy actionIcon for backward compatibility
 */
const FigmaHeader: React.FC<FigmaHeaderProps> = ({
  title,
  leftAction,
  rightAction,
  onActionClick,
  actionIcon = 'plus',
  className = ''
}) => {
  // Backward compatibility: convert legacy props to new format
  const resolvedLeftAction = leftAction || (onActionClick && actionIcon === 'back' ? { icon: actionIcon, onClick: onActionClick } : undefined);
  const resolvedRightAction = rightAction || (onActionClick && actionIcon === 'plus' ? { icon: actionIcon, onClick: onActionClick } : undefined);

  return (
    <div className={`figma-header ${className}`}>
      {/* Left Action */}
      <div className="figma-header-left">
        {resolvedLeftAction && (
          <div className="figma-header-action">
            <FigmaButton variant="icon" onClick={resolvedLeftAction.onClick}>
              <FigmaIcon name={resolvedLeftAction.icon} />
            </FigmaButton>
          </div>
        )}
      </div>
      
      {/* Title */}
      <div className="figma-header-title">
        <h1 className="figma-text-h1">{title}</h1>
      </div>
      
      {/* Right Action */}
      <div className="figma-header-right">
        {resolvedRightAction && (
          <div className="figma-header-action">
            <FigmaButton variant="icon" onClick={resolvedRightAction.onClick}>
              <FigmaIcon name={resolvedRightAction.icon} />
            </FigmaButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default FigmaHeader;