import { useState, useEffect } from "react";
import defaultProducts from "../data/products";

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

export function useProducts() {
  const [products, setProducts] = useState(() => localProducts() || defaultProducts);

  useEffect(() => {
    // Fetch live data from API (reads GitHub directly — no redeploy needed)
    fetch("/api/products-data")
      .then(r => r.ok ? r.json() : null)
      .then(remote => {
        if (!Array.isArray(remote) || remote.length === 0) return;
        setProducts(remote);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remote));
      })
      .catch(() => {
        // API unavailable (local dev) — fall back to static file
        return fetch("/products.json?v=" + Date.now())
          .then(r => r.ok ? r.json() : null)
          .then(remote => {
            if (!Array.isArray(remote) || remote.length === 0) return;
            setProducts(remote);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(remote));
          })
          .catch(() => {});
      });
  }, []);

  // React to localStorage changes (admin panel saving in same browser)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed) && parsed.length > 0) setProducts(parsed);
        } catch (_) {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return products;
}
