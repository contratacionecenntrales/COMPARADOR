/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#131A24',
          navy2: '#1B2434',
          navy3: '#243044',
          gold: '#C9A227',
          goldLight: '#E7C767',
          goldDark: '#8A6D1B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 24px -4px rgba(19, 26, 36, 0.12)',
        gold: '0 4px 20px -4px rgba(201, 162, 39, 0.45)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #8A6D1B 0%, #C9A227 45%, #E7C767 100%)',
        'navy-gradient': 'linear-gradient(135deg, #0F151E 0%, #1B2434 60%, #243044 100%)',
      },
    },
  },
  plugins: [],
}
