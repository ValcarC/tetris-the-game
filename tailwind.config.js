/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'rotate-smooth': 'rotateSmooth 3s ease-in-out infinite', // Custom smooth rotation animation
      },
      keyframes: {
        rotateSmooth: {
          '0%': { transform: 'rotate(0deg)' },       // Start at 0 degrees
          '25%': { transform: 'rotate(-9deg)' },    // Rotate left
          '50%': { transform: 'rotate(9deg)' },     // Rotate right
          '75%': { transform: 'rotate(-9deg)' },    // Rotate left again
          '100%': { transform: 'rotate(0deg)' },      // Return to 0 degrees
        },
      },
    },
  },
  plugins: [],
}
