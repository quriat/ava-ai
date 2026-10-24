/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#C5A059',
          light: '#D4AF37',
          dark: '#A68035',
        },
        luxury: '#0a0a0a',
      },
      fontFamily: {
        sans: ['Libre Franklin', 'sans-serif'],
        serif: ['Montserrat', 'sans-serif'],
      }
    }
  },
  plugins: []
}
