import { useEffect } from "react";

const SITE_NAME = "Sudan Heritage";
const DEFAULT_DESCRIPTION =
  "Discover authentic handcrafted goods, aromatic spices, and natural treasures sourced directly from local artisans and markets in Sudan.";
const DEFAULT_IMAGE = "/api/og-image";

interface MetaOptions {
  title?: string;
  description?: string;
  image?: string;
  type?: string;
}

function setMeta(name: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.name = name;
    document.head.appendChild(el);
  }
  el.content = content;
}

function setOG(property: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.content = content;
}

function resolveImageUrl(image: string): string {
  if (!image || image.startsWith("idb://") || image.startsWith("blob:")) {
    return `${window.location.origin}${DEFAULT_IMAGE}`;
  }
  if (image.startsWith("http")) return image;
  return `${window.location.origin}${image}`;
}

export function useMetaTags({ title, description, image, type = "website" }: MetaOptions = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    const metaDescription = description || DEFAULT_DESCRIPTION;
    const metaImage = resolveImageUrl(image || DEFAULT_IMAGE);
    const metaUrl = window.location.href;

    document.title = fullTitle;

    setMeta("description", metaDescription);
    setOG("og:title", fullTitle);
    setOG("og:description", metaDescription);
    setOG("og:image", metaImage);
    setOG("og:image:width", "1200");
    setOG("og:image:height", "630");
    setOG("og:url", metaUrl);
    setOG("og:site_name", SITE_NAME);
    setOG("og:type", type === "product" ? "product" : "website");
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", metaDescription);
    setMeta("twitter:image", metaImage);
    setMeta("twitter:site", "@SudanHeritage");
  }, [title, description, image, type]);
}
