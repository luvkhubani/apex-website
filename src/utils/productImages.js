/**
 * Vite eagerly imports every image under src/assets/products/.
 * getProductImage(path) returns the resolved URL or null.
 *
 * Usage in products.js:
 *   image: 'apple/iphone-15/IPHONE 15 BLACK.webp'
 */
const allImages = import.meta.glob(
  '/src/assets/products/**/*.{jpg,jpeg,png,webp,svg,avif}',
  { eager: true }
);

export function getProductImage(imagePath) {
  if (!imagePath) return null;
  const key = `/src/assets/products/${imagePath}`;
  return allImages[key]?.default ?? null;
}
