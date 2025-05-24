import React, { useState } from 'react';
import FigmaIcon from './FigmaIcon';

interface FigmaDropdownProps {
  placeholder: string;
  options: string[];
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

/**
 * FigmaDropdown - Dropdown component for plant type selection
 * Basierend auf Figma Design 26-170
 */
const FigmaDropdown: React.FC<FigmaDropdownProps> = ({
  placeholder,
  options,
  value,
  onChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className={`figma-dropdown ${className}`}>
      <div 
        className="figma-dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`figma-text-body ${value ? '' : 'figma-dropdown-placeholder'}`}>
          {value || placeholder}
        </span>
        <div className="figma-dropdown-icon">
          <FigmaIcon name="chevron-down" />
        </div>
      </div>
      
      {isOpen && (
        <div className="figma-dropdown-menu">
          {options.map((option) => (
            <div
              key={option}
              className="figma-dropdown-option"
              onClick={() => handleSelect(option)}
            >
              <span className="figma-text-body">{option}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FigmaDropdown;