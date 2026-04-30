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
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        wave: 'wave 2s ease-in-out infinite',
        slideDown: 'slideDown 0.3s ease-out',
      },
    },
  },
  plugins: [],
}