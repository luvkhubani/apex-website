import { useState, useEffect } from 'react';

const KEY = 'apex_banner_image';

export function useBannerImage() {
  const [img, setImg] = useState(() => localStorage.getItem(KEY) || '');
  useEffect(() => {
    const h = () => setImg(localStorage.getItem(KEY) || '');
    window.addEventListener('apex-banner', h);
    return () => window.removeEventListener('apex-banner', h);
  }, []);
  return img;
}

export function saveBannerImage(url) {
  localStorage.setItem(KEY, url);
  window.dispatchEvent(new Event('apex-banner'));
}
