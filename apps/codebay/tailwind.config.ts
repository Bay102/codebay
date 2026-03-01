import type { Config } from "tailwindcss";
import { codebayTailwindPreset } from "@codebay/theme/tailwind-preset";

export default {
  presets: [codebayTailwindPreset],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Inter', 'sans-serif'],
        heading: ['Inter', 'sans-serif'],
      },
      colors: {
        "ai-accent": "hsl(var(--ai-accent))",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "border-glow": {
          "0%, 100%": {
            "border-color": "hsl(0, 0%, 20%)",
            "box-shadow": "0 0 0px rgba(249, 115, 22, 0)",
          },
          "50%": {
            "border-color": "hsl(24, 95%, 53%)",
            "box-shadow": "0 0 20px rgba(249, 115, 22, 0.3), 0 0 40px rgba(249, 115, 22, 0.1)",
          },
        },
        "scan-line": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        "message-slide": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px) scale(0.95)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0) scale(1)",
          },
        },
        "glow-pulse": {
          "0%, 100%": {
            opacity: "0.3",
            transform: "scale(1)",
          },
          "50%": {
            opacity: "0.6",
            transform: "scale(1.02)",
          },
        },
        "particle-float": {
          "0%, 100%": {
            transform: "translate(0, 0) rotate(0deg)",
            opacity: "0",
          },
          "10%": {
            opacity: "0.4",
          },
          "90%": {
            opacity: "0.4",
          },
          "100%": {
            transform: "translate(var(--tx), var(--ty)) rotate(360deg)",
            opacity: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "border-glow": "border-glow 3s ease-in-out infinite",
        "scan-line": "scan-line 8s linear infinite",
        "message-slide": "message-slide 0.3s ease-out",
        "glow-pulse": "glow-pulse 4s ease-in-out infinite",
        "particle-float": "particle-float var(--duration, 15s) ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
