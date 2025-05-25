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
      className={`
        flex justify-between items-center gap-4 p-4
        md:flex-col md:text-center md:p-6
        lg:hover:bg-figma-card-bg/30 lg:transition-all lg:duration-200
        cursor-pointer rounded-lg md:rounded-xl
        border-b border-figma-border md:border md:border-figma-border
        ${onClick ? 'cursor-pointer' : ''} ${className}
      `}
      onClick={onClick}
    >
      {/* Plant Info */}
      <div className="flex-1 md:order-2 space-y-1">
        {/* Last watered */}
        <p className="text-sm text-figma-accent-green">
          {lastWatered}
        </p>
        
        {/* Plant name */}
        <h3 className="
          text-base font-bold text-figma-text-white
          md:text-lg lg:text-xl
        ">
          {name}
        </h3>
        
        {/* Watering status */}
        <p className="text-sm text-figma-accent-green md:text-base">
          {wateringStatus}
        </p>
      </div>
      
      {/* Plant Image */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt={name}
          className="
            w-[70px] h-[70px] rounded-xl object-cover flex-shrink-0
            md:w-24 md:h-24 md:order-1 md:mb-4
            lg:w-32 lg:h-32 lg:rounded-2xl
          "
        />
      )}
    </div>
  );
};

export default FigmaPlantCard;