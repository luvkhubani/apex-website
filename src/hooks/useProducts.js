import { useState, useEffect } from "react";
import defaultProducts from "../data/products";

const STORAGE_KEY = "apex_products_override";

function baseProducts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (_) {}
  return defaultProducts;
}

export function useProducts() {
  const [products, setProducts] = useState(baseProducts);

  // Merge image-path overrides from GitHub-committed JSON so all browsers see images
  useEffect(() => {
    fetch("/product-images.json?v=" + Date.now())
      .then(r => r.ok ? r.json() : null)
      .then(imageMap => {
        if (!imageMap || typeof imageMap !== "object") return;
        setProducts(prev =>
          prev.map(p => {
            const img = imageMap[String(p.id)];
            return img ? { ...p, image: img } : p;
          })
        );
      })
      .catch(() => {});
  }, []);

  // React to localStorage changes (admin panel in another tab)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try { setProducts(JSON.parse(e.newValue)); } catch (_) {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return products;
}
