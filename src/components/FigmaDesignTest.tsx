import React from 'react';
import PlantCard from './PlantCard';

const FigmaDesignTest: React.FC = () => {
  // Plant data with actual downloaded images
  const plants = [
    {
      id: '1',
      name: 'Monstera',
      wateringStatus: 'Water in 2 days',
      lastWatered: 'Last watered 2d ago',
      imageUrl: '/pflanzen-manager/images/monstera.png'
    },
    {
      id: '2',
      name: 'Fiddle Leaf Fig',
      wateringStatus: 'Water in 3 days',
      lastWatered: 'Last watered 1d ago',
      imageUrl: '/pflanzen-manager/images/fiddle-leaf-fig.png'
    },
    {
      id: '3',
      name: 'Snake Plant',
      wateringStatus: 'Water in 1 day',
      lastWatered: 'Last watered 3d ago',
      imageUrl: '/pflanzen-manager/images/snake-plant.png'
    },
    {
      id: '4',
      name: 'Peace Lily',
      wateringStatus: 'Water in 2 days',
      lastWatered: 'Last watered 2d ago',
      imageUrl: '/pflanzen-manager/images/peace-lily.png'
    }
  ];

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-900 p-4">
      {/* Main container - exact width from Figma */}
      <div
        className="flex flex-col rounded-3xl overflow-hidden"
        style={{
          backgroundColor: '#12211A',
          width: '390px',
          height: '800px'
        }}
      >
        {/* Header section */}
        <div 
          className="flex justify-between items-center"
          style={{ 
            padding: '16px 16px 8px 16px'
          }}
        >
          {/* Title */}
          <div className="flex-1 flex justify-center" style={{ paddingLeft: '48px' }}>
            <h1 
              className="text-center"
              style={{ 
                fontFamily: 'Lexend, sans-serif',
                fontWeight: 700,
                fontSize: '18px',
                lineHeight: '1.2777777777777777',
                color: '#FFFFFF'
              }}
            >
              My Plants
            </h1>
          </div>
          
          {/* Plus button */}
          <div 
            className="flex justify-end items-center"
            style={{ width: '48px' }}
          >
            <div 
              className="flex justify-center items-center rounded-xl"
              style={{
                width: '48px',
                height: '48px',
                gap: '8px'
              }}
            >
              <div className="flex flex-col justify-stretch items-stretch flex-1">
                <div className="flex-1 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5V19M5 12H19" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Plant Cards Section */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {plants.map((plant) => (
            <div
              key={plant.id}
              className="flex flex-col"
              style={{ padding: '16px' }}
            >
              <div
                className="flex justify-between rounded-xl"
                style={{ gap: '16px' }}
              >
                <PlantCard
                  name={plant.name}
                  wateringStatus={plant.wateringStatus}
                  lastWatered={plant.lastWatered}
                  imageUrl={plant.imageUrl}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Navigation */}
        <div 
          className="flex flex-col"
          style={{ backgroundColor: '#1A3326' }}
        >
          {/* Top border */}
          <div 
            style={{ 
              height: '1px',
              backgroundColor: '#244736'
            }}
          />
          
          {/* Navigation content */}
          <div 
            className="flex justify-stretch items-stretch gap-2"
            style={{ padding: '8px 16px 12px 16px' }}
          >
            {/* Home icon */}
            <div className="flex flex-col justify-end items-center gap-1 flex-1">
              <div 
                className="flex justify-center items-center rounded-2xl"
                style={{ height: '32px' }}
              >
                <div className="flex items-center justify-center" style={{ height: '24px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 22V12H15V22" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Plant icon */}
            <div className="flex flex-col justify-end items-center gap-1 flex-1">
              <div 
                className="flex justify-center items-center rounded-2xl"
                style={{ height: '32px' }}
              >
                <div className="flex items-center justify-center" style={{ height: '24px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M7 20H17M10 20C15.5 17.5 10.8 13.6 13 10M9.5 9.4C10.6 10.2 11.3 11.6 11.8 13.1C9.8 13.5 8.3 13.5 7 13.1C5.8 12.5 4.7 11.2 4 8.9C6.8 8.4 8.4 8.9 9.5 9.4ZM14.1 6C14.1 6 13 10 13 10C14.9 9.9 16.3 9.3 17.3 8.6C18.3 7.5 18.9 5.9 19 4.4C16.3 4.5 15 5.4 14.1 6Z" stroke="#94C7AD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Settings icon */}
            <div className="flex flex-col justify-end items-center gap-1 flex-1">
              <div 
                className="flex justify-center items-center rounded-2xl"
                style={{ height: '32px' }}
              >
                <div className="flex items-center justify-center" style={{ height: '24px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="3" stroke="#94C7AD" strokeWidth="2"/>
                    <path d="M19.4 15C19.2 15.3 19.2 15.7 19.4 16L20.4 17.9C20.6 18.3 20.5 18.8 20.1 19.1L18.1 20.9C17.8 21.2 17.3 21.3 16.9 21.1L15 20.1C14.7 19.9 14.3 19.9 14 20.1L13 20.8C12.7 21 12.4 21.2 12 21.2H10C9.6 21.2 9.3 21 9 20.8L8 20.1C7.7 19.9 7.3 19.9 7 20.1L5.1 21.1C4.7 21.3 4.2 21.2 3.9 20.9L1.9 19.1C1.5 18.8 1.4 18.3 1.6 17.9L2.6 16C2.8 15.7 2.8 15.3 2.6 15L1.9 13.1C1.7 12.7 1.8 12.2 2.1 11.9L4.1 10.1C4.4 9.8 4.5 9.3 4.3 8.9L3.3 7C3.1 6.6 3.2 6.1 3.5 5.8L5.5 4C5.8 3.7 6.3 3.6 6.7 3.8L8.6 4.8C8.9 5 9.3 5 9.6 4.8L10.6 4.1C10.9 3.9 11.2 3.7 11.6 3.7H13.6C14 3.7 14.3 3.9 14.6 4.1L15.6 4.8C15.9 5 16.3 5 16.6 4.8L18.5 3.8C18.9 3.6 19.4 3.7 19.7 4L21.7 5.8C22.1 6.1 22.2 6.6 22 7L21 8.9C20.8 9.2 20.8 9.6 21 9.9L21.7 11.8C21.9 12.2 21.8 12.7 21.5 13L19.5 14.8C19.2 15.1 19.1 15.6 19.3 16L20.3 17.9C20.5 18.3 20.4 18.8 20.1 19.1L18.1 20.9C17.8 21.2 17.3 21.3 16.9 21.1L15 20.1C14.7 19.9 14.3 19.9 14 20.1L13 20.8C12.7 21 12.4 21.2 12 21.2H10C9.6 21.2 9.3 21 9 20.8L8 20.1C7.7 19.9 7.3 19.9 7 20.1L5.1 21.1C4.7 21.3 4.2 21.2 3.9 20.9L1.9 19.1C1.5 18.8 1.4 18.3 1.6 17.9L2.6 16C2.8 15.7 2.8 15.3 2.6 15L1.9 13.1C1.7 12.7 1.8 12.2 2.1 11.9L4.1 10.1C4.4 9.8 4.5 9.3 4.3 8.9L3.3 7C3.1 6.6 3.2 6.1 3.5 5.8L5.5 4C5.8 3.7 6.3 3.6 6.7 3.8L8.6 4.8C8.9 5 9.3 5 9.6 4.8L10.6 4.1C10.9 3.9 11.2 3.7 11.6 3.7H13.6C14 3.7 14.3 3.9 14.6 4.1L15.6 4.8C15.9 5 16.3 5 16.6 4.8L18.5 3.8C18.9 3.6 19.4 3.7 19.7 4L21.7 5.8C22.1 6.1 22.2 6.6 22 7L21 8.9C20.8 9.2 20.8 9.6 21 9.9L21.7 11.8C21.9 12.2 21.8 12.7 21.5 13L19.5 14.8C19.2 15.1 19.1 15.6 19.3 16Z" stroke="#94C7AD" strokeWidth="2"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom spacer */}
          <div style={{ height: '20px' }} />
        </div>
      </div>
    </div>
  );
};

export default FigmaDesignTest;