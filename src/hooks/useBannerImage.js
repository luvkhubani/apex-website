import { useState, useEffect } from 'react';

const KEY = 'apex_banner_config';

const EMPTY = { image:'', label:'Highlight of the Day', title:'', subtitle:'', price:'', ctaText:'Order on WhatsApp', ctaLink:'' };

function load() {
  try { const s = localStorage.getItem(KEY); if (s) return { ...EMPTY, ...JSON.parse(s) }; } catch (_) {}
  return { ...EMPTY };
}

export function useBannerConfig() {
  const [cfg, setCfg] = useState(load);

  useEffect(() => {
    fetch('/api/banner-config')
      .then(r => r.ok ? r.json() : null)
      .then(remote => {
        if (!remote) return;
        const merged = { ...EMPTY, ...remote };
        setCfg(merged);
        localStorage.setItem(KEY, JSON.stringify(merged));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const h = () => setCfg(load());
    window.addEventListener('apex-banner', h);
    return () => window.removeEventListener('apex-banner', h);
  }, []);

  return cfg;
}

export function saveBannerConfig(cfg) {
  localStorage.setItem(KEY, JSON.stringify(cfg));
  window.dispatchEvent(new Event('apex-banner'));
}

export { EMPTY as BANNER_EMPTY };
