import { supabase } from '../lib/supabase.js';
import { requireAdmin, hashPassword } from '../lib/adminAuth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-token');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!requireAdmin(req, res)) return;

  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword)
    return res.status(400).json({ error: 'currentPassword and newPassword are required' });

  if (newPassword.length < 8)
    return res.status(400).json({ error: 'New password must be at least 8 characters' });

  // Verify current password
  let storedHash = null;
  try {
    const { data } = await supabase
      .from('app_config')
      .select('value')
      .eq('key', 'admin_password_hash')
      .single();
    storedHash = data?.value || null;
  } catch (_) {}

  const currentMatches = storedHash
    ? hashPassword(currentPassword) === storedHash
    : currentPassword === (process.env.ADMIN_PASSWORD || '');

  if (!currentMatches)
    return res.status(401).json({ error: 'Current password is incorrect' });

  // Save new password hash
  try {
    await supabase.from('app_config').upsert(
      { key: 'admin_password_hash', value: hashPassword(newPassword) },
      { onConflict: 'key' }
    );
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
