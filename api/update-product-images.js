const OWNER     = "luvkhubani";
const REPO      = "apex-website";
const FILE_PATH = "public/product-images.json";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { updates } = req.body; // [{ id, imagePath }]
  if (!Array.isArray(updates) || updates.length === 0)
    return res.status(400).json({ error: "updates array is required" });

  const TOKEN = process.env.GITHUB_TOKEN;
  if (!TOKEN) return res.status(500).json({ error: "GITHUB_TOKEN not configured" });

  const GH = {
    Authorization: `token ${TOKEN}`,
    "User-Agent":  "apex-admin",
    Accept:        "application/vnd.github.v3+json",
    "Content-Type":"application/json",
  };

  try {
    // 1 — Read existing file (if it exists)
    let existing = {};
    let existingSha;
    const checkRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
      { headers: GH }
    );
    if (checkRes.ok) {
      const data = await checkRes.json();
      existingSha = data.sha;
      existing = JSON.parse(Buffer.from(data.content, "base64").toString("utf-8"));
    }

    // 2 — Merge updates (id → imagePath)
    const merged = { ...existing };
    for (const { id, imagePath } of updates) {
      if (id != null && imagePath) merged[String(id)] = imagePath;
    }

    // 3 — Commit back
    const content = Buffer.from(JSON.stringify(merged, null, 2)).toString("base64");
    const commitRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
      {
        method: "PUT",
        headers: GH,
        body: JSON.stringify({
          message: `feat: update product image paths`,
          content,
          ...(existingSha && { sha: existingSha }),
        }),
      }
    );

    if (!commitRes.ok) {
      const err = await commitRes.json();
      return res.status(500).json({ error: err.message || "GitHub commit failed" });
    }

    return res.status(200).json({ success: true, updated: Object.keys(merged).length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
