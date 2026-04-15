/**
 * Live hero-config endpoint — reads directly from GitHub so changes
 * are visible to all browsers within seconds of admin saving,
 * without waiting for a Vercel redeploy.
 */
const OWNER     = "luvkhubani";
const REPO      = "apex-website";
const FILE_PATH = "public/hero-config.json";

const EMPTY = {
  heroConfig: [],
  bannerConfig: {
    image: "", label: "Highlight of the Day", title: "",
    subtitle: "", price: "", ctaText: "Enquire on WhatsApp", ctaLink: "",
  },
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  // Cache at Vercel edge for 30 seconds — fast for users, near-live for admin changes
  res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=10");

  const TOKEN = process.env.GITHUB_TOKEN;
  if (!TOKEN) {
    // Fallback: return empty config, client will use localStorage
    return res.status(200).json(EMPTY);
  }

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

    if (!r.ok) return res.status(200).json(EMPTY);

    const data    = await r.json();
    const content = JSON.parse(Buffer.from(data.content, "base64").toString("utf8"));
    return res.status(200).json(content);
  } catch (_) {
    return res.status(200).json(EMPTY);
  }
}
