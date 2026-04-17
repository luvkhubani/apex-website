const OWNER = "luvkhubani";
const REPO  = "apex-website";
const FILE  = "public/store-photos.json";

const GH = (token) => ({
  Authorization: `token ${token}`,
  "User-Agent":  "apex-admin",
  Accept:        "application/vnd.github.v3+json",
  "Content-Type":"application/json",
});

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=86400");
  if (req.method === "OPTIONS") return res.status(200).end();

  const TOKEN = process.env.GITHUB_TOKEN;
  if (!TOKEN) return res.status(500).json({ error: "GITHUB_TOKEN not configured" });

  // GET — return current photo list
  if (req.method === "GET") {
    try {
      const r = await fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE}`,
        { headers: GH(TOKEN) }
      );
      if (!r.ok) return res.status(200).json([]);  // file doesn't exist yet → empty list
      const { content } = await r.json();
      const photos = JSON.parse(Buffer.from(content, "base64").toString("utf8"));
      return res.status(200).json(Array.isArray(photos) ? photos : []);
    } catch (e) {
      return res.status(200).json([]);
    }
  }

  // POST — save photo list
  if (req.method === "POST") {
    const { photos } = req.body;
    if (!Array.isArray(photos)) return res.status(400).json({ error: "photos must be an array" });

    // Filter out any blob: or invalid URLs
    const clean = photos.filter(p => p && typeof p === "string" && !p.startsWith("blob:") && !p.startsWith("data:"));

    try {
      // Get current SHA if file exists
      let sha;
      const check = await fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE}`,
        { headers: GH(TOKEN) }
      );
      if (check.ok) sha = (await check.json()).sha;

      const content = Buffer.from(JSON.stringify(clean, null, 2)).toString("base64");
      const put = await fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE}`,
        {
          method: "PUT",
          headers: GH(TOKEN),
          body: JSON.stringify({
            message: "feat: update store photos [skip ci]",
            content,
            ...(sha && { sha }),
          }),
        }
      );
      if (!put.ok) {
        const err = await put.json();
        return res.status(500).json({ error: err.message });
      }
      return res.status(200).json({ success: true, count: clean.length });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
