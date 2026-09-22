# queNECESITAS · Web v2

Plataforma multiservicio local en Galicia. Alarmas, energía, telefonía, inmobiliaria, inversión y ciberseguridad. En A Coruña, Oleiros, Sada, Bergondo y comarca.

## Stack

- **Astro 5** (SSG puro)
- **CSS custom** con sistema de tokens propio (sin Tailwind)
- **Barlow** de Google Fonts como tipografía única
- **@astrojs/sitemap** para generar sitemap.xml automático
- Deploy: GitHub Actions → SFTP a Hostinger

## Desarrollo

```bash
npm install
npm run dev
```

Abre http://localhost:4321

## Comandos disponibles

| Comando | Qué hace |
| :--- | :--- |
| `npm install` | Instala dependencias |
| `npm run dev` | Servidor local con hot reload |
| `npm run build` | Genera `dist/` para producción |
| `npm run preview` | Previsualiza el build |
| `npm run check` | Verifica el proyecto (TypeScript + Astro) |

## Estructura

```
src/
├── components/       # Componentes reutilizables (Header, Footer, ContactForm...)
├── layouts/          # Layouts base con SEO + JSON-LD
├── lib/              # Helpers (seo.ts)
├── pages/            # Páginas del sitio (una URL por archivo)
└── styles/
    └── tokens.css    # Sistema de tokens visuales de marca
```

## Variables de entorno

Copia `.env.example` como `.env` y rellena:

- `PUBLIC_N8N_WEBHOOK_URL` — webhook de n8n para captura de leads
- `PUBLIC_SITE_URL` — URL pública del sitio (para canonical + sitemap)
