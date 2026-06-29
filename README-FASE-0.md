# queNECESITAS · Fase 0 — Reposicionamiento de marca

Cambios para reorientar la web hacia **inmobiliaria + activos de inversión**, ocultando alarmas, energía y telefonía de la navegación principal.

## Resumen de cambios

- **Menú principal** (Header): solo 4 secciones — Inmuebles, Activos de inversión, Sobre nosotros, Blog, Contacto.
- **Home** (`/`): hero nuevo, doble CTA "Vender / Comprar", servicios reducidos a 2 cards (inmuebles + activos), "Por qué nosotros" con cercanía local dominante, zona de actividad, cómo trabajamos. Tagline conservado: "No nos casamos con nadie. Solo con tu beneficio."
- **`/inmuebles`**: nueva landing principal con anclas `#vender` y `#comprar`. Bloque para propietarios (captación), bloque para compradores (búsqueda activa), zona de actividad y FAQs. Dos formularios `ContactForm` con origen distinto.
- **`/activos-inversion`** (NUEVA): landing dedicada para inversores. Tipos de activo (NPL, subastas, lotes), proceso, due diligence, formulario discreto.
- **`/sobre-nosotros`**: copy reescrito con el nuevo enfoque y los datos de Gespronet.
- **`/contacto`**: copy adaptado, formulario con sector limitado a Inmuebles / Activos / Otro.
- **`/alarmas`, `/energia`, `/telefonia`**: SE QUEDAN COMO ESTÁN. No están enlazadas pero la URL sigue accesible si alguien la teclea directamente.
- **Footer**: menú simplificado, sin enlaces a sectores eliminados.
- **`ContactForm.astro`**: refactorizado con prop `cta` personalizable y `mostrarSector` opcional. Selector de sector solo con Inmuebles / Activos / Otro.
- **Workflow n8n v2**: mapping de etiquetas adaptado (sin alarmas/energía/telefonía).

## Cómo aplicar los cambios

### 1. Sustituir archivos en tu proyecto local

Descomprime este ZIP en una carpeta auxiliar y sustituye los archivos en tu repo local `C:\Users\anton\Documents\quenecesitas-web\`:

```
src/components/Header.astro       ← sustituir
src/components/Footer.astro       ← sustituir
src/components/ContactForm.astro  ← sustituir
src/pages/index.astro             ← sustituir
src/pages/inmuebles.astro         ← sustituir
src/pages/sobre-nosotros.astro    ← sustituir
src/pages/contacto.astro          ← sustituir
src/pages/activos-inversion.astro ← AÑADIR (es nuevo)
n8n-workflows/quenecesitas-leads-v2.json  ← AÑADIR (es nuevo)
```

Archivos que NO se tocan:
- `src/pages/alarmas.astro`, `energia.astro`, `telefonia.astro` (quedan accesibles vía URL directa)
- `src/pages/blog/*`
- `src/pages/aviso-legal.astro`, `politica-privacidad.astro`, `politica-cookies.astro`
- `src/layouts/BaseLayout.astro`
- `src/styles/*`
- Componentes auxiliares (`Hero.astro`, `StatsBar.astro`, etc.) que ya no se usan en la home nueva pero no estorban si los dejas.

### 2. Commit y push

```bash
cd C:\Users\anton\Documents\quenecesitas-web
git add .
git commit -m "Fase 0: reposicionamiento marca - inmobiliaria + activos de inversión"
git push
```

GitHub Actions lanzará el deploy automático a Hostinger (1-3 minutos).

### 3. Verificar en producción

Abre https://quenecesitashoy.es en modo incógnito y comprueba:

- Menú principal sin alarmas/energía/telefonía
- Home con el hero nuevo y doble CTA
- `/inmuebles` con anclas funcionando (`#vender`, `#comprar`)
- `/activos-inversion` cargando bien
- `/contacto` con el selector limitado
- Formularios funcionando (envía uno de prueba para confirmar)
- `/alarmas` SÍ debe ser accesible si tecleas la URL directamente

### 4. Actualizar el workflow de n8n (opcional)

Si quieres mantener limpio el mapping de etiquetas en los emails internos:

1. Abre tu instancia de n8n
2. Workflows → Import from File → selecciona `n8n-workflows/quenecesitas-leads-v2.json`
3. Asigna las credenciales de Brevo a los dos nodos (igual que con el workflow anterior)
4. Verifica que la URL del nodo de Supabase es la correcta para tu proyecto
5. **Desactiva el workflow anterior** y **activa este nuevo**
6. La URL del webhook **es exactamente la misma** (`/webhook/quenecesitas-leads`), no necesitas cambiar el Secret en GitHub

## Lo que NO está en esta Fase 0

Se queda para fases siguientes:

- Listado dinámico de inmuebles desde el CRM (Fase 1)
- Fichas individuales de cada inmueble (Fase 1)
- Catálogo dinámico de activos de inversión (Fase 2)
- Página específica `/vende-tu-inmueble` con formulario detallado (Fase 3)
- Limpieza de blog posts que mencionen alarmas/energía/telefonía (cuando los revises)
- Actualización de Google Search Console / sitemap (cuando decidas qué hacer definitivamente con las URLs antiguas)

## Notas

- **Imágenes de los hero**: los hero usan "cards" decorativas en lugar de fotografía real. Cuando tengas fotos de inmuebles propios o de la zona, sustituyo esos bloques por imágenes reales.
- **JSON-LD**: el schema.org actual (LocalBusiness) sigue siendo válido pero, para SEO inmobiliario, idealmente cambiar a `RealEstateAgent` en una fase posterior junto con `Place` para cada zona. No es crítico ahora.
- **Statsbar de la home**: los textos son cualitativos, no numéricos. Si en el futuro tienes cifras reales (inmuebles vendidos, % de éxito, etc.) las metemos.
