import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "media",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sky: "var(--color-sky)",
        peach: "var(--color-peach)",
        taupe: "var(--color-taupe)",
        "peach-light": "var(--color-peach-light)",
        cocoa: "var(--color-cocoa)",
        ivory: "var(--color-ivory)",
        sage: "var(--color-sage)",
        leaf: "var(--color-leaf)",
        honey: "var(--color-honey)",
        coral: "var(--color-coral)",
        pink: "var(--color-pink)",
      },
      fontFamily: {
        heading: "var(--font-heading)",
        body: "var(--font-body)",
      },
      borderRadius: {
        card: "var(--radius-card)",
        button: "var(--radius-button)",
        pill: "var(--radius-pill)",
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        lift: "var(--shadow-lift)",
      },
      spacing: {
        "safe-bottom": "env(safe-area-inset-bottom)",
      },
      keyframes: {
        "bloom-bounce": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "bloom-blink": {
          "0%, 90%, 100%": { transform: "scaleY(1)" },
          "95%": { transform: "scaleY(0.1)" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "bloom-bounce": "bloom-bounce 2.4s ease-in-out infinite",
        "bloom-blink": "bloom-blink 4s ease-in-out infinite",
        "pop-in": "pop-in 0.25s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
