/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        evolea: {
          // Core Purple Family
          purple: '#6B4C8A',
          'purple-light': '#9B7BC0',
          'purple-dark': '#4A3460',

          // Base
          cream: '#FDF8F3',

          // Spectrum Colors - Bold & Joyful
          orange: '#FF8C42',
          green: '#5DD99B',
          coral: '#FF6B6B',
          yellow: '#FFD93D',
          sky: '#6BCFFF',

          // Text
          text: '#2D2A32',
          'text-light': '#5C5762',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
        display: ['Fredoka', 'Poppins', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Display sizes for Fredoka
        'display-sm': ['2.25rem', { lineHeight: '1.2', fontWeight: '600' }],
        'display-md': ['3rem', { lineHeight: '1.15', fontWeight: '600' }],
        'display-lg': ['3.75rem', { lineHeight: '1.1', fontWeight: '700' }],
        'display-xl': ['4.5rem', { lineHeight: '1.05', fontWeight: '700' }],
        'display-2xl': ['5rem', { lineHeight: '1', fontWeight: '700' }],
      },
      borderRadius: {
        'evolea-sm': '12px',
        'evolea': '16px',
        'evolea-lg': '24px',
        'evolea-xl': '32px',
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(107, 76, 138, 0.1)',
        'card': '0 8px 30px rgba(107, 76, 138, 0.12)',
        'elevated': '0 20px 50px rgba(107, 76, 138, 0.15)',
        'glow-purple': '0 0 40px rgba(107, 76, 138, 0.3)',
        'glow-orange': '0 0 40px rgba(255, 140, 66, 0.3)',
        'glow-green': '0 0 40px rgba(93, 217, 155, 0.3)',
      },
      backgroundImage: {
        // Gradients
        'gradient-hero': 'linear-gradient(135deg, #6B4C8A 0%, #9B7BC0 50%, #FF8C42 100%)',
        'gradient-joy': 'linear-gradient(120deg, #FFD93D 0%, #FF8C42 100%)',
        'gradient-calm': 'linear-gradient(180deg, #6BCFFF 0%, #5DD99B 100%)',
        'gradient-spectrum': 'linear-gradient(90deg, #FF6B6B 0%, #FFD93D 25%, #5DD99B 50%, #6BCFFF 75%, #9B7BC0 100%)',
        'gradient-purple': 'linear-gradient(135deg, #6B4C8A 0%, #9B7BC0 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #FF6B6B 0%, #FF8C42 50%, #FFD93D 100%)',

        // Overlays for hero
        'hero-overlay': 'linear-gradient(to bottom, rgba(45, 42, 50, 0.4) 0%, rgba(107, 76, 138, 0.6) 100%)',
        'card-overlay': 'linear-gradient(to top, rgba(107, 76, 138, 0.95) 0%, rgba(107, 76, 138, 0.4) 50%, transparent 100%)',
      },
      animation: {
        // Entrance animations
        'fade-in': 'fadeIn 0.8s ease forwards',
        'fade-slide-up': 'fadeSlideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-slide-down': 'fadeSlideDown 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.6s ease forwards',

        // Floating/decorative
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',

        // Interactive
        'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',

        // Scroll indicator
        'scroll-hint': 'scrollHint 2s ease-in-out infinite',

        // Gradient animation
        'gradient-shift': 'gradientShift 8s ease infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeSlideUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeSlideDown: {
          '0%': { opacity: '0', transform: 'translateY(-40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(3deg)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        scrollHint: {
          '0%, 100%': { opacity: '1', transform: 'translateY(0)' },
          '50%': { opacity: '0.5', transform: 'translateY(10px)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      aspectRatio: {
        'hero': '16 / 9',
        'card': '4 / 3',
        'square': '1 / 1',
      },
      zIndex: {
        'behind': '-1',
        'float': '10',
        'header': '50',
        'modal': '100',
        'toast': '150',
      },
    },
  },
  plugins: [],
};
