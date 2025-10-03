/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // Include all JS/TSX files in src
  ],
  darkMode: 'class', // Enable dark mode via 'class' strategy
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',      // Blue for buttons, charts
        secondary: '#4f46e5',    // Slightly darker accent
        accent: '#f59e0b',       // Yellow accent
        background: '#f9fafb',   // Light background
        darkBackground: '#1f2937', // Dark background
      },
      fontFamily: {
        sans: ['Inter', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
