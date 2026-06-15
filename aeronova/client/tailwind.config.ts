import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#121417",
        midnight: "#092635",
        aero: "#1b998b",
        coral: "#f46036",
        linen: "#f7f1e8",
        mist: "#d9f3f0",
        runway: "#2f3d46"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(18, 20, 23, 0.12)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "Arial", "sans-serif"]
      }
    }
  },
  plugins: []
} satisfies Config;
