import React from 'react';

interface FigmaToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

/**
 * FigmaToggle - Toggle switch component
 * Basierend auf Figma Design 26-170
 */
const FigmaToggle: React.FC<FigmaToggleProps> = ({
  checked,
  onChange,
  className = ''
}) => {
  const handleClick = () => {
    onChange(!checked);
  };

  return (
    <div 
      className={`figma-toggle ${checked ? 'active' : ''} ${className}`}
      onClick={handleClick}
    >
      <div className="figma-toggle-handle" />
    </div>
  );
};

export default FigmaToggle;