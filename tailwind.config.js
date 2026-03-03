/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'app': {
          'bg': '#0c1220',
          'sidebar': '#0e1628',
          'card': '#131e30',
          'card2': '#172236',
          'border': '#1e2e45',
          'accent': '#4ade80',
          'accent2': '#22c55e',
          'muted': '#5a6f8a',
          'text': '#e8edf5',
          'textSm': '#7a90aa',
        }
      },
      fontFamily: {
        'barlow': ['Barlow', 'sans-serif'],
        'barlow-condensed': ['Barlow Condensed', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
