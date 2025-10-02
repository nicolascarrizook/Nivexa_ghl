/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: {
      // Mobile-first approach con breakpoints inspirados en AWS Console
      'xs': '480px',     // Mobile landscape
      'sm': '640px',     // Small tablets
      'md': '768px',     // Tablets
      'lg': '1024px',    // Desktop
      'xl': '1280px',    // Large desktop
      '2xl': '1536px',   // Extra large screens
      '3xl': '1920px',   // Full HD
      '4xl': '2560px',   // 2K/4K monitors
      
      // Breakpoints específicos para casos de uso
      'mobile': {'max': '639px'},           // Solo móvil
      'tablet': {'min': '640px', 'max': '1023px'}, // Solo tablet
      'desktop': {'min': '1024px'},         // Desktop y más grande
      'touch': {'max': '1023px'},           // Dispositivos táctiles
      'pointer': {'min': '1024px'},         // Dispositivos con mouse
      
      // Breakpoints para orientación
      'portrait': {'raw': '(orientation: portrait)'},
      'landscape': {'raw': '(orientation: landscape)'},
      
      // Breakpoints para altura
      'tall': {'raw': '(min-height: 800px)'},
      'short': {'raw': '(max-height: 600px)'},
    },
    extend: {
      // Container personalizado para mantener contenido centrado
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1.5rem',
          lg: '2rem',
          xl: '3rem',
          '2xl': '4rem',
        },
        screens: {
          sm: '100%',
          md: '100%',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1536px',
          '3xl': '1920px',
        },
      },
      // Spacing adicional para layouts responsivos
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '120': '30rem',
        '128': '32rem',
        '144': '36rem',
      },
      // Grid templates responsivos
      gridTemplateColumns: {
        // Auto-fit patterns
        'auto-fit-200': 'repeat(auto-fit, minmax(200px, 1fr))',
        'auto-fit-250': 'repeat(auto-fit, minmax(250px, 1fr))',
        'auto-fit-300': 'repeat(auto-fit, minmax(300px, 1fr))',
        // Dashboard layouts
        'dashboard-sm': 'repeat(1, 1fr)',
        'dashboard-md': 'repeat(2, 1fr)',
        'dashboard-lg': 'repeat(3, 1fr)',
        'dashboard-xl': 'repeat(4, 1fr)',
      },
      // Font sizes responsivos
      fontSize: {
        'responsive-xs': ['clamp(0.75rem, 2vw, 0.875rem)', { lineHeight: '1.5' }],
        'responsive-sm': ['clamp(0.875rem, 2.5vw, 1rem)', { lineHeight: '1.5' }],
        'responsive-base': ['clamp(1rem, 3vw, 1.125rem)', { lineHeight: '1.6' }],
        'responsive-lg': ['clamp(1.125rem, 3.5vw, 1.25rem)', { lineHeight: '1.6' }],
        'responsive-xl': ['clamp(1.25rem, 4vw, 1.5rem)', { lineHeight: '1.4' }],
        'responsive-2xl': ['clamp(1.5rem, 5vw, 2rem)', { lineHeight: '1.3' }],
        'responsive-3xl': ['clamp(2rem, 6vw, 3rem)', { lineHeight: '1.2' }],
      },
    },
  },
  plugins: [],
};