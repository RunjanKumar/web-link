/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        wave: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '20%': { transform: 'rotate(14deg)' },
          '40%': { transform: 'rotate(-8deg)' },
          '60%': { transform: 'rotate(14deg)' },
          '80%': { transform: 'rotate(-4deg)' },
        },
      },
      animation: {
        wave: 'wave 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}