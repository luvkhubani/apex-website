import { put } from '@vercel/blob';

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { imageUrl, imagePath } = req.body;
  if (!imageUrl || !imagePath) return res.status(400).json({ error: "imageUrl and imagePath are required" });

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(500).json({ error: "BLOB_READ_WRITE_TOKEN not configured" });
  }

  try {
    const imgRes = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": imageUrl,
      },
      redirect: "follow",
    });
    if (!imgRes.ok) return res.status(400).json({ error: `Could not download image (${imgRes.status})` });

    const buffer = Buffer.from(await imgRes.arrayBuffer());
    const blob = await put(`products/${imagePath}`, buffer, { access: "public", addRandomSuffix: false });

    return res.status(200).json({ success: true, url: blob.url });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
