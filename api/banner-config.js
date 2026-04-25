import { supabase } from '../lib/supabase.js';

const KEY = 'banner_config';
const EMPTY = {
  image: '', label: 'Highlight of the Day', title: '',
  subtitle: '', price: '', ctaText: 'Order on WhatsApp', ctaLink: '',
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY)
    return res.status(500).json({ error: "Supabase credentials not configured" });

  if (req.method === "GET") {
    res.setHeader("Cache-Control", "no-store");
    try {
      const { data, error } = await supabase
        .from('app_config')
        .select('value')
        .eq('key', KEY)
        .single();
      if (error || !data) return res.status(200).json(EMPTY);
      return res.status(200).json({ ...EMPTY, ...data.value });
    } catch (_) {
      return res.status(200).json(EMPTY);
    }
  }

  if (req.method === "POST") {
    const { bannerConfig } = req.body;
    if (!bannerConfig) return res.status(400).json({ error: "bannerConfig is required" });
    try {
      const { error } = await supabase
        .from('app_config')
        .upsert(
          { key: KEY, value: bannerConfig, updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        );
      if (error) throw error;
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
