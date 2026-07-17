import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT   = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE   = 'https://apex-website.vercel.app';

const products  = JSON.parse(readFileSync(join(ROOT, 'public/products.json'),       'utf8'));
const imageMap  = JSON.parse(readFileSync(join(ROOT, 'public/product-images.json'), 'utf8'));

function xmlEscape(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function googleCategory(category) {
  switch (category) {
    case 'Mobiles':   return 'Electronics > Communications > Telephony > Mobile Phones';
    case 'Tablets':   return 'Electronics > Computers > Tablet Computers';
    case 'Laptops':   return 'Electronics > Computers > Laptops';
    case 'Earphones': return 'Electronics > Audio > Headphones';
    default:          return 'Electronics';
  }
}

function itemGroupId(brand, name) {
  return `apex-${brand}-${name}`.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

const items = [];

for (const p of products) {
  if (!p.inStock || p.price <= 0) continue;

  let imageUrl = null;
  if (p.image?.startsWith('https://')) {
    imageUrl = p.image;
  } else if (imageMap[String(p.id)]?.startsWith('https://')) {
    imageUrl = imageMap[String(p.id)];
  }
  if (!imageUrl) continue;

  const titleParts = [p.name, p.storage, p.color].filter(Boolean);
  const title = `${titleParts.join(' ')} - ${p.brand}`;
  const desc = [
    `Buy ${p.name}`,
    p.storage ? `with ${p.storage} storage` : null,
    p.ram     ? `and ${p.ram} RAM`           : null,
    p.color   ? `in ${p.color}`              : null,
    `at Apex The Mobile Shoppe Indore. Best price with same-day COD delivery across Indore.`,
  ].filter(Boolean).join(' ');

  const link = `${SITE}/products#${encodeURIComponent(`${p.brand}__${p.name}`)}`;

  items.push(`    <item>
      <g:id>${xmlEscape(`apex-${p.id}`)}</g:id>
      <title>${xmlEscape(title)}</title>
      <description>${xmlEscape(desc)}</description>
      <link>${xmlEscape(link)}</link>
      <g:image_link>${xmlEscape(imageUrl)}</g:image_link>
      <g:availability>in stock</g:availability>
      <g:price>${p.price}.00 INR</g:price>
      <g:brand>${xmlEscape(p.brand)}</g:brand>
      <g:condition>new</g:condition>
      <g:google_product_category>${xmlEscape(googleCategory(p.category))}</g:google_product_category>
      <g:product_type>${xmlEscape(p.category)}</g:product_type>
      <g:identifier_exists>no</g:identifier_exists>
      <g:item_group_id>${xmlEscape(itemGroupId(p.brand, p.name))}</g:item_group_id>${p.color ? `\n      <g:color>${xmlEscape(p.color)}</g:color>` : ''}
    </item>`);
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Apex The Mobile Shoppe - Indore</title>
    <link>${SITE}</link>
    <description>Best prices on mobiles, laptops and accessories in Indore. 2-hour COD delivery all over Indore.</description>
${items.join('\n')}
  </channel>
</rss>`;

writeFileSync(join(ROOT, 'public/merchant-feed.xml'), xml, 'utf8');
console.log(`Generated merchant-feed.xml with ${items.length} products.`);
