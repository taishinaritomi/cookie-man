import { crx, defineManifest } from "@crxjs/vite-plugin";
import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import tsconfigPaths from "vite-tsconfig-paths";
import packageJson from "./package.json";

const manifest = defineManifest({
  name: "Cookie Man",
  version: packageJson.version,
  manifest_version: 3,
  description: "Cookie Manager",
  icons: {
    16: "cookie_icon_16.png",
    48: "cookie_icon_48.png",
    128: "cookie_icon_128.png",
  },
  action: {
    default_popup: "popup.html",
  },
  background: {
    service_worker: "src/background.ts",
    type: "module",
  },
  host_permissions: ["<all_urls>"],
  permissions: ["cookies", "tabs", "activeTab"],
});

export default defineConfig({
  plugins: [tsconfigPaths(), solidPlugin(), crx({ manifest })],
});
