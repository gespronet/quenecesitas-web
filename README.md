# queNECESITAS · Web corporativa

Sitio web estático construido con **Astro 5 + Tailwind 4**. Marca de Gespronet Axencia de Marketing e Deseño S.L.

> **Stack**: Astro · Tailwind · Bricolage Grotesque · Montserrat · n8n · Brevo · Supabase
> **Hosting**: Hostinger Multihosting Agencia (deploy automático vía GitHub Actions FTP)

---

## 🚀 Primeros pasos

### 1. Instalar dependencias

```bash
npm install
```

### 2. Variables de entorno

Duplica `.env.example` a `.env` y rellena las dos variables:

```bash
cp .env.example .env
```

```ini
PUBLIC_N8N_WEBHOOK_URL=https://n8n.tu-dominio.com/webhook/quenecesitas-leads
PUBLIC_SITE_URL=https://quenecesitashoy.es
```

### 3. Arrancar en local

```bash
npm run dev
```

→ http://localhost:4321

### 4. Build de producción

```bash
npm run build      # genera /dist
npm run preview    # sirve /dist en local para verificar
```

---

## 📁 Estructura

```
quenecesitas-web/
├── public/                    # Estáticos servidos tal cual
│   ├── logo.svg
│   ├── logo-white.svg
│   ├── favicon.svg
│   ├── robots.txt
│   └── og-default.png
├── src/
│   ├── components/            # Componentes Astro reutilizables
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── Hero.astro
│   │   ├── StatsBar.astro
│   │   ├── ServiceGrid.astro
│   │   ├── ProcessSteps.astro
│   │   ├── WhyDifferent.astro
│   │   ├── ContactForm.astro
│   │   ├── SectorHero.astro
│   │   └── FAQ.astro
│   ├── layouts/
│   │   └── BaseLayout.astro   # SEO + JSON-LD + Open Graph
│   ├── pages/
│   │   ├── index.astro        # Home
│   │   ├── alarmas.astro
│   │   ├── energia.astro
│   │   ├── telefonia.astro
│   │   ├── inmuebles.astro
│   │   ├── sobre-nosotros.astro
│   │   ├── contacto.astro
│   │   ├── aviso-legal.astro
│   │   ├── politica-privacidad.astro
│   │   ├── politica-cookies.astro
│   │   ├── 404.astro
│   │   └── blog/
│   │       ├── index.astro    # Listado
│   │       └── [...slug].astro
│   ├── content/
│   │   └── blog/              # Artículos en Markdown
│   ├── styles/
│   │   └── global.css         # Tokens de marca + reset
│   └── content.config.ts      # Schema del blog
├── n8n-workflows/
│   ├── quenecesitas-leads.json    # Workflow listo para importar
│   └── supabase-schema.sql        # Tabla `leads` con RLS
├── .github/workflows/
│   └── deploy.yml             # Deploy a Hostinger por FTP
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

---

## 🎨 Identidad de marca

**Color primario** `#012293` (azul ultramar del logo)
**Color acento** `#FF6A3D` (naranja para CTAs y conversiones)
**Tipografía display** Bricolage Grotesque (titulares)
**Tipografía body** Montserrat (cuerpo)

Toda la paleta está definida como tokens CSS en `src/styles/global.css` (sección `@theme`). Para cambiar un color en toda la web, edita una sola línea ahí.

---

## ✏️ Cómo añadir contenido

### Nuevo artículo de blog

Crea un archivo Markdown en `src/content/blog/`:

```markdown
---
title: "Título del artículo"
description: "Resumen para Google y redes sociales (máx 160 caracteres)"
pubDate: 2026-05-15
sector: alarmas    # alarmas | energia | telefonia | inmuebles | general
author: "Equipo queNECESITAS"
tags: ["alarmas", "guía"]
draft: false       # true = no se publica
---

# Tu título

Contenido del artículo en Markdown normal.
```

El artículo aparecerá automáticamente en `/blog` y será accesible en `/blog/<nombre-del-archivo>`.

### Modificar texto de una página

Cada página vive en `src/pages/`. Son archivos `.astro` que combinan frontmatter (lógica) y plantilla (HTML). El texto se edita directamente en la plantilla.

### Modificar componentes (header, footer, formularios)

Vive todo en `src/components/`. Los componentes son reutilizables — al modificar `Footer.astro` se actualiza el footer en todas las páginas.

---

## 📨 Configuración del webhook (n8n + Brevo + Supabase)

El proyecto tiene formularios en home, contacto y las 4 páginas de sector. Todos envían al mismo webhook de n8n con un campo `origen` para diferenciarlos.

### A) Importar workflow en n8n

