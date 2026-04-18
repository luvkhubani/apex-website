/**
 * One-time migration: seeds Supabase from public/products.json + public/product-images.json
 *
 * Usage:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key \
 *   node scripts/migrate-to-supabase.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync }  from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

const __dir  = dirname(fileURLToPath(import.meta.url));
const root   = join(__dir, '..');

const SUPABASE_URL              = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Load source files
const products  = JSON.parse(readFileSync(join(root, 'public/products.json'), 'utf8'));
const imageMap  = JSON.parse(readFileSync(join(root, 'public/product-images.json'), 'utf8'));

let skipped = 0;

const rows = products.map(p => {
  // Merge image from product-images.json if product.image is empty
  let image = p.image || '';
  if (!image) {
    const mapped = imageMap[String(p.id)];
    if (mapped && mapped.startsWith('https://')) {
      image = mapped;
    } else if (mapped) {
      console.warn(`  Skipping non-HTTPS image map for ID ${p.id}: ${mapped}`);
      skipped++;
    }
  }

  return {
    id:             p.id,
    name:           p.name           ?? '',
    brand:          p.brand          ?? '',
    category:       p.category       ?? '',
    ram:            p.ram            ?? '',
    storage:        p.storage        ?? '',
    color:          p.color          ?? '',
    price:          Number(p.price)  || 0,
    original_price: Number(p.originalPrice) || Number(p.price) || 0,
    badge:          p.badge          ?? '',
    in_stock:       p.inStock        ?? true,
    image,
    description:    p.description    ?? '',
  };
});

// Warn about orphan image-map entries (no matching product)
const productIds = new Set(products.map(p => String(p.id)));
for (const [id] of Object.entries(imageMap)) {
  if (!productIds.has(id)) {
    console.warn(`  Orphan image-map entry — ID ${id} has no matching product (skipped)`);
  }
}

console.log(`\nMigrating ${rows.length} products to Supabase...`);

const { error } = await supabase
  .from('products')
  .upsert(rows, { onConflict: 'id' });

if (error) {
  console.error('Migration failed:', error.message);
  process.exit(1);
}

console.log(`Done! ${rows.length} products upserted. ${skipped} image paths skipped (non-HTTPS).`);
console.log('Verify in Supabase Table Editor: https://supabase.com/dashboard');
