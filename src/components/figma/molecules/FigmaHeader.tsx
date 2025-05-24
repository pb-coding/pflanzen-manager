import React from 'react';
import FigmaButton from '../atoms/FigmaButton';
import FigmaIcon from '../atoms/FigmaIcon';

interface FigmaHeaderProps {
  title: string;
  onActionClick?: () => void;
  actionIcon?: 'plus' | 'back';
  className?: string;
}

/**
 * FigmaHeader - Header component with title and optional action button
 * Extracted from FigmaDesignTest for reusability
 */
const FigmaHeader: React.FC<FigmaHeaderProps> = ({
  title,
  onActionClick,
  actionIcon = 'plus',
  className = ''
}) => {
  return (
    <div className={`figma-header ${className}`}>
      {/* Action button */}
      {onActionClick && (
        <div className="figma-header-action">
          <FigmaButton variant="icon" onClick={onActionClick}>
            <FigmaIcon name={actionIcon} />
          </FigmaButton>
        </div>
      )}
      
      {/* Title */}
      <div className="figma-header-title">
        <h1 className="figma-text-h1">{title}</h1>
      </div>
    </div>
  );
};

export default FigmaHeader;