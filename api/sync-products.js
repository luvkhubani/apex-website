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
      // id column has no DEFAULT sequence — fetch current max and assign manually
      const { data: maxRow } = await supabase
        .from('products')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)
        .single();
      const nextId = ((maxRow?.id) || 0) + 1;
      const row = { ...toRow(product), id: nextId };
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
      // id column has no DEFAULT sequence — fetch current max and assign manually
      const { data: maxRow } = await supabase
        .from('products')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)
        .single();
      let nextId = ((maxRow?.id) || 0) + 1;

      const rows = newProducts.map(p => ({
        id:             nextId++,
        name:           p.name           ?? '',
        brand:          p.brand          ?? '',
        category:       p.category       ?? '',
        ram:            p.ram            ?? '',
        storage:        p.storage        ?? '',
        color:          p.color          ?? '',
        price:          Number(p.price)  || 0,
        original_price: Number(p.originalPrice) || Number(p.price) || 0,
        badge:          p.badge          ?? '',
        in_stock:       p.inStock === false ? false : true,
        image:          '',
        description:    p.description    ?? '',
      }));
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

  // ── action: 'delete' — delete a single variant by id ──
  if (action === 'delete') {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'id is required' });
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── action: 'delete_model' — delete all variants of a brand+name ──
  if (action === 'delete_model') {
    const { brand, name } = req.body;
    if (!brand || !name) return res.status(400).json({ error: 'brand and name are required' });
    try {
      const { error } = await supabase.from('products').delete().eq('brand', brand).eq('name', name);
      if (error) throw error;
      return res.status(200).json({ success: true });
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

    // Upsert all incoming products — never bulk-delete here to avoid race conditions
    const { error: upsertErr } = await supabase
      .from('products')
      .upsert(safeRows, { onConflict: 'id' });
    if (upsertErr) throw upsertErr;

    return res.status(200).json({ success: true, count: rows.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
