import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: '#0E2436',
        navy2: '#16314a',
        brand: { DEFAULT: '#1C8FD6', deep: '#14629B' },
        orange: '#F26F1F',
        green: '#1FA871',
        red: '#E0563B',
        purple: '#7A5AF8',
        yellow: '#D4A017',
        bg: '#F3F6FA',
        surface: '#ffffff',
        border: '#E8EDF3',
        border2: '#DCE3EC',
        tx: { DEFAULT: '#15212E', 2: '#5A6B7B', 3: '#92A0AF' },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        card: '14px',
        btn: '9px',
      },
    },
  },
  plugins: [],
}
export default config
