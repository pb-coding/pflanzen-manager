import React from 'react';

interface FigmaNotesSectionProps {
  notes?: string;
}

/**
 * FigmaNotesSection - Notes Sektion für Plant Detail
 * Basierend auf Figma Design 27-2
 */
const FigmaNotesSection: React.FC<FigmaNotesSectionProps> = ({
  notes
}) => {
  const defaultNotes = "Add care notes for this plant to help you remember important information about watering, light requirements, and other care tips.";

  return (
    <div className="figma-notes-section">
      {/* Section Title */}
      <div className="figma-notes-section-header">
        <h2 className="figma-text-h2">Notes</h2>
      </div>

      {/* Notes Content */}
      <div className="figma-notes-section-content">
        <p className="figma-text-body">
          {notes || defaultNotes}
        </p>
      </div>
    </div>
  );
};

export default FigmaNotesSection;