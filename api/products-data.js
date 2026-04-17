/**
 * Live products endpoint — reads directly from GitHub so product changes
 * are visible to all browsers within seconds of admin saving,
 * without waiting for a Vercel redeploy.
 */
const OWNER     = "luvkhubani";
const REPO      = "apex-website";
const FILE_PATH = "public/products.json";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  res.setHeader("Cache-Control", "no-store");

  const TOKEN = process.env.GITHUB_TOKEN;
  if (!TOKEN) return res.status(200).json([]);

  try {
    const r = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
      {
        headers: {
          Authorization: `token ${TOKEN}`,
          "User-Agent": "apex-admin",
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!r.ok) return res.status(200).json([]);

    const data    = await r.json();
    const content = JSON.parse(Buffer.from(data.content, "base64").toString("utf8"));
    return res.status(200).json(Array.isArray(content) ? content : []);
  } catch (_) {
    return res.status(200).json([]);
  }
}
