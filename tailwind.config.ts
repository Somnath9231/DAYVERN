import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        rpg: {
          bg: "#FFFFFF",
          card: "#FFF5F6",
          cardHover: "#FDE7EA",
          border: "#E8D6D9",
          borderMuted: "#D4BCC0",
          primary: "#C1121F",       // Cherry Red
          primaryHover: "#8F0D16",  // Deep Cherry
          accent: "#8F0D16",
          lightPink: "#FDE7EA",
          veryLightPink: "#FFF5F6",
          text: "#171717",
          muted: "#6B6B6B",
          darkMuted: "#404040",
          
          // Spec Accents (High Contrast on White/Light Pink)
          int: "#1D4ED8",  // Intelligence (Royal Blue)
          str: "#C1121F",  // Strength (Cherry Red)
          dex: "#0284C7",  // Focus / Dexterity (Sky Blue)
          con: "#059669",  // Discipline / Vitality (Emerald)
          cha: "#D97706",  // Charisma (Amber Gold)
        },
      },
      fontFamily: {
        mono: ["var(--font-mono)", "JetBrains Mono", "Courier New", "monospace"],
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Newsreader", "Georgia", "serif"],
      },
      boxShadow: {
        "tactile": "0 2px 0 0 #E8D6D9",
        "tactile-lg": "0 4px 0 0 #E8D6D9",
        "cherry-glow": "0 0 12px -2px rgba(193, 18, 31, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
