const OWNER = "luvkhubani";
const REPO  = "apex-website";
const FILE  = "public/store-config.json";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  res.setHeader("Cache-Control", "no-store");

  try {
    const r = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE}`,
      { headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
          "User-Agent": "apex-admin",
          Accept: "application/vnd.github.v3+json",
        }
      }
    );
    if (!r.ok) return res.status(200).json({});
    const { content } = await r.json();
    const json = JSON.parse(Buffer.from(content, "base64").toString("utf8"));
    return res.status(200).json(json);
  } catch (_) {
    return res.status(200).json({});
  }
}
