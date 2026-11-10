import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f6f3ee",
        ink: "#1c2433",
        mist: "#e6e0d6",
        line: "#d9d2c6",
        navy: {
          950: "#121a2e",
          900: "#1b2744",
          800: "#243656",
          700: "#34507a",
        },
        amber: {
          100: "#f8edd8",
          300: "#f0cb8c",
          400: "#e8a54b",
          500: "#cf8d34",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 24px 60px -36px rgba(18, 26, 46, 0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
