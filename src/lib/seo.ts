/**
 * Módulo SEO: genera datos consistentes para todas las páginas
 * queNECESITAS · Gespronet · Oleiros
 */

export type PageType = "home" | "service" | "hub" | "content" | "legal";

export interface SeoProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
  type?: PageType;
  /** para JSON-LD Service */
  serviceName?: string;
  serviceArea?: string[];
}

const SITE_NAME = "queNECESITAS";
const SITE_URL = "https://quenecesitashoy.es";
const DEFAULT_OG_IMAGE = "/og-default.png";

const COMPANY = {
  name: "Gespronet Axencia de Marketing e Deseño S.L.",
  brand: "queNECESITAS",
  cif: "B75490136",
  street: "Rúa do Souto 1, Porto de Santa Cruz",
  city: "Oleiros",
  region: "A Coruña",
  postalCode: "15179",
  country: "ES",
  phone: "+34 672 274 969",
  email: "info@quenecesitashoy.es",
  hours: "Mo-Fr 08:00-16:00",
  latitude: 43.3623,
  longitude: -8.3197,
};

const SERVICE_AREA = [
  "A Coruña",
  "Oleiros",
  "Sada",
  "Bergondo",
  "Cambre",
  "Culleredo",
];

/**
 * Formatea el título completo <title>
 */
export function formatTitle(pageTitle: string): string {
  if (pageTitle === SITE_NAME) return pageTitle;
  return `${pageTitle} · ${SITE_NAME}`;
}

/**
 * Devuelve la URL absoluta canonical
 */
export function absoluteUrl(path: string): string {
  const cleaned = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${cleaned}`;
}

/**
 * JSON-LD para LocalBusiness (página home)
 */
export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#localbusiness`,
    name: COMPANY.brand,
    legalName: COMPANY.name,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.svg`,
    image: `${SITE_URL}/og-default.png`,
    telephone: COMPANY.phone,
    email: COMPANY.email,
    priceRange: "€€",
    address: {
      "@type": "PostalAddress",
      streetAddress: COMPANY.street,
      addressLocality: COMPANY.city,
      addressRegion: COMPANY.region,
      postalCode: COMPANY.postalCode,
      addressCountry: COMPANY.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: COMPANY.latitude,
      longitude: COMPANY.longitude,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "16:00",
    },
    areaServed: SERVICE_AREA.map((area) => ({
      "@type": "Place",
      name: area,
    })),
    sameAs: ["https://www.linkedin.com/company/quenecesitas"],
  };
}

/**
 * JSON-LD para Service (páginas de servicio individuales)
 */
export function serviceSchema(name: string, description: string, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: absoluteUrl(url),
    provider: {
      "@type": "LocalBusiness",
      "@id": `${SITE_URL}/#localbusiness`,
    },
    areaServed: SERVICE_AREA.map((area) => ({
      "@type": "Place",
      name: area,
    })),
  };
}

/**
 * JSON-LD para RealEstateAgent (landing inmobiliaria)
 */
export function realEstateAgentSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": `${SITE_URL}/inmobiliaria#agent`,
    name: `${COMPANY.brand} · Inmobiliaria`,
    url: `${SITE_URL}/inmobiliaria`,
    parentOrganization: {
      "@type": "LocalBusiness",
      "@id": `${SITE_URL}/#localbusiness`,
    },
    areaServed: SERVICE_AREA.map((area) => ({
      "@type": "Place",
      name: area,
    })),
  };
}

/**
 * JSON-LD para FAQPage
 */
export function faqSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * JSON-LD para BreadcrumbList
 */
export function breadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}

export const SITE = {
  name: SITE_NAME,
  url: SITE_URL,
  defaultOgImage: DEFAULT_OG_IMAGE,
  company: COMPANY,
  serviceArea: SERVICE_AREA,
};
