// =========================================================
// Cliente Supabase · solo lectura, solo en build time
// =========================================================
// Astro genera estáticamente las páginas, así que el service role
// key solo se usa durante `npm run build`. No se envía al navegador.
// =========================================================

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  throw new Error("Falta PUBLIC_SUPABASE_URL en las variables de entorno");
}
if (!SERVICE_ROLE) {
  throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY en las variables de entorno");
}

// Cliente singleton usado durante el build para leer la tabla
// properties, property_photos y firmar URLs del bucket privado.
export const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

/**
 * Firma una URL de un objeto en el bucket "documentos" con vida larga.
 * 1 año = 31.536.000 segundos. Si la web pasa más de un año sin
 * rebuildearse, hay que volver a firmar — pero en condiciones normales
 * se refresca con cada deploy.
 */
export async function signPhotoUrl(path: string): Promise<string | null> {
  if (!path) return null;
  // Las URLs en property_photos.url son rutas relativas al bucket,
  // tipo: properties/<id>/fotos/<nombre>.jpg
  const { data, error } = await supabase.storage
    .from("documentos")
    .createSignedUrl(path, 60 * 60 * 24 * 365); // 1 año

  if (error) {
    console.warn(`[inmuebles] no se pudo firmar foto ${path}:`, error.message);
    return null;
  }
  return data.signedUrl;
}
