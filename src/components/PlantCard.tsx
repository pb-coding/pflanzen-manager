import React from 'react';

interface PlantCardProps {
  name: string;
  wateringStatus: string;
  lastWatered: string;
  imageUrl: string;
}

const PlantCard: React.FC<PlantCardProps> = ({
  name,
  wateringStatus,
  lastWatered,
  imageUrl
}) => {
  return (
    <div className="flex justify-between items-stretch gap-4 p-4">
      {/* Left side - Plant info */}
      <div className="flex flex-col gap-1 w-[228px]">
        {/* Last watered - top */}
        <p
          className="text-sm leading-[1.5]"
          style={{
            fontFamily: 'Lexend, sans-serif',
            fontWeight: 400,
            color: '#94C7AD'
          }}
        >
          {lastWatered}
        </p>
        
        {/* Plant name - middle, most prominent */}
        <h3
          className="text-base leading-[1.25]"
          style={{
            fontFamily: 'Lexend, sans-serif',
            fontWeight: 700,
            color: '#FFFFFF'
          }}
        >
          {name}
        </h3>
        
        {/* Watering status - bottom */}
        <p
          className="text-sm leading-[1.5]"
          style={{
            fontFamily: 'Lexend, sans-serif',
            fontWeight: 400,
            color: '#94C7AD'
          }}
        >
          {wateringStatus}
        </p>
      </div>
      
      {/* Right side - Plant image */}
      <div
        className="rounded-xl bg-cover bg-center flex-shrink-0"
        style={{
          backgroundImage: `url(${imageUrl})`,
          width: '100%',
          height: '70px',
          maxWidth: '120px'
        }}
      />
    </div>
  );
};

export default PlantCard;