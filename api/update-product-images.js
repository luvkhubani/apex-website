import { supabase } from '../lib/supabase.js';

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: "Supabase credentials not configured" });
  }

  const { updates } = req.body; // [{ id, imagePath }]
  if (!Array.isArray(updates) || updates.length === 0)
    return res.status(400).json({ error: "updates array is required" });

  try {
    // Update each product's image column directly in Supabase
    await Promise.all(
      updates
        .filter(u => u.id != null && u.imagePath && !u.imagePath.startsWith('blob:'))
        .map(u =>
          supabase.from('products').update({ image: u.imagePath }).eq('id', u.id)
        )
    );
    return res.status(200).json({ success: true, updated: updates.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
