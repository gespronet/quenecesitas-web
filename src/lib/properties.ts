// =========================================================
// Helpers de inmuebles · se ejecutan en build time
// =========================================================
// Lee properties + property_photos desde Supabase y firma las fotos
// con vida larga. Los helpers devuelven datos ya listos para renderizar.
// =========================================================

import { supabase, signPhotoUrl } from "./supabase";

export interface Photo {
  id: string;
  url: string;        // Firmada, lista para usar en <img src>
  url_4_5: string;    // Firmada, versión 4:5
  nombre: string;
  orden: number;
}

export interface Property {
  // Identificación
  id: string;
  referencia: string;
  titulo: string;
  slug: string;             // Para la URL — generado desde referencia + title

  // Clasificación
  tipo_inmueble: string;    // Casa/Chalet, Piso, Local, etc.
  estado_conservacion: string | null;
  estado_venta: string;     // Disponible, Reservado, Vendido

  // Precio
  precio: number | null;

  // Superficie
  superficie_construida: number | null;
  superficie_util: number | null;
  superficie_parcela: number | null;

  // Distribución
  habitaciones: number | null;
  banos: number | null;
  aseos: number | null;
  planta: string | null;
  orientacion: string | null;
  ano_construccion: number | null;

  // Ubicación
  direccion: string | null;
  localidad: string | null;
  municipio: string | null;
  provincia: string | null;
  codigo_postal: string | null;
  zona_barrio: string | null;

  // Amenities
  garaje: boolean;
  trastero: boolean;
  ascensor: boolean;
  terraza: boolean;
  balcon: boolean;
  jardin: boolean;
  piscina: boolean;
  piscina_comunitaria: boolean;
  aire_acondicionado: boolean;
  calefaccion: string | null;
  armarios_empotrados: boolean;
  amueblado: boolean;
  mascotas: boolean;

  // Energía
  certificado_energetico: string | null;
  consumo_energetico: number | null;

  // Descripción
  descripcion_web: string | null;
  video_url: string | null;

  // Fotos (ya firmadas)
  photos: Photo[];
  cover: Photo | null;      // Primera foto por orden

  // Meta
  fecha_publicacion: string | null;
  created_at: string | null;
  updated_at: string | null;
}

/**
 * Convierte "Casa en Guísamo" + "INM-001" → "inm-001-casa-en-guisamo"
 * Slug URL-safe, estable y reconocible.
 */
export function propertySlug(referencia: string, titulo: string): string {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  return `${norm(referencia)}-${norm(titulo)}`.slice(0, 90);
}

/**
 * Formatea un precio como "265.000 €"
 */
