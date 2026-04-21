import { supabase, toRow } from '../lib/supabase.js';

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: "Supabase credentials not configured" });
  }

  const { products, action, product } = req.body;

  // ── action: 'insert' — save a single new product, return Supabase-assigned id ──
  if (action === 'insert') {
    if (!product) return res.status(400).json({ error: 'product is required' });
    try {
      const row = toRow(product);
      delete row.id; // let Supabase auto-assign
      const { data, error } = await supabase
        .from('products')
        .insert(row)
        .select('id')
        .single();
      if (error) throw error;
      return res.status(200).json({ success: true, id: data.id });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── action: 'bulk_insert' — insert multiple new products in one Supabase call ──
  if (action === 'bulk_insert') {
    const { products: newProducts } = req.body;
    if (!Array.isArray(newProducts) || newProducts.length === 0)
      return res.status(400).json({ error: 'products array is required' });
    try {
      const rows = newProducts.map(p => { const r = toRow(p); delete r.id; return r; });
      const { data, error } = await supabase
        .from('products')
        .insert(rows)
        .select('id');
      if (error) throw error;
      return res.status(200).json({ success: true, ids: data.map(r => r.id) });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (!Array.isArray(products))
    return res.status(400).json({ error: "products array is required" });

  try {
    const rows = products.map(toRow);
    const incomingIds = rows.map(r => r.id).filter(Boolean);

    // Fetch existing images to avoid overwriting populated Cloudinary URLs with empty
    const { data: existing } = await supabase
      .from('products')
      .select('id, image')
      .in('id', incomingIds.length ? incomingIds : [-1]);
    const existingImg = Object.fromEntries((existing || []).map(r => [r.id, r.image]));
    const safeRows = rows.map(r => ({ ...r, image: r.image || existingImg[r.id] || '' }));

    // Upsert all incoming products
    const { error: upsertErr } = await supabase
      .from('products')
      .upsert(safeRows, { onConflict: 'id' });
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
