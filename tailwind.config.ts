import { getIconCollections, iconsPlugin } from "@egoist/tailwindcss-icons";
import type { Config } from "tailwindcss";

/** @type {import('tailwindcss').Config} */

const config: Config = {
  content: ["./src/**/*.{ts,tsx}", "index.html", "popup.html"],
  darkMode: "media",
  theme: {
    extend: {},
  },
  plugins: [
    iconsPlugin({
      collections: getIconCollections(["ph"]),
    }),
  ],
};

export default config;
