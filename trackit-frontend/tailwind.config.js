/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#FF7A48', // orange accent
        'sidebar-dark': '#181818',
        'bg-main': '#F5E9DF', // soft beige
        'bg-card': 'rgba(255,255,255,0.7)',
        glass: 'rgba(255,255,255,0.3)',
        'text-main': '#181818',
        'text-muted': '#A0A0A0',
        success: '#4BB543',
        warning: '#FFB648',
        danger: '#FF4848',
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'ui-sans-serif', 'system-ui'],
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '16px',
      },
      borderRadius: {
        xl: '1.5rem',
        '2xl': '2rem',
      },
      boxShadow: {
        glass: '0 4px 32px 0 rgba(31, 38, 135, 0.15)',
      },
    },
  },
  plugins: [],
};
