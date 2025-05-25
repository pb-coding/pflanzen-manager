/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        figma: {
          'bg-dark': '#12211A',
          'text-white': '#FFFFFF', 
          'accent-green': '#94C7AD',
          'card-bg': '#1A3326',
          'border': '#244736',
          'button-green': '#14B866',
          'input-bg': '#244736',
        }
      },
      fontFamily: {
        'figma': ['Lexend', 'sans-serif'],
      },
      spacing: {
        'figma-xs': '4px',
        'figma-sm': '8px', 
        'figma-base': '16px',
        'figma-lg': '20px',
        'figma-xl': '24px',
      },
      screens: {
        'figma-sm': '390px',  // Figma base
        'figma-md': '768px',  // Tablet
        'figma-lg': '1024px', // Desktop
      },
      borderRadius: {
        'figma-sm': '12px',
        'figma-lg': '16px', 
        'figma-xl': '24px',
      },
      height: {
        'figma-header': '48px',
        'figma-nav': '52px',
        'figma-button': '48px',
        'figma-input': '56px',
      },
      width: {
        'figma-plant-image': '70px',
        'figma-icon': '24px',
      },
      boxShadow: {
        'figma-toggle': '0px 3px 8px 0px rgba(0, 0, 0, 0.15)',
      }
    }
  },
  plugins: [],
}