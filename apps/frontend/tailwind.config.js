/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    screens: {
      'sm': '479px',
      // => @media (min-width: 479px) { ... }

      'md': '767px',
      // => @media (min-width: 767px) { ... }

      'lg': '1023px',
      // => @media (min-width: 1023px) { ... }

      'xl': '1279px'
      // => @media (min-width: 1279px) { ... }
    },
    extend: {},
  },
  plugins: [],
  presets: [require('@navikt/ds-tailwind')]
}

