/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        evolea: {
          // Core Purple Family - More vibrant
          purple: '#7B5BA0',
          'purple-light': '#A78BCA',
          'purple-dark': '#5A3D7A',
          'purple-vivid': '#9B4DCA',

          // Base
          cream: '#FFFBF7',

          // Spectrum Colors - BOLD & VIBRANT
          orange: '#FF6B35',
          'orange-light': '#FF9F1C',
          green: '#2EC4B6',
          'green-light': '#7DCEA0',
          coral: '#FF4D6D',
          'coral-light': '#FF758F',
          yellow: '#FFD23F',
          'yellow-light': '#FFE066',
          sky: '#3A86FF',
          'sky-light': '#5DADE2',
          mint: '#00F5D4',
          pink: '#FF69B4',
          lime: '#ADFF2F',

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
        'soft': '0 4px 20px rgba(123, 91, 160, 0.12)',
        'card': '0 8px 30px rgba(123, 91, 160, 0.15)',
        'elevated': '0 20px 50px rgba(123, 91, 160, 0.2)',
        'glow-purple': '0 0 60px rgba(155, 77, 202, 0.4)',
        'glow-orange': '0 0 60px rgba(255, 107, 53, 0.4)',
        'glow-green': '0 0 60px rgba(46, 196, 182, 0.4)',
        'glow-coral': '0 0 60px rgba(255, 77, 109, 0.4)',
        'glow-sky': '0 0 60px rgba(58, 134, 255, 0.4)',
        'glow-yellow': '0 0 60px rgba(255, 210, 63, 0.5)',
        'spectrum': '0 0 80px rgba(155, 77, 202, 0.3), 0 0 120px rgba(255, 107, 53, 0.2)',
      },
      backgroundImage: {
        // POWERFUL Gradients - Multi-color spectrum
        'gradient-hero': 'linear-gradient(135deg, #7B5BA0 0%, #9B4DCA 25%, #FF6B35 50%, #FFD23F 75%, #2EC4B6 100%)',
        'gradient-spectrum': 'linear-gradient(90deg, #FF4D6D 0%, #FF6B35 15%, #FFD23F 30%, #2EC4B6 50%, #3A86FF 70%, #9B4DCA 85%, #FF4D6D 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #FF4D6D 0%, #FF6B35 40%, #FFD23F 100%)',
        'gradient-ocean': 'linear-gradient(135deg, #3A86FF 0%, #2EC4B6 50%, #00F5D4 100%)',
        'gradient-purple': 'linear-gradient(135deg, #5A3D7A 0%, #7B5BA0 50%, #9B4DCA 100%)',
        'gradient-rainbow': 'linear-gradient(90deg, #FF4D6D, #FF6B35, #FFD23F, #2EC4B6, #3A86FF, #9B4DCA)',
        'gradient-joy': 'linear-gradient(120deg, #FFD23F 0%, #FF6B35 50%, #FF4D6D 100%)',
        'gradient-calm': 'linear-gradient(180deg, #3A86FF 0%, #2EC4B6 100%)',
        'gradient-energy': 'linear-gradient(135deg, #FF6B35 0%, #FFD23F 50%, #2EC4B6 100%)',
        'gradient-magic': 'linear-gradient(135deg, #9B4DCA 0%, #FF69B4 50%, #FF4D6D 100%)',

        // Mesh gradients for vibrant backgrounds
        'mesh-spectrum': 'radial-gradient(at 0% 0%, rgba(255, 77, 109, 0.4) 0px, transparent 50%), radial-gradient(at 80% 20%, rgba(255, 210, 63, 0.3) 0px, transparent 50%), radial-gradient(at 100% 60%, rgba(46, 196, 182, 0.4) 0px, transparent 50%), radial-gradient(at 20% 100%, rgba(58, 134, 255, 0.3) 0px, transparent 50%), radial-gradient(at 60% 80%, rgba(155, 77, 202, 0.4) 0px, transparent 50%)',

        // Hero overlays
        'hero-overlay': 'linear-gradient(to bottom, rgba(45, 42, 50, 0.3) 0%, rgba(123, 91, 160, 0.6) 100%)',
        'hero-overlay-spectrum': 'linear-gradient(135deg, rgba(155, 77, 202, 0.5) 0%, rgba(255, 107, 53, 0.3) 50%, rgba(46, 196, 182, 0.4) 100%)',
        'card-overlay': 'linear-gradient(to top, rgba(123, 91, 160, 0.95) 0%, rgba(155, 77, 202, 0.6) 50%, transparent 100%)',
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
