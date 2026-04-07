import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    './components/**/*.{vue,js,ts}',
    './pages/**/*.{vue,js,ts}',
    './layouts/**/*.{vue,js,ts}',
    './app.vue',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Josefin Sans', 'sans-serif'],
      },
      colors: {
        primary: 'hsl(220, 98%, 61%)',
        // Light theme
        'light-bg': 'hsl(0, 0%, 98%)',
        'light-input-bg': 'hsl(0, 0%, 100%)',
        'light-border': 'hsl(236, 33%, 92%)',
        'light-placeholder': 'hsl(233, 11%, 84%)',
        'light-muted': 'hsl(236, 9%, 61%)',
        'light-text': 'hsl(235, 19%, 35%)',
        // Dark theme
        'dark-bg': 'hsl(235, 21%, 11%)',
        'dark-card': 'hsl(235, 24%, 19%)',
        'dark-border': 'hsl(233, 14%, 35%)',
        'dark-muted': 'hsl(234, 11%, 52%)',
        'dark-placeholder': 'hsl(234, 11%, 52%)',
        'dark-text': 'hsl(234, 39%, 85%)',
        'dark-text-hover': 'hsl(236, 33%, 92%)',
      },
    },
  },
  plugins: [],
} satisfies Config
