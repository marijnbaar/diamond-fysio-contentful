// NOTE: This config is copied from ACM
const colors = require("tailwindcss/colors");
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  mode: "jit",
  purge: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    fontFamily: {
      display: ['"Darker Grotesque"'],
      body: ['"Darker Grotesque"'],
      sans: ['"Darker Grotesque"'],
      serif: ['"Darker Grotesque"'],
      microcopy: ['"Caveat"'],
    },
    fontSize: {
      xs: ".75rem",
      sm: ".875rem",
      tiny: ".875rem",
      base: "1rem", // 16px
      lg: "1.125rem", // 18px
      xl: "1.25rem", // 20px
      "1.5xl": "1.375rem", // 22px
      "2xl": "1.5rem", // 24px
      "3xl": "1.875rem", // 30px
      "4xl": "2rem", // 32px
      "5xl": "2.5rem", // 40px
      "6xl": "3rem", // 48px
      "7xl": "4rem", // 64px
      "8xl": "5.5rem", // 88px
    },
    spacing: {
      0: "0",
      1: "8px",
      2: "12px",
      2.5: "14px",
      3: "16px",
      3.5: "18px",
      4: "24px",
      5: "32px", // spacing column width
      5.5: "36px",
      6: "40px",
      7: "48px",
      8: "56px",
      9: "64px",
      10: "72px",
      11: "80px",
      12: "88px",
      13: "96px",
      13.5: "98px",
      14: "104px",
      15: "112px",
      26: "184px",
      120: "120px",
      160: "160px",
      226: "226px",
    },
    maxWidth: {
      224: "224px",
      274: "274px",
    },
    minWidth: {
      32: "32px",
      64: "64px",
    },
    maxHeight: {},
    container: {
      center: true,
    },
    extend: {
      screens: {
        "2xl": "1408px",
      },
      lineHeight: {
        // 1 rem === 16px
        11: "2.75rem",
        12: "3rem",
        13: "3.25rem",
        14: "3.5rem",
        15: "3.75rem",
        16: "4rem",
        17: "4.25rem",
        18: "4.5rem",
        19: "4.75rem",
        20: "5rem",
        21: "5.25rem",
        22: "5.5rem",
        23: "5.75rem",
        24: "6rem",
      },
      maxHeight: {
        861: "861px",
      },
      colors: {
        green: {
          dark: "#2C614F",
          default: "#8EB1A6",
          light: "#DFEAE7",
        },
        orange: {
          dark: "#DF5A2A",
          bright: "#DF5A2A",
          default: "#FFB59B",
          light: "#FFB59B",
        },
        beige: {
          creme: "#F5F2E3",
          sand: "#F6F5F0",
        },
        white: colors.white,
      },
      scale: {
        "-1": "-1",
      },
    },
  },
};
