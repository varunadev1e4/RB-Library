/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paper:   '#FDFAF5',
        'paper-dark': '#F3EDE0',
        mahogany: {
          50:  '#FDF5F0',
          100: '#F5E6DC',
          200: '#E8C9B5',
          300: '#D4A07A',
          400: '#B87748',
          500: '#8B5E3C',
          600: '#6B4E3D',
          700: '#4A3228',
          800: '#2C1810',
          900: '#1A0E0A',
        },
        amber: {
          50:  '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#B8860B',
          600: '#92690A',
          700: '#78520A',
          800: '#5E3F09',
          900: '#3F2A05',
        },
        sage: {
          50:  '#F0F4EE',
          100: '#DCE7D8',
          200: '#B9CEB1',
          300: '#97B58B',
          400: '#7A8C6E',
          500: '#5E6F52',
          600: '#4A5740',
          700: '#38422F',
          800: '#252D1F',
          900: '#141810',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        serif:   ['"Lora"', 'Georgia', 'serif'],
        sans:    ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'book':    '3px 3px 0 0 rgba(44,24,16,0.15), 6px 6px 0 0 rgba(44,24,16,0.08)',
        'book-lg': '4px 4px 0 0 rgba(44,24,16,0.2), 8px 8px 0 0 rgba(44,24,16,0.1)',
        'warm':    '0 4px 20px rgba(44,24,16,0.12)',
        'warm-lg': '0 8px 40px rgba(44,24,16,0.16)',
      },
      backgroundImage: {
        'paper-texture': "url(\"data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.025'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}
