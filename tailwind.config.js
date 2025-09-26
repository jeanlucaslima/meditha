/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2E5077',
          50: '#E8EDF4',
          100: '#D1DBE9',
          200: '#A3B7D3',
          300: '#7593BD',
          400: '#476FA7',
          500: '#2E5077',
          600: '#25405F',
          700: '#1C3047',
          800: '#13202F',
          900: '#0A1017'
        },
        secondary: {
          DEFAULT: '#4DA1A9',
          50: '#EBF6F7',
          100: '#D7EDEF',
          200: '#AFDBE0',
          300: '#87C9D0',
          400: '#5FB7C0',
          500: '#4DA1A9',
          600: '#3D8087',
          700: '#2E6065',
          800: '#1F4043',
          900: '#0F2021'
        },
        accent: {
          DEFAULT: '#79D7BE',
          50: '#F0FBF8',
          100: '#E1F7F1',
          200: '#C3EFE3',
          300: '#A5E7D5',
          400: '#87DFC7',
          500: '#79D7BE',
          600: '#5AC598',
          700: '#3B9472',
          800: '#2D6F56',
          900: '#1E4A39'
        },
        'base-100': '#F6F4F0',
        'base-200': '#EDE9E3',
        'base-300': '#E4DED6',
        'base-content': '#111827'
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem'
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'bounce-subtle': 'bounceSubtle 2s infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' }
        }
      }
    }
  },
  plugins: []
}