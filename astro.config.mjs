// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// Served from GitHub Pages at the root of https://galvareypoco.github.io/
// If you add a custom domain later, set `site` to it and add public/CNAME.
export default defineConfig({
  site: "https://galvareypoco.github.io",
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