export function formatPrice(price: number | null): string {
  if (price === null || price === undefined) return "A consultar";
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Formatea superficie como "95 m²"
 */
export function formatArea(m2: number | null): string {
  if (!m2) return "—";
  return `${Math.round(m2)} m²`;
}

/**
 * Trae TODOS los inmuebles publicados con sus fotos firmadas.
 * Usado por el listado /inmuebles y por getStaticPaths de la ficha.
 */
export async function getPublishedProperties(): Promise<Property[]> {
  const { data: raw, error } = await supabase
    .from("properties")
    .select("*")
    .eq("publicado_web", true)
    .order("fecha_publicacion", { ascending: false });

  if (error) {
    console.error("[inmuebles] error al leer properties:", error.message);
    return [];
  }

  if (!raw || raw.length === 0) {
    console.log("[inmuebles] no hay inmuebles publicados");
    return [];
  }

  // Trae todas las fotos para esos inmuebles de golpe
  const ids = raw.map((p) => p.id);
  const { data: photos } = await supabase
    .from("property_photos")
    .select("*")
    .in("property_id", ids)
    .order("orden");

  // Firma las URLs en paralelo
  const signedPhotos = await Promise.all(
    (photos ?? []).map(async (ph) => {
      const [url, url_4_5] = await Promise.all([
        signPhotoUrl(ph.url),
        ph.url_4_5 ? signPhotoUrl(ph.url_4_5) : null,
      ]);
      return {
        id: ph.id as string,
        property_id: ph.property_id as string,
        url: url ?? "",
        url_4_5: url_4_5 ?? url ?? "",
        nombre: (ph.nombre as string) ?? "",
        orden: (ph.orden as number) ?? 0,
      };
    })
  );

  // Agrupa fotos por property_id
  const photosByProperty = new Map<string, Photo[]>();
  for (const ph of signedPhotos) {
    if (!photosByProperty.has(ph.property_id)) {
      photosByProperty.set(ph.property_id, []);
    }
    photosByProperty.get(ph.property_id)!.push({
      id: ph.id,
      url: ph.url,
      url_4_5: ph.url_4_5,
      nombre: ph.nombre,
      orden: ph.orden,
    });
  }

  // Monta el array final
  return raw.map((r): Property => {
    const propertyPhotos = (photosByProperty.get(r.id as string) ?? []).sort(
      (a, b) => a.orden - b.orden
    );
    return {
      id: r.id as string,
      referencia: (r.referencia as string) ?? "",
      titulo: (r.titulo as string) ?? "Inmueble sin título",
      slug: propertySlug(
        (r.referencia as string) ?? "ref",
        (r.titulo as string) ?? "inmueble"
      ),
      tipo_inmueble: (r.tipo_inmueble as string) ?? "",
      estado_conservacion: r.estado_conservacion as string | null,
      estado_venta: (r.estado_venta as string) ?? "Disponible",
      precio: r.precio ? Number(r.precio) : null,
      superficie_construida: r.superficie_construida
        ? Number(r.superficie_construida)
        : null,
      superficie_util: r.superficie_util ? Number(r.superficie_util) : null,
      superficie_parcela: r.superficie_parcela
        ? Number(r.superficie_parcela)
        : null,
      habitaciones: r.habitaciones as number | null,
      banos: r.banos as number | null,
      aseos: r.aseos as number | null,
      planta: r.planta as string | null,
      orientacion: r.orientacion as string | null,
      ano_construccion: r.ano_construccion as number | null,
      direccion: r.direccion as string | null,
      localidad: r.localidad as string | null,
      municipio: r.municipio as string | null,
      provincia: r.provincia as string | null,
      codigo_postal: r.codigo_postal as string | null,
      zona_barrio: r.zona_barrio as string | null,
      garaje: !!r.garaje,
      trastero: !!r.trastero,
      ascensor: !!r.ascensor,
      terraza: !!r.terraza,
      balcon: !!r.balcon,
      jardin: !!r.jardin,
      piscina: !!r.piscina,
      piscina_comunitaria: !!r.piscina_comunitaria,
      aire_acondicionado: !!r.aire_acondicionado,
      calefaccion: r.calefaccion as string | null,
      armarios_empotrados: !!r.armarios_empotrados,
      amueblado: !!r.amueblado,
      mascotas: !!r.mascotas,
      certificado_energetico: r.certificado_energetico as string | null,
      consumo_energetico: r.consumo_energetico as number | null,
      descripcion_web: r.descripcion_web as string | null,
      video_url: r.video_url as string | null,
      photos: propertyPhotos,
      cover: propertyPhotos[0] ?? null,
      fecha_publicacion: r.fecha_publicacion as string | null,
      created_at: r.created_at as string | null,
      updated_at: r.updated_at as string | null,
    };
  });
}

/**
 * Trae los inmuebles destacados para la home / /inmobiliaria.
 * Por ahora: los últimos N publicados.
 */
export async function getFeaturedProperties(limit = 3): Promise<Property[]> {
  const all = await getPublishedProperties();
  return all.slice(0, limit);
}

/**
 * Lista de amenities activos para mostrar como chips en la ficha
 */
export function getActiveAmenities(p: Property): { key: string; label: string }[] {
  const items: { key: string; label: string; active: boolean }[] = [
    { key: "garaje", label: "Garaje", active: p.garaje },
    { key: "ascensor", label: "Ascensor", active: p.ascensor },
    { key: "trastero", label: "Trastero", active: p.trastero },
    { key: "terraza", label: "Terraza", active: p.terraza },
    { key: "balcon", label: "Balcón", active: p.balcon },
    { key: "jardin", label: "Jardín", active: p.jardin },
    { key: "piscina", label: "Piscina", active: p.piscina },
    {
      key: "piscina_comunitaria",
      label: "Piscina comunitaria",
      active: p.piscina_comunitaria,
    },
    {
      key: "aire_acondicionado",
      label: "Aire acondicionado",
      active: p.aire_acondicionado,
    },
    {
      key: "armarios_empotrados",
      label: "Armarios empotrados",
      active: p.armarios_empotrados,
    },
    { key: "amueblado", label: "Amueblado", active: p.amueblado },
    { key: "mascotas", label: "Admite mascotas", active: p.mascotas },
  ];
  return items.filter((i) => i.active).map(({ key, label }) => ({ key, label }));
}
