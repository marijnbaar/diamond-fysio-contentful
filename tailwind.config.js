// NOTE: This config is copied from ACM
const colors = require('tailwindcss/colors');

module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  safelist: [
    'btn-primary',
    'btn-primary--small',
    'btn-primary--negative',
    'btn-primary--negative--small',
    'font-primary',
    'font-secondary',
    'font-microcopy',
    'rounded-t-lg' // added to preserve the built-in utility
  ],
  theme: {
    fontFamily: {
      primary: ["'Manrope'"],
      secondary: ['"Kalam"'],
      sans: ["'Manrope'"],
      serif: ["'Manrope'"],
      microcopy: ['"Kalam"']
    },
    fontSize: {
      xs: '.75rem', // 12px
      sm: '.875rem', // 14px
      base: '1rem', // 16px
      lg: '1.125rem', // 18px
      xl: '1.25rem', // 20px
      '1.5xl': '1.375rem', // 22px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2rem', // 32px
      '5xl': '2.5rem', // 40px
      '6xl': '3rem', // 48px
      '7xl': '3.5rem', // 56px
      '8xl': '4rem' // 64px
    },
    extend: {
      fontFamily: {
        Euclid: ['Euclid'],
        manrope: ['Manrope, sans-serif']
      },
      backgroundImage: () => ({
        'login-background':
          "linear-gradient(rgba(0,0,0, 0.75), rgba(0,0,0, 0.75)), url('/src/assets/img/background-1920x1280.jpg')",
        'landing-background':
          'linear-gradient(rgba(0,0,0, 0.25), rgba(0,0,0, 0.25)), url(https://images.pexels.com/photos/5473182/pexels-photo-5473182.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260)',
        'pointed-background':
          "linear-gradient(rgba(0,0,0, 0.75), rgba(0,0,0, 0.75)), url('https://fysiodiamondfactory.nl/wp-content/uploads/2022/01/point.jpeg')"
      }),
      lineHeight: {
        11: '2.75rem',
        12: '3rem',
        13: '3.25rem',
        14: '3.5rem',
        15: '3.75rem',
        16: '4rem',
        17: '4.25rem',
        18: '4.5rem',
        19: '4.75rem',
        20: '5rem',
        21: '5.25rem',
        22: '5.5rem',
        23: '5.75rem',
        24: '6rem'
      },
      colors: {
        stone: colors.teal,
        facebook: '#3b5998',
        whatsapp: {
          dark: '#075E54',
          light: '#25D366'
        },
        web: '#005A9C',
        instagram: '#8a3ab9',
        linkedin: '#0e76a8',
        gmail: '#DB4437',
        blue: {
          extraDark: '#172B4D',
          dark: '#1D3A6A',
          default: '#0065FF',
          light: '#70A9FF',
          extraLight: '#F5F9FF'
        },
        orange: {
          extraDark: '#CC6D00',
          dark: '#FF8600',
          default: '#FFA033',
          light: '#FFF2EA',
          extraLight: '#FFF2EA'
        },
        green: {
          extraDark: '#1F855A',
          dark: '#36B37E',
          default: '#57D9A3',
          light: '#ACECD1',
          extraLight: '#E3FCEF'
        },
        grey: {
          dark: '#B2B2B2',
          default: '#E5E5E5',
          light: '#F9F9F9',
          lightGreen: '#c5cec8'
        },
        red: '#412378',
        yellow: '#412378',
        white: colors.white,
        black: colors.black,
        beige: '#BAC9C2',
        teal: {
          100: '#e6fffa',
          200: '#b2f5ea',
          300: '#81e6d9',
          400: '#4fd1c5',
          500: '#38b2ac',
          600: '#319795',
          700: '#2c7a7b',
          800: '#285e61',
          900: '#234e52'
        }
      },
      boxShadow: {
        light: '0px 4px 40px rgba(23, 43, 77, 0.04)',
        dark: '0px 4px 40px rgba(23, 43, 77, 0.08)'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideIn: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        staggered: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '30%': { transform: 'translateY(0)', opacity: '0.5' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' }
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.7s ease-in-out forwards',
        slideUp: 'slideUp 0.8s ease-out forwards',
        slideIn: 'slideIn 0.8s ease-out forwards',
        staggered: 'staggered 1.2s ease-out forwards',
        pulse: 'pulse 2s ease-in-out infinite'
      },
      transitionProperty: {
        width: 'width',
        height: 'height',
        padding: 'padding',
        borderWidth: 'borderWidth'
      }
    }
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')]
};
