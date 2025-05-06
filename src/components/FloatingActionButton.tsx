import React from 'react';

interface FloatingActionButtonProps {
  onClick: () => void;
  color?: 'green' | 'blue';
  ariaLabel?: string;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  color = 'green',
  ariaLabel = 'Action Button',
}) => {
  const bgColor = color === 'green' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700';
  
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-4 right-4 ${bgColor} text-white shadow-lg focus:outline-none w-14 h-14 rounded-[50%] flex items-center justify-center`}
      aria-label={ariaLabel}
    >
      <span className="text-2xl leading-none">+</span>
    </button>
  );
};

export default FloatingActionButton;
