import type { Config } from "tailwindcss";
import { codebayTailwindPreset } from "@codebay/theme/tailwind-preset";

const config: Config = {
  presets: [codebayTailwindPreset],
  content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  plugins: [require("tailwindcss-animate")],
  theme: {
    extend: {
      fontFamily: {
        hero: ["var(--font-hero)", "ui-sans-serif", "system-ui", "sans-serif"],
        "mono-ticker": ["var(--font-mono-ticker)", "ui-monospace", "monospace"],
      },
    },
  },
};

export default config;
