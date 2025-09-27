import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type WxtViteConfig } from "wxt";



// const manifest = defineManifest({
//   name: "Cookie Man",
//   version: packageJson.version,
//   manifest_version: 3,
//   description: "Cookie Manager",
//   icons: {
//     16: "cookie_icon_16.png",
//     48: "cookie_icon_48.png",
//     128: "cookie_icon_128.png",
//   },
//   action: {
//     default_popup: "popup.html",
//   },
//   background: {
//     service_worker: "src/background.ts",
//     type: "module",
//   },
//   host_permissions: ["<all_urls>"],
//   permissions: ["cookies", "tabs", "activeTab"],
// });

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: "Cookie Man",
    description: "Cookie Manager",
  },

  modules: ["@wxt-dev/module-react", "@wxt-dev/auto-icons"],
  imports: false,
  srcDir: "src",
  vite: () => {
    return {
      plugins: [tailwindcss()],
    } as WxtViteConfig;
  },
});
