/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './*.tsx',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          pink: '#ec4899',
          pinkHover: '#be185d',
          dark: '#050505',
          panel: '#09090b',
          border: '#27272a',
          glass: 'rgba(9, 9, 11, 0.7)',
          accent: '#db2777',
        },
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
        glitch: 'glitch 1s linear infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        'bump-glow': 'bump-glow 2s ease-out forwards',
      },
      keyframes: {
        glitch: {
          '2%, 64%': { transform: 'translate(2px,0) skew(0deg)' },
          '4%, 60%': { transform: 'translate(-2px,0) skew(0deg)' },
          '62%': { transform: 'translate(0,0) skew(5deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'bump-glow': {
          '0%': {
            boxShadow: '0 0 20px rgba(52, 211, 153, 0.8), 0 0 40px rgba(52, 211, 153, 0.4)',
            transform: 'scale(1.02)',
          },
          '15%': {
            boxShadow: '0 0 30px rgba(52, 211, 153, 1), 0 0 60px rgba(52, 211, 153, 0.6)',
            transform: 'scale(1.03)',
          },
          '30%': {
            boxShadow: '0 0 20px rgba(52, 211, 153, 0.6), 0 0 40px rgba(52, 211, 153, 0.3)',
            transform: 'scale(1.01)',
          },
          '100%': {
            boxShadow: '0 0 0px rgba(52, 211, 153, 0)',
            transform: 'scale(1)',
          },
        },
      },
      aspectRatio: {
        '16/7': '16 / 7',
      },
    },
  },
  plugins: [],
};
