/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#FBF9F5',
          muted: '#F4F1EA',
          card: '#FFFFFF',
          subtle: '#EDE9DE',
        },
        ink: {
          DEFAULT: '#191E19',
          muted: '#525A52',
          faint: '#8C938C',
          border: '#E3DFD5',
        },
        forest: {
          DEFAULT: '#274B35',
          hover: '#1E3B29',
          tint: '#EBF3ED',
          border: '#C7DACD',
        },
        terracotta: {
          DEFAULT: '#BC4B2E',
          hover: '#9E3C23',
          tint: '#FAECE8',
        }
      },
      fontFamily: {
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(28, 32, 28, 0.04), 0 1px 2px -1px rgba(28, 32, 28, 0.03)',
        'elevated': '0 4px 16px -2px rgba(28, 32, 28, 0.06), 0 2px 6px -2px rgba(28, 32, 28, 0.04)',
      }
    },
  },
  plugins: [],
}
