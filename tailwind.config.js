import { getIconCollections, iconsPlugin } from "@egoist/tailwindcss-icons";

/** @type {import('tailwindcss').Config} */
export default {
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
