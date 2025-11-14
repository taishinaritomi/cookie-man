import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type WxtViteConfig } from "wxt";

export default defineConfig({
  manifest: {
    name: "Cookie Man",
    description: "Cookie Manager",
    host_permissions: ["<all_urls>"],
    permissions: ["cookies", "tabs", "activeTab"],
  },
  modules: ["@wxt-dev/module-react", "@wxt-dev/auto-icons"],
  imports: false,
  srcDir: "src",
  vite: () => {
    return {
      plugins: [tailwindcss()],
    } as WxtViteConfig;
  },
  webExt: {
    disabled: true,
  },
});
