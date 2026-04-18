import { uploadBase64 } from '../lib/cloudinary.js';

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { base64, imagePath } = req.body;
  if (!base64 || !imagePath) return res.status(400).json({ error: "base64 and imagePath are required" });

  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    return res.status(500).json({ error: "Cloudinary credentials not configured" });
  }

  try {
    const url = await uploadBase64(base64, 'products', imagePath);
    return res.status(200).json({ success: true, url });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
