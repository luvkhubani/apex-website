import { put } from '@vercel/blob';

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { base64, imagePath } = req.body;
  if (!base64 || !imagePath) return res.status(400).json({ error: "base64 and imagePath are required" });

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(500).json({ error: "BLOB_READ_WRITE_TOKEN not configured" });
  }

  try {
    const buffer = Buffer.from(base64, "base64");
    const blob = await put(`products/${imagePath}`, buffer, { access: "public", addRandomSuffix: false });
    return res.status(200).json({ success: true, url: blob.url });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
