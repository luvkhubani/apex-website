import { useState, useEffect } from 'react';

const KEY = 'apex_hero_config';

function load() {
  try { const s = localStorage.getItem(KEY); if (s) return JSON.parse(s); } catch (_) {}
  return [];
}

export function useHeroConfig() {
  const [c, setC] = useState(load);
  useEffect(() => {
    const h = () => setC(load());
    window.addEventListener('apex-hero', h);
    return () => window.removeEventListener('apex-hero', h);
  }, []);
  return c;
}

export function saveHeroConfig(c) {
  localStorage.setItem(KEY, JSON.stringify(c));
  window.dispatchEvent(new Event('apex-hero'));
}
