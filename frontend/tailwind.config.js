/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0E1420",
          soft: "#161D2C",
          line: "#232B3D",
        },
        canvas: "#F5F6F8",
        surface: "#FFFFFF",
        cobalt: {
          DEFAULT: "#2954D8",
          soft: "#EEF2FD",
          dark: "#1E3FAE",
        },
        verified: {
          DEFAULT: "#15803D",
          soft: "#EAF7EE",
        },
        inferred: {
          DEFAULT: "#B45309",
          soft: "#FDF3E7",
        },
        risk: {
          DEFAULT: "#B91C1C",
          soft: "#FCEAEA",
        },
        steel: {
          DEFAULT: "#D8DCE3",
          dim: "#9AA3B2",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      backgroundImage: {
        blueprint:
          "linear-gradient(#E4E7EC 1px, transparent 1px), linear-gradient(90deg, #E4E7EC 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "24px 24px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(14,20,32,0.04), 0 8px 24px -12px rgba(14,20,32,0.10)",
      },
    },
  },
  plugins: [],
};
