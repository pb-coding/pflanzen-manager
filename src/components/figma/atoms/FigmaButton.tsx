import React from 'react';

interface FigmaButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'icon';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

/**
 * FigmaButton - Reusable button component following Figma design system
 */
const FigmaButton: React.FC<FigmaButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  className = '',
  disabled = false,
  type = 'button'
}) => {
  const baseClasses = 'figma-button';
  const variantClasses = {
    primary: 'figma-button-primary',
    icon: 'figma-button-icon'
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default FigmaButton;