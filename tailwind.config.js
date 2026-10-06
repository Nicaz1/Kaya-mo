/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        focus: {
          DEFAULT: '#6C8EF5',
          soft: '#DCE6FD',
        },
        body: {
          DEFAULT: '#4CC6B9',
          soft: '#D7F3F0',
        },
        nest: {
          DEFAULT: '#F0A860',
          soft: '#FBE7D1',
        },
        heart: {
          DEFAULT: '#F2789F',
          soft: '#FCE0EA',
        },
        kaya: {
          bg: '#FFFBF5',
          dark: '#1E1B2E',
        },
      },
      fontFamily: {
        rounded: ['Nunito', 'ui-rounded', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pop: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '60%': { transform: 'scale(1.05)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'bounce-soft': 'bounce-soft 2.4s ease-in-out infinite',
        pop: 'pop 0.3s ease-out',
      },
    },
  },
  plugins: [],
}
