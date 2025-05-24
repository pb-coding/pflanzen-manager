import React from 'react';

interface FigmaFormFieldProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * FigmaFormField - Form field with label
 * Basierend auf Figma Design 26-170
 */
const FigmaFormField: React.FC<FigmaFormFieldProps> = ({
  label,
  children,
  className = ''
}) => {
  return (
    <div className={`figma-form-field ${className}`}>
      <div className="figma-form-field-content">
        <div className="figma-form-field-label">
          <label className="figma-text-body-medium">{label}</label>
        </div>
        <div className="figma-form-field-input">
          {children}
        </div>
      </div>
    </div>
  );
};

export default FigmaFormField;