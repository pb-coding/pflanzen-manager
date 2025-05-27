import React from 'react';

interface FigmaPlantCardProps {
  name: string;
  wateringStatus: string;
  lastWatered: string;
  imageUrl?: string;
  onClick?: () => void;
  className?: string;
}

/**
 * FigmaPlantCard - Plant card component for the Figma design
 * Shows plant name, watering info, and image
 */
const FigmaPlantCard: React.FC<FigmaPlantCardProps> = ({
  name,
  wateringStatus,
  lastWatered,
  imageUrl,
  onClick,
  className = ''
}) => {
  return (
    <div 
      className={`figma-plant-card ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {/* Plant Info */}
      <div className="figma-plant-info">
        {/* Last watered */}
        <div className="figma-text-small figma-text-accent">
          {lastWatered}
        </div>
        
        {/* Plant name */}
        <div className="figma-text-body-medium">
          {name}
        </div>
        
        {/* Watering status */}
        <div className="figma-text-small figma-text-accent">
          {wateringStatus}
        </div>
      </div>
      
      {/* Plant Image */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt={name}
          className="figma-plant-card-image"
        />
      )}
    </div>
  );
};

export default FigmaPlantCard;