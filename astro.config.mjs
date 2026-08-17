// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Dominio de Supabase Storage: se autoriza para que Astro pueda optimizar
// (comprimir, convertir a AVIF/WebP) las fotos de inmuebles en build time.
const SUPABASE_HOSTNAME = new URL(
  process.env.PUBLIC_SUPABASE_URL || 'https://vkhbkdibihwmwyshrofx.supabase.co'
).hostname;

// https://astro.build/config
export default defineConfig({
  site: 'https://quenecesitashoy.es',
  image: {
    domains: [SUPABASE_HOSTNAME],
  },
  integrations: [
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      i18n: {
        defaultLocale: 'es',
        locales: {
          es: 'es-ES',
        },
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    inlineStylesheets: 'auto',
  },
  compressHTML: true,
});
