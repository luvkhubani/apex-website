import { supabase } from '../lib/supabase.js';
import { generateToken, hashPassword } from '../lib/adminAuth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { password } = req.body || {};
  if (!password) return res.status(400).json({ error: 'Password required' });

  // Artificial delay to slow brute-force attempts
  await new Promise(r => setTimeout(r, 400));

  let authorized = false;

  // 1. Check Supabase app_config for a stored password hash
  try {
    const { data } = await supabase
      .from('app_config')
      .select('value')
      .eq('key', 'admin_password_hash')
      .single();

    if (data?.value) {
      authorized = hashPassword(password) === data.value;
    }
  } catch (_) {}

  // 2. Fall back to ADMIN_PASSWORD env var (plain text) for first-time setup
  if (!authorized && process.env.ADMIN_PASSWORD) {
    authorized = password === process.env.ADMIN_PASSWORD;
    if (authorized) {
      // Migrate: store hash in Supabase so env var is no longer the source of truth
      try {
        await supabase.from('app_config').upsert(
          { key: 'admin_password_hash', value: hashPassword(password) },
          { onConflict: 'key' }
        );
      } catch (_) {}
    }
  }

  if (!authorized) {
    return res.status(401).json({ error: 'Incorrect password' });
  }

  return res.status(200).json({ token: generateToken() });
}
