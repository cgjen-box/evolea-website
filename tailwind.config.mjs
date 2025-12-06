/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        evolea: {
          // TRUE evolea.ch Colors - BOLD SPECTRUM
          // Primary Magenta/Fuchsia Family
          magenta: '#DD48E0',
          'magenta-light': '#EF5EDB',
          'magenta-vivid': '#E97BF1',

          // Lavender/Purple Family
          purple: '#BA53AD',
          'purple-light': '#CD87F8',
          'purple-dark': '#8A3D9E',

          // Base
          cream: '#FFFBF7',
          white: '#FFFFFF',

          // Spectrum Colors - EXACT evolea.ch
          mint: '#7BEDD5',
          'mint-light': '#A3F4E6',
          coral: '#FF7E5D',
          'coral-light': '#FF9B82',
          'coral-dark': '#C96861',
          gold: '#DCD49F',
          yellow: '#FFE066',
          'yellow-vivid': '#FFD23F',
          pink: '#EF8EAE',
          'pink-light': '#FFDEDE',
          sky: '#5DADE2',
          'sky-vivid': '#3A86FF',
          teal: '#2EC4B6',
          orange: '#FF6B35',

          // Text
          text: '#2D2A32',
          'text-light': '#5C5762',

          // Dark Mode / Vision - per Brand Guide v3
          charcoal: '#1A1A2E',
          'charcoal-light': '#2D2A32',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
        display: ['Fredoka', 'Poppins', 'system-ui', 'sans-serif'],
      },
      fontSize: {
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
        'evolea-2xl': '48px',
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(186, 83, 173, 0.15)',
        'card': '0 8px 30px rgba(186, 83, 173, 0.2)',
        'elevated': '0 20px 50px rgba(186, 83, 173, 0.25)',
        'glow-magenta': '0 0 60px rgba(221, 72, 224, 0.5)',
        'glow-purple': '0 0 60px rgba(205, 135, 248, 0.5)',
        'glow-mint': '0 0 60px rgba(123, 237, 213, 0.5)',
        'glow-coral': '0 0 60px rgba(255, 126, 93, 0.5)',
        'glow-pink': '0 0 60px rgba(239, 142, 174, 0.5)',
        'glow-gold': '0 0 60px rgba(220, 212, 159, 0.6)',
        'spectrum': '0 0 80px rgba(221, 72, 224, 0.4), 0 0 120px rgba(123, 237, 213, 0.3)',
        'prism': '0 0 100px rgba(233, 123, 241, 0.4), 0 0 150px rgba(123, 237, 213, 0.3)',
      },
      backgroundImage: {
        // THE evolea.ch SIGNATURE PRISM GRADIENT
        'gradient-prism': 'linear-gradient(118deg, #7BEDD5 0%, #FFE066 21%, #FFFFFF 48%, #E97BF1 81%, #CD87F8 100%)',
        'gradient-prism-vivid': 'linear-gradient(118deg, #7BEDD5 0%, #FFE066 15%, #FFDEDE 35%, #E97BF1 65%, #CD87F8 85%, #DD48E0 100%)',

        // Hero gradient - full spectrum
        'gradient-hero': 'linear-gradient(135deg, #7BEDD5 0%, #FFE066 25%, #E97BF1 50%, #CD87F8 75%, #DD48E0 100%)',

        // Spectrum - cycling through all colors
        'gradient-spectrum': 'linear-gradient(90deg, #7BEDD5 0%, #FFE066 16%, #FF7E5D 32%, #EF8EAE 48%, #E97BF1 64%, #CD87F8 80%, #7BEDD5 100%)',

        // Warm gradients
        'gradient-sunset': 'linear-gradient(135deg, #FF7E5D 0%, #EF8EAE 50%, #E97BF1 100%)',
        'gradient-warmth': 'linear-gradient(135deg, #FFE066 0%, #FF7E5D 50%, #C96861 100%)',

        // Cool gradients
        'gradient-ocean': 'linear-gradient(135deg, #7BEDD5 0%, #5DADE2 50%, #CD87F8 100%)',
        'gradient-dream': 'linear-gradient(135deg, #EF8EAE 0%, #CD87F8 50%, #7BEDD5 100%)',

        // Magenta family
        'gradient-magenta': 'linear-gradient(135deg, #BA53AD 0%, #DD48E0 50%, #E97BF1 100%)',
        'gradient-lavender': 'linear-gradient(135deg, #CD87F8 0%, #E97BF1 50%, #EF8EAE 100%)',

        // Mint family
        'gradient-mint': 'linear-gradient(135deg, #7BEDD5 0%, #A3F4E6 50%, #DCD49F 100%)',

        // Mesh gradients - TRUE evolea.ch style
        'mesh-spectrum': 'radial-gradient(at 0% 0%, rgba(123, 237, 213, 0.5) 0px, transparent 50%), radial-gradient(at 80% 20%, rgba(255, 224, 102, 0.4) 0px, transparent 50%), radial-gradient(at 100% 60%, rgba(233, 123, 241, 0.5) 0px, transparent 50%), radial-gradient(at 20% 100%, rgba(205, 135, 248, 0.4) 0px, transparent 50%), radial-gradient(at 60% 80%, rgba(221, 72, 224, 0.4) 0px, transparent 50%)',
        'mesh-prism': 'radial-gradient(at 0% 50%, rgba(123, 237, 213, 0.6) 0px, transparent 50%), radial-gradient(at 100% 50%, rgba(233, 123, 241, 0.6) 0px, transparent 50%), radial-gradient(at 50% 0%, rgba(255, 224, 102, 0.5) 0px, transparent 50%), radial-gradient(at 50% 100%, rgba(205, 135, 248, 0.5) 0px, transparent 50%)',

        // Hero overlays
        'hero-overlay': 'linear-gradient(to bottom, rgba(45, 42, 50, 0.2) 0%, rgba(186, 83, 173, 0.5) 100%)',
        'hero-overlay-spectrum': 'linear-gradient(135deg, rgba(123, 237, 213, 0.3) 0%, rgba(255, 224, 102, 0.2) 25%, rgba(233, 123, 241, 0.4) 75%, rgba(186, 83, 173, 0.5) 100%)',
        'card-overlay': 'linear-gradient(to top, rgba(186, 83, 173, 0.95) 0%, rgba(221, 72, 224, 0.7) 50%, transparent 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease forwards',
        'fade-slide-up': 'fadeSlideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-slide-down': 'fadeSlideDown 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.6s ease forwards',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'float-fast': 'float 4s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'scroll-hint': 'scrollHint 2s ease-in-out infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
        'gradient-flow': 'gradientFlow 15s ease infinite',
        'spectrum-flow': 'spectrumFlow 10s linear infinite',
        'rotate-slow': 'rotateSlow 20s linear infinite',
        'morph': 'morph 8s ease-in-out infinite',
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
          '0%, 100%': { opacity: '0.7', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.15)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
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
        gradientFlow: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        spectrumFlow: {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '200% 0%' },
        },
        rotateSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        morph: {
          '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '50%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
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
