import React from 'react';

interface FigmaWateringScheduleProps {
  nextWatering?: Date;
  wateringFrequencyDays?: number;
  wateringStatus: string;
}

/**
 * FigmaWateringSchedule - Bewässerungsplan Sektion
 * Basierend auf Figma Design 27-2
 */
const FigmaWateringSchedule: React.FC<FigmaWateringScheduleProps> = ({
  nextWatering,
  wateringFrequencyDays = 7,
  wateringStatus
}) => {
  const formatFrequency = (days: number): string => {
    if (days === 1) return 'Every day';
    if (days === 7) return 'Every 7 days';
    if (days === 14) return 'Every 2 weeks';
    if (days === 30) return 'Every month';
    return `Every ${days} days`;
  };

  return (
    <div className="figma-watering-schedule">
      {/* Section Title */}
      <div className="figma-watering-schedule-header">
        <h2 className="figma-text-h2">Watering Schedule</h2>
      </div>

      {/* Schedule Info */}
      <div className="figma-watering-schedule-content">
        <div className="figma-watering-schedule-info">
          <div className="figma-watering-schedule-left">
            <div className="figma-watering-schedule-label">
              <span className="figma-text-body-medium">Next watering</span>
            </div>
            <div className="figma-watering-schedule-frequency">
              <span className="figma-text-small figma-text-accent">
                {formatFrequency(wateringFrequencyDays)}
              </span>
            </div>
          </div>
          <div className="figma-watering-schedule-right">
            <div className="figma-watering-schedule-status">
              <span className="figma-text-body">{wateringStatus}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FigmaWateringSchedule;