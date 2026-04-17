const OWNER = "luvkhubani";
const REPO  = "apex-website";
const FILE  = "public/store-config.json";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=86400");

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
    if (!r.ok) return res.status(502).json({ error: "GitHub fetch failed" });
    const { content } = await r.json();
    const json = JSON.parse(Buffer.from(content, "base64").toString("utf8"));
    return res.status(200).json(json);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
