/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ["Nunito Sans", "sans-serif"],
        heading: ["Nunito", "sans-serif"]
      },
      colors: {
        primary: {
          DEFAULT: "#87281b",
          light: "#9b4e43",
          extralight: "#c89188",
          dark: "#60150a",
          extradark: "#3b0800"
        },
        secondary: {
          DEFAULT: "#ffcd74",
          light: "#ffe7a9",
          extralight: "#eef5db",
          dark: "#f4b448",
          extradark: "#d68e3a"
        },
        green: {
          DEFAULT: "#519872",
          light: "#70c49c",
          extralight: "#8fd8ca",
          dark: "#2b6948",
          extradark: "#1b3022"
        },
        blue: {
          DEFAULT: "#0267c1",
          light: "#5197d6",
          extralight: "#a1cdf1",
          dark: "#154a7b",
          extradark: "#1c3144"
        },
        white: "#f7f4f2",
        black: "#1c1917",
        gray: {
          DEFAULT: "#767371",
          light: "#bfbcba",
          extralight: "#f2f1ee",
          dark: "#57504c"
        }
      }
    }
  },
  plugins: []
};
