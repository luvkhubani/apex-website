/**
 * Live products endpoint — reads products.json and product-images.json from
 * GitHub, merges image paths into each product, then returns the full list.
 * Images uploaded via the admin persist permanently: once stored in
 * product-images.json they are automatically applied here without needing to
 * re-edit the product.
 */
const OWNER = "luvkhubani";
const REPO  = "apex-website";

async function fetchGithubJSON(token, path) {
  const r = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`,
    {
      headers: {
        Authorization: `token ${token}`,
        "User-Agent": "apex-admin",
        Accept: "application/vnd.github.v3+json",
      },
    }
  );
  if (!r.ok) return null;
  const data = await r.json();
  return JSON.parse(Buffer.from(data.content, "base64").toString("utf8"));
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=86400");

  const TOKEN = process.env.GITHUB_TOKEN;
  if (!TOKEN) return res.status(200).json([]);

  try {
    // Fetch both files in parallel
    const [products, imageMap] = await Promise.all([
      fetchGithubJSON(TOKEN, "public/products.json"),
      fetchGithubJSON(TOKEN, "public/product-images.json"),
    ]);

    if (!Array.isArray(products)) return res.status(200).json([]);

    // Merge: imageMap entries fill in any missing image fields on products
    const map = imageMap && typeof imageMap === "object" ? imageMap : {};
    const merged = products.map(p => {
      const mapped = map[String(p.id)];
      // Only apply the mapping if it's a stable CDN URL (not a stale blob: URL)
      if (!p.image && mapped && !mapped.startsWith("blob:")) {
        return { ...p, image: mapped };
      }
      return p;
    });

    return res.status(200).json(merged);
  } catch (_) {
    return res.status(200).json([]);
  }
}
