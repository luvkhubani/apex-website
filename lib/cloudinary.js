import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Derive a stable public_id from a path like "apple/iphone-15/black.jpg"
// Cloudinary manages the format separately, so we strip the extension.
function toPublicId(folder, rawPath) {
  const noExt = rawPath.replace(/\.[^.]+$/, '');
  return `${folder}/${noExt}`;
}

/**
 * Upload a base64-encoded image buffer to Cloudinary.
 * @param {string} base64   Raw base64 string (no data URI prefix)
 * @param {string} folder   Top-level folder: "products" or "store"
 * @param {string} rawPath  Sub-path used as stable public_id, e.g. "apple/iphone-15/black.jpg"
 * @returns {Promise<string>} Permanent HTTPS URL
 */
export async function uploadBase64(base64, folder, rawPath) {
  // Detect format from base64 magic bytes to preserve PNG transparency
  const isPng = base64.startsWith('iVBOR'); // PNG magic: \x89PNG
  const mime   = isPng ? 'image/png' : 'image/jpeg';
  const dataUri  = `data:${mime};base64,${base64}`;
  const publicId = toPublicId(folder, rawPath);
  const result   = await cloudinary.uploader.upload(dataUri, {
    public_id:    publicId,
    overwrite:    true,
    invalidate:   true,
    resource_type:'image',
  });
  return result.secure_url;
}

/**
 * Fetch an external URL and upload it to Cloudinary server-side.
 * @param {string} imageUrl  Source URL to fetch
 * @param {string} folder    Top-level folder
 * @param {string} rawPath   Sub-path used as stable public_id
 * @returns {Promise<string>} Permanent HTTPS URL
 */
export async function uploadFromUrl(imageUrl, folder, rawPath) {
  const publicId = toPublicId(folder, rawPath);
  const result   = await cloudinary.uploader.upload(imageUrl, {
    public_id:    publicId,
    overwrite:    true,
    invalidate:   true,
    resource_type:'image',
  });
  return result.secure_url;
}
