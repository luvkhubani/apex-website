/**
 * Saves store images (logo, store photo, category images) to public/store/
 * so they're served at /store/<filename> — a stable URL that needs no Vite
 * processing and doesn't require a full rebuild to resolve.
 */
const OWNER = "luvkhubani";
const REPO  = "apex-website";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { base64, filename } = req.body;
  if (!base64 || !filename) return res.status(400).json({ error: "base64 and filename are required" });

  const TOKEN = process.env.GITHUB_TOKEN;
  if (!TOKEN) return res.status(500).json({ error: "GITHUB_TOKEN not configured" });

  // Sanitise filename — strip any path traversal
  const safe = filename.replace(/\.\./g, "").replace(/^\/+/, "");
  const FILE_PATH = `public/store/${safe}`;
  const PUBLIC_URL = `/store/${safe}`;

  const GH = {
    Authorization: `token ${TOKEN}`,
    "User-Agent":  "apex-admin",
    Accept:        "application/vnd.github.v3+json",
    "Content-Type":"application/json",
  };

  try {
    let existingSha;
    const checkRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
      { headers: GH }
    );
    if (checkRes.ok) existingSha = (await checkRes.json()).sha;

    const commitRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
      {
        method: "PUT",
        headers: GH,
        body: JSON.stringify({
          message: `feat: upload store image ${safe} [skip ci]`,
          content: base64,
          ...(existingSha && { sha: existingSha }),
        }),
      }
    );

    if (!commitRes.ok) {
      const err = await commitRes.json();
      return res.status(500).json({ error: err.message || "GitHub commit failed" });
    }

    return res.status(200).json({ success: true, url: PUBLIC_URL });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
