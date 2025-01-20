/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'cyber': {
          primary: '#00f3ff',
          secondary: '#ff00ea',
          dark: '#000000',
          light: '#1a1a3a',
        },
        'cosmic': {
          primary: '#7e3ff2',
          secondary: '#f23f99',
          dark: '#000000',
          light: '#2a2a4a',
          text: '#e0e0ff'
        }
      },
      animation: {
        'glitch': 'glitch 3s infinite linear alternate-reverse',
        'grid-move': 'gridMove 20s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar': 'radar 4s linear infinite',
        'orbit': 'orbit 6s linear infinite',
      },
      keyframes: {
        glitch: {
          '0%': { clip: 'rect(44px, 900px, 56px, 0)' },
          '20%': { clip: 'rect(18px, 900px, 84px, 0)' },
          '40%': { clip: 'rect(92px, 900px, 6px, 0)' },
          '60%': { clip: 'rect(67px, 900px, 11px, 0)' },
          '80%': { clip: 'rect(39px, 900px, 27px, 0)' },
          '100%': { clip: 'rect(5px, 900px, 59px, 0)' }
        },
        gridMove: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '-30px -30px' }
        },
        radar: {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' }
        },
        orbit: {
          'from': { transform: 'rotate(0deg) translateX(70px) rotate(0deg)' },
          'to': { transform: 'rotate(360deg) translateX(70px) rotate(-360deg)' }
        }
      },
      backdropBlur: {
        'xs': '2px'
      }
    },
  },
  plugins: [],
}
