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
    <div className={`
      /* Mobile: Single column list */
      space-y-0 divide-y divide-figma-border
      
      /* Tablet: 2-column grid */
      md:grid md:grid-cols-2 md:gap-4 md:space-y-0 md:divide-y-0 md:p-4
      
      /* Desktop: 3-column grid */
      lg:grid-cols-3 lg:gap-6 lg:p-6
      
      /* Large Desktop: 4-column grid */
      xl:grid-cols-4
      
      ${className}
    `}>
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