import { supabase, toRow } from './lib/supabase.js';

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { products } = req.body;
  if (!Array.isArray(products))
    return res.status(400).json({ error: "products array is required" });

  try {
    const rows = products.map(toRow);
    const incomingIds = rows.map(r => r.id).filter(Boolean);

    // Upsert all incoming products
    const { error: upsertErr } = await supabase
      .from('products')
      .upsert(rows, { onConflict: 'id' });
    if (upsertErr) throw upsertErr;

    // Delete any products that were removed (present in DB but not in incoming list)
    if (incomingIds.length > 0) {
      const { error: deleteErr } = await supabase
        .from('products')
        .delete()
        .not('id', 'in', `(${incomingIds.join(',')})`);
      if (deleteErr) throw deleteErr;
    }

    return res.status(200).json({ success: true, count: rows.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
