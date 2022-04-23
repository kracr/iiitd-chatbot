const colors = require("tailwindcss/colors");
const defaults = require("tailwindcss/defaultTheme");

const deprecatedColors = [
  "lightBlue",
  "warmGray",
  "trueGray",
  "coolGray",
  "blueGray",
];

deprecatedColors.forEach((color) => {
  delete colors[color];
});

module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: ["Inter", ...defaults.fontFamily.sans],
    },
    extend: {
      colors,
      screens: {
        xs: "420px",
      },
    },
  },
  plugins: [],
};
