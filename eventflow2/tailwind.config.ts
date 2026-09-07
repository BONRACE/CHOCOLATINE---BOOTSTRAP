import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#12241C",        // near-black text with a green undertone
        forest: {
          DEFAULT: "#0B4A32",  // brand base — deep velvet green
          dark: "#082F20",
          light: "#14684A",
        },
        gold: {
          DEFAULT: "#D4A62F",  // brand accent — foil / seal gold
          dim: "#B4901F",
          pale: "#F0DFA6",
        },
        ivory: "#F6F2E7",       // warm paper background, distinct from generic cream
        coral: "#E2572B",       // live / urgent accent, used sparingly
        line: "#DCD3BE",        // hairline borders on ivory
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "perforation-h":
          "repeating-linear-gradient(90deg, transparent, transparent 6px, var(--tw-gradient-stops) 6px, var(--tw-gradient-stops) 8px)",
      },
      borderRadius: {
        stub: "20px",
      },
    },
  },
  plugins: [],
};

export default config;
