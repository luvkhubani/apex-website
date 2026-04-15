import { useState, useEffect } from 'react';

const KEY = 'apex_banner_config';

const EMPTY = { image:'', label:'Highlight of the Day', title:'', subtitle:'', price:'', ctaText:'Enquire on WhatsApp', ctaLink:'' };

function load() {
  try { const s = localStorage.getItem(KEY); if (s) return { ...EMPTY, ...JSON.parse(s) }; } catch (_) {}
  return { ...EMPTY };
}

export function useBannerConfig() {
  const [cfg, setCfg] = useState(load);

  useEffect(() => {
    // Fetch live data from API (reads GitHub directly — no redeploy needed)
    fetch('/api/hero-config')
      .then(r => r.ok ? r.json() : null)
      .then(remote => {
        if (!remote || !remote.bannerConfig) return;
        if (!remote._savedAt) return; // default empty file, ignore
        const merged = { ...EMPTY, ...remote.bannerConfig };
        setCfg(merged);
        localStorage.setItem(KEY, JSON.stringify(merged));
      })
      .catch(() => {
        // API unavailable (local dev) — fall back to static file
        return fetch('/hero-config.json?v=' + Date.now())
          .then(r => r.ok ? r.json() : null)
          .then(remote => {
            if (!remote || !remote.bannerConfig) return;
            if (!remote._savedAt) return;
            const merged = { ...EMPTY, ...remote.bannerConfig };
            setCfg(merged);
            localStorage.setItem(KEY, JSON.stringify(merged));
          })
          .catch(() => {});
      });
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
