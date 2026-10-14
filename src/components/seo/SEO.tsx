import { useEffect } from "react";
import {
  type SEOProps,
  SITE_DEFAULTS,
  getCanonicalUrl,
  getFullImageUrl,
} from "@/lib/seo";

export default function SEO({
  title,
  description,
  keywords,
  canonicalPath,
  image,
  type = "website",
  robots = "index, follow",
  schema,
  publishedTime,
  modifiedTime,
  tags,
}: SEOProps) {
  useEffect(() => {
    // 1. Update Title
    const formattedTitle = title
      ? title.includes(SITE_DEFAULTS.author)
        ? title
        : `${title}${SITE_DEFAULTS.titleSuffix}`
      : SITE_DEFAULTS.defaultTitle;

    document.title = formattedTitle;

    // Helper to set or create meta tag
    const setMetaTag = (
      attribute: "name" | "property",
      key: string,
      content?: string
    ) => {
      if (!content) return;
      let element = document.querySelector(`meta[${attribute}="${key}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // Helper to set or create link tag
    const setLinkTag = (rel: string, href?: string) => {
      if (!href) return;
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement("link");
        element.setAttribute("rel", rel);
        document.head.appendChild(element);
      }
      element.setAttribute("href", href);
    };

    const metaDescription = description || SITE_DEFAULTS.defaultDescription;
    const metaKeywords =
      keywords && keywords.length > 0
        ? keywords.join(", ")
        : SITE_DEFAULTS.defaultKeywords.join(", ");
    const canonicalUrl = getCanonicalUrl(canonicalPath);
    const metaImage = getFullImageUrl(image);

    // 2. Standard Meta Tags
    setMetaTag("name", "description", metaDescription);
    setMetaTag("name", "keywords", metaKeywords);
    setMetaTag("name", "author", SITE_DEFAULTS.author);
    setMetaTag("name", "robots", robots);
    setLinkTag("canonical", canonicalUrl);

    // 3. Open Graph Tags
    setMetaTag("property", "og:type", type);
    setMetaTag("property", "og:site_name", SITE_DEFAULTS.siteName);
    setMetaTag("property", "og:title", formattedTitle);
    setMetaTag("property", "og:description", metaDescription);
    setMetaTag("property", "og:url", canonicalUrl);
    setMetaTag("property", "og:image", metaImage);
    setMetaTag("property", "og:locale", SITE_DEFAULTS.locale);

    if (publishedTime) {
      setMetaTag("property", "article:published_time", publishedTime);
    }
    if (modifiedTime) {
      setMetaTag("property", "article:modified_time", modifiedTime);
    }
    if (tags && tags.length > 0) {
      tags.forEach((tag) => setMetaTag("property", "article:tag", tag));
    }

    // 4. Twitter Cards
    setMetaTag("name", "twitter:card", "summary_large_image");
    setMetaTag("name", "twitter:title", formattedTitle);
    setMetaTag("name", "twitter:description", metaDescription);
    setMetaTag("name", "twitter:image", metaImage);
    setMetaTag("name", "twitter:creator", SITE_DEFAULTS.twitterHandle);

    // 5. JSON-LD Structured Data Schema
    const schemaScriptId = "seo-schema-jsonld";
    let schemaElement = document.getElementById(schemaScriptId) as HTMLScriptElement | null;

    if (schema) {
      if (!schemaElement) {
        schemaElement = document.createElement("script");
        schemaElement.id = schemaScriptId;
        schemaElement.type = "application/ld+json";
        document.head.appendChild(schemaElement);
      }
      schemaElement.textContent = JSON.stringify(schema);
    } else if (schemaElement) {
      schemaElement.remove();
    }

    // Cleanup on unmount
    return () => {
      const el = document.getElementById(schemaScriptId);
      if (el) el.remove();
    };
  }, [
    title,
    description,
    keywords,
    canonicalPath,
    image,
    type,
    robots,
    schema,
    publishedTime,
    modifiedTime,
    tags,
  ]);

  return null;
}
