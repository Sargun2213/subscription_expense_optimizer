/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F7F9FC',
        surface: '#FFFFFF',
        primary: {
          DEFAULT: '#635BFF',
          hover: '#5248E5',
          light: '#EEF0FF'
        },
        secondary: {
          DEFAULT: '#4F8CFF',
          hover: '#3A77E8',
          light: '#EDF4FF'
        },
        text: {
          main: '#172033',
          muted: '#667085',
          subtle: '#8F9CAE'
        },
        border: '#E7EBF2',
        success: {
          DEFAULT: '#15966A',
          light: '#E6F8F0',
          text: '#0E6245'
        },
        warning: {
          DEFAULT: '#E9A23B',
          light: '#FEF6E9',
          text: '#986518'
        },
        danger: {
          DEFAULT: '#D94B55',
          light: '#FDECEE',
          text: '#942B33'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)',
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        floating: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        card: '14px',
      }
    },
  },
  plugins: [],
}
