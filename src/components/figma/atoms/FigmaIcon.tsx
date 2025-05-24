import React from 'react';

interface FigmaIconProps {
  name: 'plus' | 'home' | 'plant' | 'settings' | 'back' | 'chevron-down' | 'camera';
  size?: number;
  color?: string;
  className?: string;
}

/**
 * FigmaIcon - SVG icon component with predefined icons from Figma designs
 */
const FigmaIcon: React.FC<FigmaIconProps> = ({
  name,
  size = 24,
  color = 'currentColor',
  className = ''
}) => {
  const icons = {
    plus: (
      <path 
        d="M12 5V19M5 12H19" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    ),
    home: (
      <>
        <path 
          d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" 
          stroke={color} 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <path 
          d="M9 22V12H15V22" 
          stroke={color} 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </>
    ),
    plant: (
      <path 
        d="M7 20H17M10 20C15.5 17.5 10.8 13.6 13 10M9.5 9.4C10.6 10.2 11.3 11.6 11.8 13.1C9.8 13.5 8.3 13.5 7 13.1C5.8 12.5 4.7 11.2 4 8.9C6.8 8.4 8.4 8.9 9.5 9.4ZM14.1 6C14.1 6 13 10 13 10C14.9 9.9 16.3 9.3 17.3 8.6C18.3 7.5 18.9 5.9 19 4.4C16.3 4.5 15 5.4 14.1 6Z" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    ),
    settings: (
      <>
        <circle 
          cx="12" 
          cy="12" 
          r="3" 
          stroke={color} 
          strokeWidth="2"
        />
        <path 
          d="M19.4 15C19.2 15.3 19.2 15.7 19.4 16L20.4 17.9C20.6 18.3 20.5 18.8 20.1 19.1L18.1 20.9C17.8 21.2 17.3 21.3 16.9 21.1L15 20.1C14.7 19.9 14.3 19.9 14 20.1L13 20.8C12.7 21 12.4 21.2 12 21.2H10C9.6 21.2 9.3 21 9 20.8L8 20.1C7.7 19.9 7.3 19.9 7 20.1L5.1 21.1C4.7 21.3 4.2 21.2 3.9 20.9L1.9 19.1C1.5 18.8 1.4 18.3 1.6 17.9L2.6 16C2.8 15.7 2.8 15.3 2.6 15L1.9 13.1C1.7 12.7 1.8 12.2 2.1 11.9L4.1 10.1C4.4 9.8 4.5 9.3 4.3 8.9L3.3 7C3.1 6.6 3.2 6.1 3.5 5.8L5.5 4C5.8 3.7 6.3 3.6 6.7 3.8L8.6 4.8C8.9 5 9.3 5 9.6 4.8L10.6 4.1C10.9 3.9 11.2 3.7 11.6 3.7H13.6C14 3.7 14.3 3.9 14.6 4.1L15.6 4.8C15.9 5 16.3 5 16.6 4.8L18.5 3.8C18.9 3.6 19.4 3.7 19.7 4L21.7 5.8C22.1 6.1 22.2 6.6 22 7L21 8.9C20.8 9.2 20.8 9.6 21 9.9L21.7 11.8C21.9 12.2 21.8 12.7 21.5 13L19.5 14.8C19.2 15.1 19.1 15.6 19.3 16L20.3 17.9C20.5 18.3 20.4 18.8 20.1 19.1L18.1 20.9C17.8 21.2 17.3 21.3 16.9 21.1L15 20.1C14.7 19.9 14.3 19.9 14 20.1L13 20.8C12.7 21 12.4 21.2 12 21.2H10C9.6 21.2 9.3 21 9 20.8L8 20.1C7.7 19.9 7.3 19.9 7 20.1L5.1 21.1C4.7 21.3 4.2 21.2 3.9 20.9L1.9 19.1C1.5 18.8 1.4 18.3 1.6 17.9L2.6 16C2.8 15.7 2.8 15.3 2.6 15L1.9 13.1C1.7 12.7 1.8 12.2 2.1 11.9L4.1 10.1C4.4 9.8 4.5 9.3 4.3 8.9L3.3 7C3.1 6.6 3.2 6.1 3.5 5.8L5.5 4C5.8 3.7 6.3 3.6 6.7 3.8L8.6 4.8C8.9 5 9.3 5 9.6 4.8L10.6 4.1C10.9 3.9 11.2 3.7 11.6 3.7H13.6C14 3.7 14.3 3.9 14.6 4.1L15.6 4.8C15.9 5 16.3 5 16.6 4.8L18.5 3.8C18.9 3.6 19.4 3.7 19.7 4L21.7 5.8C22.1 6.1 22.2 6.6 22 7L21 8.9C20.8 9.2 20.8 9.6 21 9.9L21.7 11.8C21.9 12.2 21.8 12.7 21.5 13L19.5 14.8C19.2 15.1 19.1 15.6 19.3 16Z" 
          stroke={color} 
          strokeWidth="2"
        />
      </>
    ),
    back: (
      <path
        d="M19 12H5M12 19l-7-7 7-7"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    'chevron-down': (
      <path
        d="M6 9L12 15L18 9"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    camera: (
      <>
        <path
          d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx="12"
          cy="13"
          r="4"
          stroke={color}
          strokeWidth="2"
        />
      </>
    )
  };

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none"
      className={className}
    >
      {icons[name]}
    </svg>
  );
};

export default FigmaIcon;