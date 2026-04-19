const OWNER     = "luvkhubani";
const REPO      = "apex-website";
const FILE_PATH = "public/admin-password.json";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return res.status(400).json({ error: "currentPassword and newPassword are required" });

  const TOKEN = process.env.GITHUB_TOKEN;
  if (!TOKEN) return res.status(500).json({ error: "GITHUB_TOKEN not configured" });

  const GH = {
    Authorization: `token ${TOKEN}`,
    "User-Agent":  "apex-admin",
    Accept:        "application/vnd.github.v3+json",
    "Content-Type":"application/json",
  };

  // Read current password from repo
  let existingSha;
  let storedPassword = "Apex@2024#Secret"; // hardcoded default
  try {
    const checkRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
      { headers: GH }
    );
    if (checkRes.ok) {
      const data = await checkRes.json();
      existingSha = data.sha;
      const decoded = JSON.parse(Buffer.from(data.content, "base64").toString("utf8"));
      if (decoded.password) storedPassword = decoded.password;
    }
  } catch (_) {}

  // Verify current password
  if (currentPassword !== storedPassword) {
    return res.status(401).json({ error: "Current password is incorrect." });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: "New password must be at least 8 characters." });
  }

  // Save new password to repo
  const content = Buffer.from(JSON.stringify({ password: newPassword }, null, 2)).toString("base64");
  try {
    const commitRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
      {
        method: "PUT",
        headers: GH,
        body: JSON.stringify({
          message: "chore: update admin password [skip ci]",
          content,
          ...(existingSha && { sha: existingSha }),
        }),
      }
    );
    if (!commitRes.ok) {
      const err = await commitRes.json();
      return res.status(500).json({ error: err.message || "GitHub commit failed" });
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
