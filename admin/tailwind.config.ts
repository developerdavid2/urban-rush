import { heroui } from "@heroui/theme";
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/components/(breadcrumbs|button|card|modal|skeleton|ripple|spinner).js"
  ],

  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        // ── Backgrounds & Surfaces (OKLCH) ──
        "admin-bg": "oklch(0.12 0.02 155)", // #0a0f0d - deep forest dark
        "admin-surface": "oklch(0.22 0.04 155)", // #14291c - elevated surface
        "admin-divider": "oklch(0.28 0.03 155)", // #1a2820 - subtle borders

        // ── Emerald Accent (OKLCH) ──
        emerald: {
          400: "oklch(0.75 0.15 165)", // #34d399 - bright emerald hover
          500: "oklch(0.68 0.17 165)", // #10b981 - primary emerald
          600: "oklch(0.58 0.17 165)", // #059669 - deep emerald press
          glow: "oklch(0.68 0.17 165 / 0.12)", // emerald with 12% opacity
        },

        // ── Text (OKLCH) ──
        text: {
          primary: "oklch(0.96 0.00 0)", // #f3f4f6 - white text
          secondary: "oklch(0.68 0.01 270)", // #9ca3af - gray text
          muted: "oklch(0.54 0.01 270)", // #6b7280 - subtle gray
        },

        // ── Status Colors (OKLCH) ──
        success: "oklch(0.68 0.17 165)", // #10b981 - emerald success
        warning: "oklch(0.68 0.17 65)", // #f59e0b - amber warning
        danger: "oklch(0.63 0.26 25)", // #ef4444 - red danger
        info: "oklch(0.60 0.21 255)", // #3b82f6 - blue info
      },

      borderColor: {
        divider: "oklch(0.28 0.03 155)", // #1a2820
      },

      boxShadow: {
        glow: "0 4px 12px oklch(0.68 0.17 165 / 0.15)",
        sm: "0 1px 3px oklch(0 0 0 / 0.1)",
      },
    },
  },
  plugins: [heroui()],
};

export default config;
