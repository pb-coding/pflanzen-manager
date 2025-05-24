import React from 'react';
import FigmaPlantCard from '../molecules/FigmaPlantCard';
import { FigmaPlantView } from '../../../services/waterManagement';

interface FigmaPlantListProps {
  plants: FigmaPlantView[];
  onPlantClick?: (plantId: string) => void;
  className?: string;
}

/**
 * FigmaPlantList - Container for plant cards
 * Handles the list layout and plant interactions
 */
const FigmaPlantList: React.FC<FigmaPlantListProps> = ({
  plants,
  onPlantClick,
  className = ''
}) => {
  return (
    <div className={`figma-flex figma-flex-col ${className}`}>
      {plants.map((plant) => (
        <div
          key={plant.id}
          className="figma-p-base"
        >
          <FigmaPlantCard
            name={plant.name}
            wateringStatus={plant.wateringStatus}
            lastWatered={plant.lastWateredText}
            imageUrl={plant.imageUrl}
            onClick={() => onPlantClick?.(plant.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default FigmaPlantList;