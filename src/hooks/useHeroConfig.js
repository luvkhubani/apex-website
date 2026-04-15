import { useState, useEffect } from 'react';

const KEY = 'apex_hero_config';

function load() {
  try { const s = localStorage.getItem(KEY); if (s) return JSON.parse(s); } catch (_) {}
  return [];
}

export function useHeroConfig() {
  const [c, setC] = useState(load);

  useEffect(() => {
    fetch('/api/hero-config')
      .then(r => r.ok ? r.json() : null)
      .then(remote => {
        // Only apply if admin has explicitly saved (has _savedAt timestamp)
        if (!remote || !Array.isArray(remote.heroConfig) || !remote._savedAt) return;
        setC(remote.heroConfig);
        localStorage.setItem(KEY, JSON.stringify(remote.heroConfig));
      })
      .catch(() => {
        // Fallback for local dev (API not running)
        fetch('/hero-config.json?v=' + Date.now())
          .then(r => r.ok ? r.json() : null)
          .then(remote => {
            if (!remote || !Array.isArray(remote.heroConfig) || !remote._savedAt) return;
            setC(remote.heroConfig);
            localStorage.setItem(KEY, JSON.stringify(remote.heroConfig));
          })
          .catch(() => {});
      });
  }, []);

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
