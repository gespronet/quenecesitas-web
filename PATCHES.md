# Parches a aplicar MANUALMENTE a 3 archivos

## 1 · src/pages/inmobiliaria.astro

Añade el import al final del bloque de imports (al principio del frontmatter):

```astro
import InmueblesTeaser from "@components/InmueblesTeaser.astro";
```

Y añade el componente justo DESPUÉS del bloque de "zona de actividad" (sección `.qn-inm-area`) y ANTES del `<ProcessSteps>`:

```astro
<InmueblesTeaser />
```

## 2 · src/pages/inmuebles/index.astro

Añade el import en el frontmatter:

```astro
import InmobiliariaTeaser from "@components/InmobiliariaTeaser.astro";
```

Y añade el componente justo ANTES del `<ContactCTABlock>` final:

```astro
<InmobiliariaTeaser />

<ContactCTABlock
  title="¿Buscas algo distinto?"
  ...
/>
```

## 3 · Footer con logo blanco

Necesito ver el Footer.astro actual para arreglar el logo. Pásame el output de:

```bash
cat ~/Documents/dev/quenecesitas-web/src/components/Footer.astro | head -60
```

Mientras tanto, la referencia al logo blanco debería ser:

```astro
<img
  src="/logo-white.svg"
  alt="queNECESITAS"
  width="180"
  height="50"
  loading="lazy"
  decoding="async"
/>
```

Y hay que copiar el archivo:

```bash
cp ~/Downloads/Recurso_1Logo_QN_Blanco.svg ~/Documents/dev/quenecesitas-web/public/logo-white.svg
```
