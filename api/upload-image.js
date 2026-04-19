import { uploadBase64, uploadFromUrl } from '../lib/cloudinary.js';

// Unified upload endpoint — replaces import-image.js and upload-store-image.js
// Body params:
//   imageUrl + imagePath [+ folder]  → remote URL import
//   base64   + imagePath [+ folder]  → base64 upload
//   base64   + filename  [+ folder]  → base64 upload (store compat)
// folder defaults to 'products'
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    return res.status(500).json({ error: 'Cloudinary credentials not configured' });
  }

  const { imageUrl, base64, imagePath, filename, folder = 'products' } = req.body || {};
  const path = imagePath || filename;

  try {
    let url;
    if (imageUrl && path) {
      url = await uploadFromUrl(imageUrl, folder, path);
    } else if (base64 && path) {
      url = await uploadBase64(base64, folder, path);
    } else {
      return res.status(400).json({ error: 'Provide (imageUrl + imagePath) or (base64 + imagePath/filename)' });
    }
    return res.status(200).json({ success: true, url });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
