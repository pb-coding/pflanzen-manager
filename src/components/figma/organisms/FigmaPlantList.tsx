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
    <div className={`figma-plant-list ${className}`}>
      {plants.map((plant) => (
        <FigmaPlantCard
          key={plant.id}
          name={plant.name}
          wateringStatus={plant.wateringStatus}
          lastWatered={plant.lastWateredText}
          imageUrl={plant.imageUrl}
          onClick={() => onPlantClick?.(plant.id)}
        />
      ))}
    </div>
  );
};

export default FigmaPlantList;