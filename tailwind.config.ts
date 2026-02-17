import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Google Brand Colors
        google: {
          blue: "#4285F4",
          red: "#EA4335",
          yellow: "#FBBC05",
          green: "#34A853",
          grey: "#3C4043",
          white: "#FFFFFF",
          error: "#B00020",
        },
        // F1 Racing Theme (keeping for backward compatibility)
        f1: {
          black: "#000000",
          red: "#EA4335", // Now uses Google Red
          neon: "#34A853", // Now uses Google Green
          gray: "#3C4043", // Now uses Google Grey
        },
      },
      fontFamily: {
        sans: ["'Roboto'", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
export default config;
