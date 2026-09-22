// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

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
    build: {
      cssMinify: "esbuild",
    },
  },
});