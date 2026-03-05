import type { Config } from "tailwindcss";
import { codebayTailwindPreset } from "@codebay/theme/tailwind-preset";

const config: Config = {
  presets: [codebayTailwindPreset],
  content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  plugins: [require("tailwindcss-animate")],
};

export default config;
