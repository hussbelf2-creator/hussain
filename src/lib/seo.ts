export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalPath?: string;
  image?: string;
  type?: "website" | "article" | "profile" | "product";
  robots?: string;
  schema?: Record<string, unknown> | Array<Record<string, unknown>>;
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
}

export const SITE_DEFAULTS = {
  siteName: "حسن جمال الليل | فني ومونتير AI احترافي",
  author: "حسن جمال الليل",
  siteUrl: "https://hassanalil.com",
  defaultTitle: "حسن جمال الليل | مصور ومونتير AI احترافي - تصوير وإنتاج فيديو بالذكاء الاصطناعي",
  titleSuffix: " | حسن جمال الليل",
  defaultDescription:
    "حسن جمال الليل - فني AI متخصص في الإنتاج البصري وتوليد الصور ومونتاج الفيديو بالذكاء الاصطناعي. خدمات احترافية، كتب رقمية، وهندسة برومبتات.",
  defaultKeywords: [
    "AI Photography",
    "مصور ذكاء اصطناعي",
    "مونتاج فيديو AI",
    "برومبتات Midjourney",
    "إنتاج سينمائي",
    "حسن جمال الليل",
    "تصوير منتجات AI",
    "هندسة برومبتات",
  ],
  defaultImage: "https://hassanalil.com/me.jpg",
  locale: "ar_SA",
  twitterHandle: "@hassan_ai",
};

export function getCanonicalUrl(path?: string): string {
  if (!path) {
    if (typeof window !== "undefined") {
      return `${window.location.origin}${window.location.pathname}`;
    }
    return SITE_DEFAULTS.siteUrl;
  }
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (typeof window !== "undefined") {
    return `${window.location.origin}${cleanPath}`;
  }
  return `${SITE_DEFAULTS.siteUrl}${cleanPath}`;
}

export function getFullImageUrl(imageUrl?: string): string {
  if (!imageUrl) return SITE_DEFAULTS.defaultImage;
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  const cleanPath = imageUrl.startsWith("/") ? imageUrl.slice(1) : imageUrl;
  return `${SITE_DEFAULTS.siteUrl}/${cleanPath}`;
}

/**
 * Schema.org WebSite
 */
export function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "حسن جمال الليل | فني ومونتير AI",
    url: SITE_DEFAULTS.siteUrl,
    description: SITE_DEFAULTS.defaultDescription,
    inLanguage: "ar",
    publisher: {
      "@type": "Person",
      name: SITE_DEFAULTS.author,
    },
  };
}

/**
 * Schema.org Person & ProfessionalService
 */
export function getPersonSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE_DEFAULTS.author,
    jobTitle: "فني ومونتير AI احترافي (AI Photographer & Filmmaker)",
    url: SITE_DEFAULTS.siteUrl,
    image: SITE_DEFAULTS.defaultImage,
    description:
      "فني AI متخصص في الإنتاج البصري بالذكاء الاصطناعي، يدمج بين الحس البصري للمصور وعقلية المونتير لصناعة صور وأفلام سينمائية احترافية.",
    knowsAbout: [
      "AI Photography",
      "AI Film Editing",
      "Prompt Engineering",
      "Visual Direction",
      "Midjourney",
      "Premiere Pro",
    ],
    sameAs: [
      "https://instagram.com/hassan.ai",
      "https://wa.me/966500000000",
    ],
  };
}

/**
 * Schema.org Service
 */
export function getServiceSchema(service: {
  title: string;
  description?: string | null;
  price?: string | null;
  id: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.description || SITE_DEFAULTS.defaultDescription,
    provider: {
      "@type": "Person",
      name: SITE_DEFAULTS.author,
      url: SITE_DEFAULTS.siteUrl,
    },
    url: getCanonicalUrl(`/services/${service.id}`),
    offers: service.price
      ? {
          "@type": "Offer",
          priceCurrency: "USD",
          description: service.price,
        }
      : undefined,
  };
}

/**
 * Schema.org BlogPosting / Article
 */
export function getArticleSchema(article: {
  title: string;
  excerpt?: string;
  cover_url?: string;
  slug: string;
  created_at: string;
  tags?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt || article.title,
    image: getFullImageUrl(article.cover_url),
    url: getCanonicalUrl(`/blog/${article.slug}`),
    datePublished: article.created_at,
    dateModified: article.created_at,
    inLanguage: "ar",
    keywords: (article.tags || []).join(", "),
    author: {
      "@type": "Person",
      name: SITE_DEFAULTS.author,
      url: SITE_DEFAULTS.siteUrl,
    },
    publisher: {
      "@type": "Person",
      name: SITE_DEFAULTS.author,
      logo: {
        "@type": "ImageObject",
        url: SITE_DEFAULTS.defaultImage,
      },
    },
  };
}

/**
 * Schema.org Product / Book
 */
export function getBookSchema(book: {
  id: string;
  title: string;
  description?: string;
  cover_url?: string;
  price?: string;
  category?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: book.title,
    description: book.description || book.title,
    image: getFullImageUrl(book.cover_url),
    category: book.category || "Digital Product",
    url: getCanonicalUrl(`/books/${book.id}`),
    offers: {
      "@type": "Offer",
      price: book.price ? book.price.replace(/[^0-9.]/g, "") || "0" : "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  };
}

/**
 * Schema.org BreadcrumbList
 */
export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: getCanonicalUrl(item.url),
    })),
  };
}
