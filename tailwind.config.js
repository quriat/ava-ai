/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#C9A96A',
          light: '#E8D5A3',
          dark: '#A68035',
          300: '#F5E096',
          400: '#E6C363',
          500: '#C9A96A',
          600: '#AA8C2C',
          700: '#7D651E',
        },
        ink: '#0A0A0B',
        smoke: '#141416',
        dark: {
          950: '#0A0A0B',
          900: '#141416',
          800: '#1D1D20',
          700: '#2A2A2E',
          600: '#3A3A40',
        },
        luxury: '#0a0a0b',
      },
      fontFamily: {
        sans: ['Inter', 'Montserrat', 'sans-serif'],
        serif: ['"Cormorant Garamond"', '"Playfair Display"', 'serif'],
      }
    }
  },
  plugins: []
}