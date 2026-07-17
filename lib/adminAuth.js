import crypto from 'crypto';

function secret() {
  return process.env.ADMIN_SECRET || 'apex-dev-secret-change-in-production';
}

export function generateToken(day) {
  const d = day || new Date().toISOString().slice(0, 10);
  return crypto.createHmac('sha256', secret()).update(`apex:admin:${d}`).digest('hex');
}

// Accept today's and yesterday's token so midnight doesn't instantly log out an active session
export function isValidToken(token) {
  if (!token || typeof token !== 'string') return false;
  const today     = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  return token === generateToken(today) || token === generateToken(yesterday);
}

// Call at the top of any write-only API handler. Returns false and sends 401 if invalid.
export function requireAdmin(req, res) {
  const token = req.headers['x-admin-token'];
  if (!isValidToken(token)) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}

export function hashPassword(password) {
  return crypto.createHmac('sha256', secret()).update(password).digest('hex');
}
