import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0B4A32", // vert foncé - identité EventFlow
          light: "#116B49",
          dark: "#073322"
        },
        gold: {
          DEFAULT: "#D4A62F",
          light: "#E4C264",
          dark: "#A8801F"
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};
export default config;
