/**
 * One-time migration: imports all existing photos into Cloudinary and
 * updates every reference (store-photos.json, store-config.json, Supabase).
 *
 * POST /api/migrate-to-cloudinary
 * Body: { secret: "<ADMIN_SECRET>" }   — uses GITHUB_TOKEN value as secret
 *
 * Safe to call multiple times — Cloudinary overwrites with same public_id.
 */

import { uploadFromUrl } from '../lib/cloudinary.js';
import { supabase, toFrontend, toRow } from '../lib/supabase.js';

const OWNER = 'luvkhubani';
const REPO  = 'apex-website';
const BASE  = 'https://www.apexmobile.in';

const GH = () => ({
  Authorization: `token ${process.env.GITHUB_TOKEN}`,
  'User-Agent':  'apex-admin',
  Accept:        'application/vnd.github.v3+json',
  'Content-Type': 'application/json',
});

// ── GitHub helpers ─────────────────────────────────────────────────────
async function ghGet(file) {
  const r = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${file}`,
    { headers: GH() }
  );
  if (!r.ok) return null;
  const d = await r.json();
  return { sha: d.sha, data: JSON.parse(Buffer.from(d.content, 'base64').toString()) };
}

async function ghPut(file, sha, data, message) {
  const r = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${file}`,
    {
      method: 'PUT',
      headers: GH(),
      body: JSON.stringify({
        message,
        content: Buffer.from(JSON.stringify(data, null, 2)).toString('base64'),
        ...(sha && { sha }),
      }),
    }
  );
  return r.ok;
}

// ── Path → Cloudinary ──────────────────────────────────────────────────
function toPublicId(url) {
  // Extract a clean path like "store/logo" or "products/apple/iphone-15/black"
  try {
    const u = new URL(url.startsWith('/') ? BASE + url : url);
    return u.pathname.replace(/^\//, '').replace(/\.[^.]+$/, '');
  } catch {
    return url.replace(/^\//, '').replace(/\.[^.]+$/, '');
  }
}

async function importUrl(sourceUrl) {
  const full = sourceUrl.startsWith('/') ? BASE + sourceUrl : sourceUrl;
  const publicId = toPublicId(sourceUrl);
  const { v2: cloudinary } = await import('cloudinary');
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  const result = await cloudinary.uploader.upload(full, {
    public_id:     publicId,
    overwrite:     true,
    invalidate:    true,
    resource_type: 'image',
  });
  return result.secure_url;
}

// ── Main handler ───────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Guard: require the GitHub token as a shared secret
  const { secret } = req.body || {};
  if (!secret || secret !== process.env.GITHUB_TOKEN) {
    return res.status(401).json({ error: 'Invalid secret' });
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    return res.status(500).json({ error: 'Cloudinary credentials not configured' });
  }

  const report = { storePhotos: [], logo: null, products: [], errors: [] };

  // ── 1. Store photos ─────────────────────────────────────────────────
  try {
    const gh = await ghGet('public/store-photos.json');
    if (gh) {
      const photos = Array.isArray(gh.data) ? gh.data : [];
      const newPhotos = [];
      for (const p of photos) {
        if (p.startsWith('https://res.cloudinary.com')) {
          newPhotos.push(p); // already on Cloudinary
          report.storePhotos.push({ original: p, result: 'already_cloudinary' });
          continue;
        }
        try {
          const url = await importUrl(p);
          newPhotos.push(url);
          report.storePhotos.push({ original: p, result: url });
        } catch (e) {
          newPhotos.push(p); // keep old URL on failure
          report.errors.push(`store-photo ${p}: ${e.message}`);
        }
      }
      await ghPut(
        'public/store-photos.json',
        gh.sha,
        newPhotos,
        'chore: migrate store photos to Cloudinary [skip ci]'
      );
    }
  } catch (e) {
    report.errors.push(`store-photos: ${e.message}`);
  }

  // ── 2. Logo ─────────────────────────────────────────────────────────
  try {
    const gh = await ghGet('public/store-config.json');
    if (gh) {
      const cfg = gh.data;
      const logo = cfg.logoImage || '';
      if (logo && !logo.startsWith('https://res.cloudinary.com')) {
        try {
          const url = await importUrl(logo);
          cfg.logoImage = url;
          cfg._savedAt  = new Date().toISOString();
          await ghPut(
            'public/store-config.json',
            gh.sha,
            cfg,
            'chore: migrate logo to Cloudinary [skip ci]'
          );
          report.logo = { original: logo, result: url };
        } catch (e) {
          report.errors.push(`logo: ${e.message}`);
        }
      } else {
        report.logo = { original: logo, result: 'already_cloudinary_or_empty' };
      }
    }
  } catch (e) {
    report.errors.push(`store-config/logo: ${e.message}`);
  }

  // ── 3. Banner image ─────────────────────────────────────────────────
  try {
    const gh = await ghGet('public/hero-config.json');
    if (gh) {
      const cfg = gh.data;
      const img = cfg.bannerConfig?.image || '';
      if (img && !img.startsWith('https://res.cloudinary.com')) {
        try {
          const url = await importUrl(img);
          cfg.bannerConfig.image = url;
          cfg._savedAt = new Date().toISOString();
          await ghPut(
            'public/hero-config.json',
            gh.sha,
            cfg,
            'chore: migrate banner image to Cloudinary [skip ci]'
          );
          report.banner = { original: img, result: url };
        } catch (e) {
          report.errors.push(`banner: ${e.message}`);
        }
      } else {
        report.banner = { original: img, result: 'already_cloudinary_or_empty' };
      }
    }
  } catch (e) {
    report.errors.push(`hero-config/banner: ${e.message}`);
  }

  // ── 4. Product images (Vercel Blob → Cloudinary) ────────────────────
  try {
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { data: rows, error } = await supabase.from('products').select('*');
      if (error) throw error;

      for (const row of rows) {
        const img = row.image || '';
        if (!img || img.startsWith('https://res.cloudinary.com')) {
          if (img) report.products.push({ id: row.id, result: 'already_cloudinary' });
          continue;
        }
        try {
          const url = await importUrl(img);
          await supabase.from('products').update({ image: url }).eq('id', row.id);
          report.products.push({ id: row.id, original: img, result: url });
        } catch (e) {
          report.errors.push(`product id=${row.id}: ${e.message}`);
        }
      }
    }
  } catch (e) {
    report.errors.push(`products: ${e.message}`);
  }

  return res.status(200).json({
    success: true,
    summary: {
      storePhotosMigrated: report.storePhotos.filter(p => p.result !== 'already_cloudinary').length,
      logo: report.logo,
      banner: report.banner,
      productsMigrated: report.products.filter(p => p.result !== 'already_cloudinary').length,
      errors: report.errors.length,
    },
    detail: report,
  });
}
