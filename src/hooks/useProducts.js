import { useState, useEffect, useRef } from "react";
import defaultProducts from "../data/products";
import { loadStoreConfig } from "./useStoreConfig";

const STORAGE_KEY = "apex_products_override";
const CONFIG_KEY  = "apex_store_config";

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
  // Keep raw (unfiltered) products separate so we can re-filter reactively
  const rawRef = useRef(localProducts() || defaultProducts);
  const [products, setProducts] = useState(() => applyVisibility(rawRef.current));

  useEffect(() => {
    fetch("/api/products-data")
      .then(r => r.ok ? r.json() : null)
      .then(remote => {
        if (!Array.isArray(remote) || remote.length === 0) return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remote));
        rawRef.current = remote;
        setProducts(applyVisibility(remote));
      })
      .catch(() => {});
  }, []);

  // Re-filter when products change in another tab (admin saving)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed) && parsed.length > 0) {
            rawRef.current = parsed;
            setProducts(applyVisibility(parsed));
          }
        } catch (_) {}
      }
      // Re-apply visibility whenever hiddenProductIds changes
      if (e.key === CONFIG_KEY) {
        setProducts(applyVisibility(rawRef.current));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return products;
}
