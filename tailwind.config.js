/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Apple.com exact palette
        apple: {
          black:  '#1D1D1F',
          gray:   '#6E6E73',
          light:  '#F5F5F5',
          border: '#E5E5E5',
        },
        // Keep gold for any legacy references
        gold: {
          DEFAULT: '#C9A84C',
          light: '#E2C97E',
          dark: '#A8872E',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'sans-serif'],
        display: ['"Playfair Display"', 'serif'],
      },
      borderRadius: {
        pill: '980px',
      },
    },
  },
  plugins: [],
}
