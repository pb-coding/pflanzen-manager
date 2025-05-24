import React from 'react';
import { WateringEntry } from '../../../services/waterManagement';

interface FigmaWateringHistoryProps {
  wateringEntries: WateringEntry[];
}

/**
 * FigmaWateringHistory - Bewässerungshistorie Sektion
 * Basierend auf Figma Design 27-2
 */
const FigmaWateringHistory: React.FC<FigmaWateringHistoryProps> = ({
  wateringEntries
}) => {
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="figma-watering-history">
      {/* Section Title */}
      <div className="figma-watering-history-header">
        <h2 className="figma-text-h2">Watering History</h2>
      </div>

      {/* History Entries */}
      <div className="figma-watering-history-content">
        {wateringEntries.length === 0 ? (
          <div className="figma-watering-history-empty">
            <span className="figma-text-body">No watering history yet</span>
          </div>
        ) : (
          wateringEntries.map((entry) => (
            <div key={entry.id} className="figma-watering-history-entry">
              <div className="figma-watering-history-entry-left">
                <span className="figma-text-body">Watered</span>
              </div>
              <div className="figma-watering-history-entry-right">
                <div className="figma-watering-history-entry-date">
                  <span className="figma-text-small figma-text-accent">
                    {formatDate(entry.date)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FigmaWateringHistory;