import { useState, useEffect } from "react";
import defaultProducts from "../data/products";

const STORAGE_KEY = "apex_products_override";

export function useProducts() {
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return defaultProducts;
  });

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
