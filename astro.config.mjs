// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://galvarey.is-a.dev",
  // Spanish moved to the root; keep old /es/ links working.
  redirects: { "/es": "/" },
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
