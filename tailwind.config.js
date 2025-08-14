import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts,svx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554'
        }
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'rgb(75 85 99)',
            h1: {
              color: 'rgb(31 41 55)'
            },
            h2: {
              color: 'rgb(31 41 55)'
            },
            h3: {
              color: 'rgb(55 65 81)'
            },
            h4: {
              color: 'rgb(55 65 81)'
            },
            h5: {
              color: 'rgb(75 85 99)'
            },
            h6: {
              color: 'rgb(75 85 99)'
            },
            strong: {
              color: 'rgb(31 41 55)'
            },
            code: {
              backgroundColor: '#f1f5f9',
              padding: '0.125rem 0.25rem',
              borderRadius: '0.25rem',
              fontWeight: '600',
              color: 'rgb(31 41 55)'
            },
            'code::before': {
              content: '""'
            },
            'code::after': {
              content: '""'
            },
            a: {
              color: '#2563eb',
              '&:hover': {
                color: '#1d4ed8'
              }
            },
            blockquote: {
              color: 'rgb(75 85 99)',
              borderLeftColor: 'rgb(209 213 219)'
            },
            'ul > li::marker': {
              color: 'rgb(156 163 175)'
            },
            'ol > li::marker': {
              color: 'rgb(156 163 175)'
            }
          }
        },
        invert: {
          css: {
            color: 'rgb(209 213 219)',
            h1: {
              color: 'rgb(243 244 246)'
            },
            h2: {
              color: 'rgb(243 244 246)'
            },
            h3: {
              color: 'rgb(229 231 235)'
            },
            h4: {
              color: 'rgb(229 231 235)'
            },
            h5: {
              color: 'rgb(209 213 219)'
            },
            h6: {
              color: 'rgb(209 213 219)'
            },
            strong: {
              color: 'rgb(243 244 246)'
            },
            code: {
              backgroundColor: 'rgb(31 41 55)',
              color: 'rgb(229 231 235)'
            },
            a: {
              color: '#60a5fa',
              '&:hover': {
                color: '#93c5fd'
              }
            },
            blockquote: {
              color: 'rgb(209 213 219)',
              borderLeftColor: 'rgb(75 85 99)'
            },
            'ul > li::marker': {
              color: 'rgb(107 114 128)'
            },
            'ol > li::marker': {
              color: 'rgb(107 114 128)'
            }
          }
        }
      }
    }
  },
  plugins: [typography]
};
