// Acceso a Supabase (tabla properties / property_photos) vía REST + Storage,
// sin depender de @supabase/supabase-js. Se ejecuta en build time (SSG).

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL || "https://vkhbkdibihwmwyshrofx.supabase.co";
const SUPABASE_ANON_KEY =
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZraGJrZGliaWh3bXd5c2hyb2Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NzgyMDQsImV4cCI6MjA4NzI1NDIwNH0.UsFIv4kM3jbzTsR_xMWwWr5bj7F7ZiWdP6xpPOATRNw";

// Nombre del bucket de Supabase Storage donde viven las fotos. Ajusta esta
// constante (o define PUBLIC_SUPABASE_PHOTOS_BUCKET) si el bucket real se llama distinto.
const PHOTOS_BUCKET = import.meta.env.PUBLIC_SUPABASE_PHOTOS_BUCKET || "documentos";

// Las signed URLs se generan en build time. Duración larga porque el sitio
// es estático y no se regenera hasta el siguiente deploy/rebuild.
const SIGNED_URL_EXPIRES_IN = 60 * 60 * 24 * 180; // 180 días

const REST_URL = `${SUPABASE_URL}/rest/v1`;
const STORAGE_URL = `${SUPABASE_URL}/storage/v1`;

const authHeaders = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
};

// Este proyecto de Supabase expone el esquema "api" por defecto en PostgREST
// (no "public"), así que hay que pedir explícitamente el esquema public.
const restHeaders = { ...authHeaders, "Accept-Profile": "public" };

async function restFetch(path) {
  const res = await fetch(`${REST_URL}${path}`, { headers: restHeaders });
  if (!res.ok) {
    console.error(`[properties] Supabase REST error ${res.status} en ${path}`);
    return [];
  }
  return res.json();
}

/** Inmuebles publicados y disponibles/reservados, para el catálogo. */
export async function fetchPublishedProperties() {
  const data = await restFetch(
    "/properties?select=*&publicado_web=eq.true&estado_venta=in.(Disponible,Reservado)&order=id.desc"
  );
  console.log('[inmuebles] total:', data?.length, 'error:', data?.error);

  return data;
}

/** Un inmueble publicado por id, para la ficha individual. */
export async function fetchPropertyById(id) {
  const rows = await restFetch(
    `/properties?select=*&id=eq.${encodeURIComponent(id)}&publicado_web=eq.true&limit=1`
  );
  return rows[0] || null;
}

/** Fotos de un inmueble, ordenadas. */
export async function fetchPropertyPhotos(propertyId) {
  return restFetch(
    `/property_photos?select=*&property_id=eq.${encodeURIComponent(propertyId)}&order=orden.asc`
  );
}

/**
 * Convierte el valor guardado en property_photos.url en una URL utilizable:
 * - si ya es una URL absoluta (http/https), se usa tal cual.
 * - si es una ruta relativa dentro del bucket, se firma contra Supabase Storage.
 */
export async function getSignedPhotoUrl(rawUrl) {
  if (!rawUrl) return null;
  if (/^https?:\/\//i.test(rawUrl)) return rawUrl;

  const path = rawUrl.replace(/^\/+/, "");
  try {
    const res = await fetch(`${STORAGE_URL}/object/sign/${PHOTOS_BUCKET}/${path}`, {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ expiresIn: SIGNED_URL_EXPIRES_IN }),
    });
    if (!res.ok) {
      console.error(`[properties] No se pudo firmar la foto "${path}": HTTP ${res.status}`);
      return null;
    }
    const data = await res.json();
    return data.signedURL ? `${STORAGE_URL}${data.signedURL}` : null;
  } catch (err) {
    console.error(`[properties] Error firmando la foto "${path}":`, err);
    return null;
  }
}

/** Añade signedUrl a cada foto de una lista de property_photos. */
export async function attachSignedPhotos(photos) {
  return Promise.all(
    (photos || []).map(async (photo) => ({
      ...photo,
      signedUrl: await getSignedPhotoUrl(photo.url),
    }))
  );
}

/**
 * Foto principal (primera por "orden") de cada inmueble de una lista de ids,
 * en una sola consulta. Devuelve { [propertyId]: signedUrl }.
 */
export async function fetchMainPhotos(propertyIds) {
  if (!propertyIds || propertyIds.length === 0) return {};

  const rows = await restFetch(
    `/property_photos?select=*&property_id=in.(${propertyIds.join(",")})&order=property_id.asc,orden.asc`
  );

  const firstPhotoByProperty = {};
  for (const row of rows) {
    if (!(row.property_id in firstPhotoByProperty)) {
      firstPhotoByProperty[row.property_id] = row;
    }
  }

  const entries = await Promise.all(
    Object.entries(firstPhotoByProperty).map(async ([propertyId, photo]) => [
      propertyId,
      await getSignedPhotoUrl(photo.url),
    ])
  );

  return Object.fromEntries(entries);
}

export function formatPrecio(precio) {
  if (precio == null) return "Consultar precio";
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(precio);
}

export function formatSuperficie(m2) {
  if (m2 == null) return null;
  return `${m2} m²`;
}

export const EXTRAS = [
  { key: "garaje", label: "Garaje", icon: "🚗" },
  { key: "trastero", label: "Trastero", icon: "📦" },
  { key: "ascensor", label: "Ascensor", icon: "🛗" },
  { key: "terraza", label: "Terraza", icon: "☀️" },
  { key: "balcon", label: "Balcón", icon: "🪟" },
  { key: "jardin", label: "Jardín", icon: "🌳" },
  { key: "piscina", label: "Piscina", icon: "🏊" },
  { key: "piscina_comunitaria", label: "Piscina comunitaria", icon: "🏊‍♂️" },
  { key: "aire_acondicionado", label: "Aire acondicionado", icon: "❄️" },
  { key: "calefaccion", label: "Calefacción", icon: "🔥" },
  { key: "armarios_empotrados", label: "Armarios empotrados", icon: "🚪" },
  { key: "amueblado", label: "Amueblado", icon: "🛋️" },
  { key: "mascotas", label: "Mascotas admitidas", icon: "🐾" },
];

export const ENERGY_COLORS = {
  A: { bg: "#007A3D", fg: "#ffffff" },
  B: { bg: "#4CAF50", fg: "#ffffff" },
  C: { bg: "#AACB37", fg: "#1a1a1a" },
  D: { bg: "#FFD100", fg: "#1a1a1a" },
  E: { bg: "#F5A623", fg: "#1a1a1a" },
  F: { bg: "#E86A1C", fg: "#ffffff" },
  G: { bg: "#D32F2F", fg: "#ffffff" },
};

export function getYouTubeId(url) {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}