1. Abre tu instancia n8n en Hostinger.
2. Menú lateral → **Workflows** → **Import from file**.
3. Sube `n8n-workflows/quenecesitas-leads.json`.
4. Configura las credenciales (los nodos tienen IDs placeholders):
   - **Brevo API Key** (Generic HTTP Header Auth):
     - Header name: `api-key`
     - Header value: tu API key de Brevo
   - **Supabase Service Role** (Generic HTTP Header Auth):
     - Crea **dos** headers en una credencial: `apikey` con la service role key, y `Authorization` con `Bearer <SERVICE_ROLE_KEY>`
5. En el nodo **Supabase · Insertar lead en CRM**, edita la URL y sustituye `YOUR_PROJECT` por tu project ref de Supabase.
6. **Activa** el workflow.
7. Copia la URL del webhook (botón "Production URL" del nodo Webhook) y pégala en `.env` como `PUBLIC_N8N_WEBHOOK_URL`.

### B) Crear la tabla `leads` en Supabase

1. SQL Editor → New query → pega el contenido de `n8n-workflows/supabase-schema.sql` → Run.
2. Esto crea la tabla `leads` con RLS habilitado y la vista `leads_resumen` para tu dashboard.

### C) Verificar end-to-end

1. Arranca la web en local: `npm run dev`.
2. Envía el formulario de la home con datos de prueba.
3. Comprueba:
   - ✅ Llega un email a `info@quenecesitashoy.es`
   - ✅ El cliente recibe email de confirmación
   - ✅ Aparece una fila nueva en `public.leads` en Supabase
   - ✅ La web muestra "¡Recibido!"

---

## 🚢 Despliegue a Hostinger

### Opción 1 · GitHub Actions (recomendado)

El archivo `.github/workflows/deploy.yml` despliega automáticamente en cada push a `main`. Para activarlo:

1. **Repositorio en GitHub**: sube el proyecto.
2. **Settings → Secrets and variables → Actions** → añade:
   - `FTP_HOST` — host FTP de Hostinger (`ftp.tudominio.es`)
   - `FTP_USER` — usuario FTP
   - `FTP_PASSWORD` — contraseña FTP
   - `FTP_TARGET_DIR` — carpeta destino (ej. `/public_html/` o `/domains/quenecesitashoy.es/public_html/`)
   - `PUBLIC_N8N_WEBHOOK_URL` — el webhook de producción de n8n
   - `PUBLIC_SITE_URL` — `https://quenecesitashoy.es`
3. Cada `git push origin main` lanza un build + deploy automático.

### Opción 2 · Subida manual

1. `npm run build`
2. Sube todo el contenido de `dist/` a la carpeta pública de Hostinger por FTP.

---

## 📊 SEO incluido de serie

- **Sitemap automático** en `/sitemap-index.xml` (vía `@astrojs/sitemap`).
- **robots.txt** apuntando al sitemap.
- **Open Graph + Twitter Cards** en todas las páginas.
- **JSON-LD** schema.org `LocalBusiness` con tus datos legales en cada página.
- **JSON-LD** `FAQPage` en cada página de sector (rich snippets de Google).
- **JSON-LD** `Article` en posts del blog.
- **Canonicals** automáticos.
- **Lang ES** y locale ES_ES.
- **Meta description** personalizada por página.

---

## 🛠️ Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo en :4321 |
| `npm run build` | Genera HTML estático en `/dist` |
| `npm run preview` | Sirve `/dist` para verificar el build |
| `npm run astro check` | Comprobación de tipos |

---

## 📝 Tareas pendientes para el lanzamiento

- [ ] **Sustituir `public/logo.svg` por el SVG vectorial real** del logo (el actual es provisional con texto).
- [ ] **Sustituir `public/og-default.png`** por una imagen optimizada para redes sociales (1200×630).
- [ ] Configurar Brevo, Supabase y n8n según la sección "Configuración del webhook".
- [ ] Importar el workflow `quenecesitas-leads.json` en n8n y rellenar credenciales.
- [ ] Ejecutar `supabase-schema.sql` en Supabase.
- [ ] Configurar los secrets de GitHub Actions para deploy automático.
- [ ] Confirmar las URLs de redes sociales en `Footer.astro` (Instagram, Facebook, LinkedIn).
- [ ] Verificar el dominio `quenecesitashoy.es` en Brevo (sender authentication) para mejor entregabilidad.
- [ ] Dar de alta la web en **Google Search Console** y subir el sitemap.
- [ ] Considerar aviso de cookies si en algún momento se añade Google Analytics o píxel de Meta.

---

## 🤝 Soporte

Si algo se rompe en producción, lo primero a revisar:

1. ¿La variable `PUBLIC_N8N_WEBHOOK_URL` está configurada en GitHub Secrets?
2. ¿El workflow de n8n está **activo** (no solo guardado)?
3. ¿La service role key de Supabase es la correcta (NO la anon key)?
4. ¿El dominio `quenecesitashoy.es` está verificado en Brevo?

---

**queNECESITAS** · Marca de Gespronet Axencia de Marketing e Deseño S.L. · CIF B75490136
