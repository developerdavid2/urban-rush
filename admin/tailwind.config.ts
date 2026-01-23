import {heroui} from '@heroui/theme';
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // keeps dark mode always on (we'll force it in CSS)
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/components/(breadcrumbs|button|ripple|spinner).js"
  ],

  theme: {
    extend: {
      colors: {
        // ── Backgrounds & Surfaces (exact from your sidebar) ──
        "admin-bg": "#0a0f0d", // main sidebar background
        "admin-surface": "#14291c", // hover states, cards, panels
        "admin-divider": "#1a2820", // borders, subtle lines

        // ── Emerald Accent (your active/hover color) ──
        emerald: {
          400: "#34d399", // hover text/icons
          500: "#10b981", // active / default accent
          600: "#059669", // pressed / deeper accent
          glow: "rgba(16, 185, 129, 0.12)", // active background glow
        },

        // ── Text ──
        text: {
          primary: "#f3f4f6", // main text, titles (gray-100)
          secondary: "#9ca3af", // inactive icons, secondary text (gray-400)
          muted: "#6b7280", // subtle labels (gray-500)
        },

        // ── Status colors (optional, but useful for future badges/alerts) ──
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444",
        info: "#3b82f6",
      },

      borderColor: {
        divider: "#1a2820",
      },

      boxShadow: {
        glow: "0 4px 12px rgba(16, 185, 129, 0.15)",
        sm: "0 1px 3px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [heroui()],
};
