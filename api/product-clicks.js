import { supabase } from '../lib/supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // POST — record a click
  if (req.method === 'POST') {
    const { key } = req.body || {};
    if (!key) return res.status(400).json({ error: 'key required' });

    const { data } = await supabase
      .from('product_clicks')
      .select('clicks')
      .eq('key', key)
      .single();

    const next = (data?.clicks || 0) + 1;
    await supabase
      .from('product_clicks')
      .upsert({ key, clicks: next }, { onConflict: 'key' });

    return res.status(200).json({ success: true, clicks: next });
  }

  // GET — return all click counts as { key: count } map
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    const { data, error } = await supabase
      .from('product_clicks')
      .select('key, clicks')
      .order('clicks', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    const map = {};
    (data || []).forEach(r => { map[r.key] = r.clicks; });
    return res.status(200).json(map);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
