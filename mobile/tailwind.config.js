/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontSize: {
        xs: ['15px', { lineHeight: '19px' }],
        sm: ['17px', { lineHeight: '23px' }],
        base: ['19px', { lineHeight: '27px' }],
        lg: ['21px', { lineHeight: '31px' }],
        xl: ['23px', { lineHeight: '31px' }],
      },
    },
  },
  plugins: [],
};
