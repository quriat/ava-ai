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
          300: '#F5E096',
          400: '#E6C363',
          500: '#D4AF37',
          600: '#AA8C2C',
          700: '#7D651E',
        },
        dark: {
          950: '#060709',
          900: '#0B0D13',
          800: '#12151F',
          700: '#1D2230',
          600: '#2A3144',
        },
        luxury: '#0a0a0a',
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      }
    }
  },
  plugins: []
}