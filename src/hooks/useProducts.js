import { useState, useEffect } from "react";
import defaultProducts from "../data/products";

const STORAGE_KEY = "apex_products_override";

function localProducts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (_) {}
  return null;
}

export function useProducts() {
  const [products, setProducts] = useState(() => localProducts() || defaultProducts);

  // Fetch the GitHub-synced product catalog so ALL browsers see admin changes
  useEffect(() => {
    fetch("/products.json?v=" + Date.now())
      .then(r => r.ok ? r.json() : null)
      .then(remote => {
        if (!Array.isArray(remote) || remote.length === 0) return;
        // Remote (GitHub) is the source of truth — always use it
        setProducts(remote);
        // Keep localStorage in sync so admin edits are still instant locally
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remote));
      })
      .catch(() => {});
  }, []);

  // React to localStorage changes (admin panel saving in the same browser)
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
