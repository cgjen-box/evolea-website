/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        evolea: {
          purple: '#6B4C8A',
          'purple-light': '#8B6CAA',
          'purple-dark': '#4A3460',
          cream: '#FDF8F3',
          green: '#7CB97C',
          orange: '#E8A858',
          text: '#2D2A32',
          'text-light': '#5C5762',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        evolea: '16px',
        'evolea-sm': '12px',
        'evolea-lg': '24px',
      },
    },
  },
  plugins: [],
};
