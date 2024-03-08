/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    screens: {
      sm: '29.938rem',
      // => @media (min-width: 479px) { ... }

      md: '47.938rem',
      // => @media (min-width: 767px) { ... }

      lg: '63.938rem',
      // => @media (min-width: 1023px) { ... }

      xl: '79.938rem',
      // => @media (min-width: 1279px) { ... }
    },
    extend: {},
  },
  plugins: [],
  presets: [require('@navikt/ds-tailwind')],
}
