import React from 'react';

interface FigmaInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'number';
  disabled?: boolean;
  className?: string;
}

/**
 * FigmaInput - Input component for forms
 * Basierend auf Figma Design 26-170
 */
const FigmaInput: React.FC<FigmaInputProps> = ({
  placeholder,
  value,
  onChange,
  type = 'text',
  disabled = false,
  className = ''
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      disabled={disabled}
      className={`figma-input ${className}`}
    />
  );
};

export default FigmaInput;