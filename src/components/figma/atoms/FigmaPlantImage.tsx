import React from 'react';

interface FigmaPlantImageProps {
  imageUrl?: string;
  plantName: string;
  className?: string;
}

/**
 * FigmaPlantImage - Große Pflanzenbildanzeige
 * Basierend auf Figma Design 27-2
 */
const FigmaPlantImage: React.FC<FigmaPlantImageProps> = ({
  imageUrl,
  plantName,
  className = ''
}) => {
  return (
    <div className={`figma-plant-image ${className}`}>
      <div className="figma-plant-image-container">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={plantName}
            className="figma-plant-image-img"
          />
        ) : (
          <div className="figma-plant-image-placeholder">
            <div className="figma-plant-image-placeholder-icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <span className="figma-text-small figma-text-accent">
              No image available
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FigmaPlantImage;