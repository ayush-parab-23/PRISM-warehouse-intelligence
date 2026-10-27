/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#203247',
          50: '#F0F4F8',
          100: '#D9E2EC',
          200: '#BCCCDC',
          700: '#2A4365',
          800: '#203247',
          900: '#142131',
          950: '#0B131D',
        },
        canvas: '#F5F4F0',
        surface: '#FFFFFF',
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        teal: {
          DEFAULT: '#0F8276',
          50: '#E6F6F4',
          100: '#C2ECE7',
          500: '#0F8276',
          600: '#0B685E',
          700: '#084E47',
        },
        amber: {
          DEFAULT: '#D99A27',
          50: '#FEF9EE',
          100: '#FDF1D5',
          500: '#D99A27',
          600: '#B87E17',
          700: '#8E5F0E',
        },
        danger: {
          DEFAULT: '#C44D4D',
          50: '#FDF2F2',
          100: '#F9DCDC',
          500: '#C44D4D',
          600: '#A33636',
          700: '#822424',
        },
        // Semantic aliases
        primary: {
          DEFAULT: '#0F8276',
          hover: '#0B685E',
          dark: '#203247',
        },
        background: '#F5F4F0',
        card: '#FFFFFF',
        border: '#E2E8F0',
        text: {
          primary: '#1E293B',
          secondary: '#64748B',
          muted: '#94A3B8',
          navy: '#203247',
        }
      },
      fontFamily: {
        sans: ['Inter', 'IBM Plex Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        card: '0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)',
        elevated: '0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -1px rgba(15, 23, 42, 0.04)',
        drawer: '-4px 0 24px rgba(15, 23, 42, 0.15)',
      }
    },
  },
  plugins: [],
}
