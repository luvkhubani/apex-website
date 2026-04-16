const OWNER = "luvkhubani";
const REPO  = "apex-website";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { imageUrl, imagePath } = req.body;
  if (!imageUrl || !imagePath) return res.status(400).json({ error: "imageUrl and imagePath are required" });

  const TOKEN = process.env.GITHUB_TOKEN;
  if (!TOKEN) return res.status(500).json({ error: "GITHUB_TOKEN not configured on server" });

  const FILE_PATH = `src/assets/products/${imagePath}`;
  const GH_HEADERS = {
    Authorization: `token ${TOKEN}`,
    "User-Agent":  "apex-admin",
    Accept:        "application/vnd.github.v3+json",
    "Content-Type":"application/json",
  };

  try {
    // 1 — Download the image (browser-like headers to bypass bot protection)
    const imgRes = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": imageUrl,
      },
      redirect: "follow",
    });
    if (!imgRes.ok) return res.status(400).json({ error: `Could not download image (${imgRes.status}): ${imgRes.statusText}` });
    const buffer     = await imgRes.arrayBuffer();
    const base64     = Buffer.from(buffer).toString("base64");

    // 2 — Check if file already exists (need its SHA to overwrite)
    let existingSha;
    const checkRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
      { headers: GH_HEADERS }
    );
    if (checkRes.ok) {
      const existing = await checkRes.json();
      existingSha = existing.sha;
    }

    // 3 — Commit to GitHub
    const commitRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
      {
        method: "PUT",
        headers: GH_HEADERS,
        body: JSON.stringify({
          message: `feat: add product image ${imagePath} [skip ci]`,
          content: base64,
          ...(existingSha && { sha: existingSha }),
        }),
      }
    );

    if (!commitRes.ok) {
      const err = await commitRes.json();
      return res.status(500).json({ error: err.message || "GitHub commit failed" });
    }

    return res.status(200).json({ success: true, path: imagePath });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
