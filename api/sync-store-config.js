const OWNER     = "luvkhubani";
const REPO      = "apex-website";
const FILE_PATH = "public/store-config.json";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { storeConfig } = req.body;
  if (!storeConfig) return res.status(400).json({ error: "storeConfig is required" });

  const TOKEN = process.env.GITHUB_TOKEN;
  if (!TOKEN) return res.status(500).json({ error: "GITHUB_TOKEN not configured" });

  const GH = {
    Authorization: `token ${TOKEN}`,
    "User-Agent":  "apex-admin",
    Accept:        "application/vnd.github.v3+json",
    "Content-Type":"application/json",
  };

  try {
    let existingSha;
    let existingPhotos = [];
    const checkRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
      { headers: GH }
    );
    if (checkRes.ok) {
      const checkData = await checkRes.json();
      existingSha = checkData.sha;
      // Always preserve existing store photos — they are managed via /api/store-photos
      // and must never be overwritten by a store-settings sync with empty localStorage
      try {
        const existingCfg = JSON.parse(Buffer.from(checkData.content, "base64").toString("utf8"));
        existingPhotos = Array.isArray(existingCfg.storePhotos) ? existingCfg.storePhotos : [];
      } catch {}
    }

    // Use incoming photos only if non-empty; otherwise keep what's already in the repo
    const photosToSave = (Array.isArray(storeConfig.storePhotos) && storeConfig.storePhotos.length > 0)
      ? storeConfig.storePhotos
      : existingPhotos;

    const payload = { ...storeConfig, storePhotos: photosToSave, _savedAt: new Date().toISOString() };
    const content = Buffer.from(JSON.stringify(payload, null, 2)).toString("base64");

    const commitRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
      {
        method: "PUT",
        headers: GH,
        body: JSON.stringify({
          message: "feat: sync store config from admin [skip ci]",
          content,
          ...(existingSha && { sha: existingSha }),
        }),
      }
    );

    if (!commitRes.ok) {
      const err = await commitRes.json();
      return res.status(500).json({ error: err.message || "GitHub commit failed", github_status: commitRes.status, github_error: err });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
