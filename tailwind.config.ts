import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{astro,html,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink:        '#0d0d0b',
        paper:      '#f5f2ec',
        'paper-warm': '#ede9e0',
        accent:     '#c8a96e',
        'accent-dark': '#9c7d47',
        muted:      '#7a7670',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        mono:    ['"DM Mono"', 'monospace'],
      },
      letterSpacing: {
        widest2: '0.22em',
      },
    },
  },
  plugins: [],
} satisfies Config;
