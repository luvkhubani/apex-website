import { useEffect, useRef, useState } from 'react';

/**
 * Returns [ref, isInView].
 * Once the element enters the viewport the state flips to true
 * and the observer disconnects (fire-once).
 */
export function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isInView];
}
