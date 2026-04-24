import { createClient } from '@supabase/supabase-js';

// Service-role client — bypasses RLS, used only in serverless functions (never client-side)
export const supabase = createClient(
  process.env.SUPABASE_URL    || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Map Supabase snake_case row → frontend camelCase product
export function toFrontend(row) {
  return {
    id:            row.id,
    name:          row.name,
    brand:         row.brand,
    category:      row.category,
    ram:           row.ram           ?? '',
    storage:       row.storage       ?? '',
    color:         row.color         ?? '',
    price:         row.price         ?? 0,
    mrp:           row.original_price ?? 0,
    originalPrice: row.original_price ?? 0, // kept for backward compat
    badge:         row.badge         ?? '',
    inStock:       row.in_stock      ?? true,
    image:         row.image         ?? '',
    description:   row.description   ?? '',
  };
}

// Map frontend camelCase product → Supabase snake_case row
export function toRow(p) {
  return {
    id:             p.id,
    name:           p.name           ?? '',
    brand:          p.brand          ?? '',
    category:       p.category       ?? '',
    ram:            p.ram            ?? '',
    storage:        p.storage        ?? '',
    color:          p.color          ?? '',
    price:          Number(p.price)  || 0,
    original_price: Number(p.mrp) || Number(p.originalPrice) || 0,
    badge:          p.badge          ?? '',
    in_stock:       p.inStock        ?? true,
    image:          p.image?.startsWith('blob:') ? '' : (p.image ?? ''),
    description:    p.description    ?? '',
  };
}
