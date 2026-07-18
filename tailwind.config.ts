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
        sans: ['var(--font-jakarta)', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jbmono)', 'JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        card: '14px',
        btn: '9px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(16,40,64,.06)',
        pop: '0 4px 16px rgba(16,40,64,.08)',
        'btn-blue': '0 2px 8px rgba(28,143,214,.25)',
        'nav-active': '0 4px 12px rgba(28,143,214,.35)',
      },
    },
  },
  plugins: [],
}
export default config
