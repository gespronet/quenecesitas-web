// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { fileURLToPath } from "node:url";

export default defineConfig({
  site: "https://quenecesitashoy.es",
  integrations: [
    sitemap({
      changefreq: "weekly",
      priority: 0.7,
      lastmod: new Date(),
    }),
  ],
  build: {
    format: "directory",
    inlineStylesheets: "auto",
    assets: "_assets",
  },
  trailingSlash: "ignore",
  image: {
    domains: ["vkhbkdibihwmwyshrofx.supabase.co"],
  },
  vite: {
    resolve: {
      alias: {
        "@components": fileURLToPath(new URL("./src/components", import.meta.url)),
        "@layouts": fileURLToPath(new URL("./src/layouts", import.meta.url)),
        "@lib": fileURLToPath(new URL("./src/lib", import.meta.url)),
        "@styles": fileURLToPath(new URL("./src/styles", import.meta.url)),
        "@pages": fileURLToPath(new URL("./src/pages", import.meta.url)),
      },
    },
    build: {
      cssMinify: "esbuild",
    },
  },
});