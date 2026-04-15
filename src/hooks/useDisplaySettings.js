import { useState, useEffect } from 'react';

const KEY = 'apex_display_settings';
export const DS_DEFAULTS = {
  showColours:      true,
  showStorage:      true,
  showRAM:          true,
  showVariantCount: true,
};

function load() {
  try { const s = localStorage.getItem(KEY); if (s) return { ...DS_DEFAULTS, ...JSON.parse(s) }; } catch (_) {}
  return { ...DS_DEFAULTS };
}

export function useDisplaySettings() {
  const [s, setS] = useState(load);
  useEffect(() => {
    const h = () => setS(load());
    window.addEventListener('apex-settings', h);
    return () => window.removeEventListener('apex-settings', h);
  }, []);
  return s;
}

export function saveDisplaySettings(s) {
  localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new Event('apex-settings'));
}
