import { useState, useEffect } from "react";
import defaultProducts from "../data/products";
import { loadStoreConfig } from "./useStoreConfig";

const STORAGE_KEY = "apex_products_override";

function localProducts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (_) {}
  return null;
}

function applyVisibility(products) {
  const hidden = new Set(loadStoreConfig().hiddenProductIds || []);
  if (hidden.size === 0) return products;
  return products.filter(p => !hidden.has(p.id));
}

export function useProducts() {
  const [products, setProducts] = useState(() => applyVisibility(localProducts() || defaultProducts));

  useEffect(() => {
    fetch("/api/products-data")
      .then(r => r.ok ? r.json() : null)
      .then(remote => {
        if (!Array.isArray(remote) || remote.length === 0) return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remote));
        setProducts(applyVisibility(remote));
      })
      .catch(() => {});
  }, []);

  // React to localStorage changes (admin panel saving in same browser)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed) && parsed.length > 0) setProducts(applyVisibility(parsed));
        } catch (_) {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return products;
}
