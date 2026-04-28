import { useState, useEffect } from 'react';

const STORE_KEY = 'apex_store_config';

export const STORE_DEFAULTS = {
  // ── Logo & Branding ───────────────────────────────────
  logoImage: '',
  logoText: 'APEX',
  faviconUrl: '',

  // ── Contact details ───────────────────────────────────
  whatsappNumber: '918349570000',   // used in wa.me URLs — no + prefix
  phoneDisplay: '+91 83495 70000',  // legacy single number — kept for compat
  phoneNumbers: [                   // list of all store numbers
    { label: '', number: '+91 83495 70000' },
  ],
  addressLine1: 'Jail Road, Indore',
  addressLine2: 'Madhya Pradesh — 452 001',
  storeHours: 'Monday – Sunday, 10:00 AM – 8:00 PM',
  storeHoursShort: '10AM – 8PM',    // used in compact spots

  // ── Social ────────────────────────────────────────────
  instagramHandle: 'apexmobileindia',
  instagramUrl: 'https://instagram.com/apexmobileindia',
  instagramPosts: [],      // uploaded post image URLs (up to 6)
  instagramPostCount: 0,   // 0 = hide section, 1-6 = show N posts

  // ── Home page — Trust Stats ───────────────────────────
  // Leave num blank to auto-compute brands count from live products
  trustStats: [
    { num: '30+',  label: 'Years of trust' },
    { num: '1L+',  label: 'Happy customers' },
    { num: '',     label: 'Brands available' },
    { num: '4.9★', label: 'Customer rating' },
  ],

  // ── Home page — Testimonials ──────────────────────────
  testimonials: [
    { quote: "I've been buying from Apex since 2010. The staff knows their products inside out and never pushes unnecessary upsells. Best electronics store in Indore, period.", name: 'Priya Sharma',   location: 'Indore' },
    { quote: "Bought a MacBook Pro here last month. The price was actually better than online, and they helped me set it up too. Will always come back to Apex.",              name: 'Rahul Malhotra', location: 'Indore' },
    { quote: "Apex has been my family's go-to electronics store for two decades. Honest advice, genuine products, and after-sales support you simply can't find elsewhere.",  name: 'Anjali Verma',   location: 'Indore' },
  ],

  // ── Home page — Store photos ──────────────────────────
  storePhoto:  '',  // legacy single photo — kept for compat
  storePhotos: [],  // list of store photos for the "Visit Us" section

  // ── Shop by Category cards ───────────────────────────
  categories: [
    { label: 'iPhones & iPads',    emoji: '🍎', filter: 'Mobiles',     sub: 'Latest Apple lineup',    images: [], link: '' },
    { label: 'Samsung & Android',  emoji: '📱', filter: 'Mobiles',     sub: 'Galaxy S series & more', images: [], link: '' },
    { label: 'MacBooks & Laptops', emoji: '💻', filter: 'Laptops',     sub: 'Power your work',        images: [], link: '' },
    { label: 'Accessories',        emoji: '🎧', filter: 'Accessories', sub: 'Complete your setup',    images: [], link: '' },
  ],

  // ── Product visibility ────────────────────────────────
  // IDs in this list are hidden from the public site
  hiddenProductIds: [],

  // ── Product display order ─────────────────────────────
  // Brands shown in this order as sections; unlisted brands appear after
  brandOrder: ['Apple','Samsung','OnePlus','Nothing','Motorola','Xiaomi','Realme','Vivo','OPPO','Poco','Infinix','Tecno','AI Plus','Jio','Nokia'],
  // product keys (brand__name) pinned to a "Featured" row above all brand sections
  pinnedProductKeys: [],

  // ── Home page — Hero text ─────────────────────────────
  heroEyebrow: 'Trusted Since 1996 · Jail Road, Indore',
  heroHeadline: 'The Best Phones.\nIndore\'s Best Price.',

  // ── WhatsApp message template (product modal) ─────────
  // Placeholders: {name} {specs} {color} — missing ones are trimmed automatically
  productWaMessage: 'Hi Apex! I am interested in {name} {specs} {color} at "{price}". Kindly get it delivered to {name, contact, address}',

  // ── Google Maps ───────────────────────────────────────
  googleMapsEmbed: '',
  googleMapsLink: 'https://maps.google.com/?q=Apex+The+Mobile+Shoppe+Jail+Road+Indore',

  // ── About page — Hero ─────────────────────────────────
  aboutHeadline: 'Three decades.\nOne promise.',
  aboutSub: 'Honest advice, genuine products, and the best prices in Indore — since 1996.',

  // ── About page — Story ────────────────────────────────
  aboutStory: [
    'Apex — The Mobile Shoppe was founded in 1996 on Jail Road, Indore, with a simple mission: give every customer honest advice and the best product for their needs — not just the most expensive one.',
    "What started as a small mobile accessories shop has grown into Indore's most trusted destination for premium electronics — from the latest iPhones and MacBooks to Galaxy tablets and everything in between.",
    'Over 30 years, more than a lakh customers have trusted us for their most important tech purchases. Many are now on their second and third generation of shopping with us.',
  ],

  // ── About page — Stats box ────────────────────────────
  aboutStat: '30+',
  aboutStatLabel: 'Years Serving Indore',
  aboutStatItems: [
    '📍 Jail Road, Indore — Since 1996',
    '👥 1 Lakh+ satisfied customers',
    '📱 All major brands under one roof',
    '✅ 100% genuine products guaranteed',
  ],

  // ── About page — Values ───────────────────────────────
  aboutValues: [
    { icon: '🤝', title: 'Honest Advice',   desc: 'We recommend what you actually need, not the highest-margin product.' },
    { icon: '✅', title: 'Genuine Products', desc: 'Every item we sell is 100% original from authorised channels.' },
    { icon: '💬', title: 'Expert Team',      desc: 'Years of hands-on experience with every product we carry.' },
    { icon: '💰', title: 'Fair Pricing',     desc: 'Competitive prices. No hidden charges. What you see is what you pay.' },
  ],

  // ── About page — Services ─────────────────────────────
  aboutServices: [],
};

export function loadStoreConfig() {
  try {
    const s = localStorage.getItem(STORE_KEY);
    if (s) {
      const parsed = JSON.parse(s);
      return {
        ...STORE_DEFAULTS,
        ...parsed,
        phoneNumbers:      parsed.phoneNumbers      ?? STORE_DEFAULTS.phoneNumbers,
        storePhotos:       parsed.storePhotos       ?? STORE_DEFAULTS.storePhotos,
        categories:        parsed.categories        ?? STORE_DEFAULTS.categories,
        trustStats:        parsed.trustStats        ?? STORE_DEFAULTS.trustStats,
        testimonials:      parsed.testimonials      ?? STORE_DEFAULTS.testimonials,
        aboutStory:        parsed.aboutStory        ?? STORE_DEFAULTS.aboutStory,
        aboutStatItems:    parsed.aboutStatItems    ?? STORE_DEFAULTS.aboutStatItems,
        aboutValues:       parsed.aboutValues       ?? STORE_DEFAULTS.aboutValues,
        aboutServices:     parsed.aboutServices     ?? STORE_DEFAULTS.aboutServices,
        hiddenProductIds:  parsed.hiddenProductIds  ?? STORE_DEFAULTS.hiddenProductIds,
        brandOrder:        parsed.brandOrder        ?? STORE_DEFAULTS.brandOrder,
        pinnedProductKeys: parsed.pinnedProductKeys ?? STORE_DEFAULTS.pinnedProductKeys,
      };
    }
  } catch (_) {}
  return { ...STORE_DEFAULTS };
}

export function saveStoreConfig(config) {
  localStorage.setItem(STORE_KEY, JSON.stringify(config));
}

export function useStoreConfig() {
  const [cfg, setCfg] = useState(loadStoreConfig);

  useEffect(() => {
    // Fetch from repo (public/store-config.json) so all browsers stay in sync
    fetch('/api/store-config')
      .then(r => r.ok ? r.json() : null)
      .then(remote => {
        if (!remote || typeof remote !== 'object') return;
        const merged = {
          ...STORE_DEFAULTS,
          ...remote,
          phoneNumbers:      remote.phoneNumbers      ?? STORE_DEFAULTS.phoneNumbers,
          storePhotos:       remote.storePhotos       ?? STORE_DEFAULTS.storePhotos,
          categories:        remote.categories        ?? STORE_DEFAULTS.categories,
          trustStats:        remote.trustStats        ?? STORE_DEFAULTS.trustStats,
          testimonials:      remote.testimonials      ?? STORE_DEFAULTS.testimonials,
          aboutStory:        remote.aboutStory        ?? STORE_DEFAULTS.aboutStory,
          aboutStatItems:    remote.aboutStatItems    ?? STORE_DEFAULTS.aboutStatItems,
          aboutValues:       remote.aboutValues       ?? STORE_DEFAULTS.aboutValues,
          aboutServices:     remote.aboutServices     ?? STORE_DEFAULTS.aboutServices,
          hiddenProductIds:  remote.hiddenProductIds  ?? STORE_DEFAULTS.hiddenProductIds,
          brandOrder:        remote.brandOrder        ?? STORE_DEFAULTS.brandOrder,
          pinnedProductKeys: remote.pinnedProductKeys ?? STORE_DEFAULTS.pinnedProductKeys,
        };
        saveStoreConfig(merged);
        setCfg(merged);
      })
      .catch(() => {});
  }, []);

  // React to saves made in admin panel (same browser, different tab)
  useEffect(() => {
    const onStorage = e => {
      if (e.key === STORE_KEY && e.newValue) {
        try { setCfg(JSON.parse(e.newValue)); } catch (_) {}
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return cfg;
}

// Helper: build a wa.me URL from a whatsappNumber + optional message text
export function waUrl(number, text = '') {
  const base = `https://wa.me/${number || STORE_DEFAULTS.whatsappNumber}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/**
 * Get the store photos array — backward-compat with legacy storePhoto string.
 */
export function getStorePhotos(cfg) {
  if (Array.isArray(cfg.storePhotos) && cfg.storePhotos.length) return cfg.storePhotos;
  if (cfg.storePhoto) return [cfg.storePhoto];
  return [];
}

/**
 * Get the images array for a category card.
 * Handles backward-compat: old cards stored a single `image` string;
 * new cards store an `images` array.
 */
export function getCatImages(cat) {
  if (Array.isArray(cat.images) && cat.images.length) return cat.images;
  if (cat.image) return [cat.image]; // legacy
  return [];
}

/**
 * Resolve a store image to a displayable src string.
 *
 * Paths returned by /api/upload-store-image start with "/" and are served
 * directly from the public/ folder — no Vite processing, no hashed filename.
 * This means they work as soon as Vercel redeploys (~60 s after the commit).
 *
 * blob: and data: URLs (in-tab preview before the commit lands) are passed through.
 * Full https:// URLs are passed through.
 * Empty → null.
 */
export function getStoreImage(path) {
  if (!path) return null;
  // blob preview, data URL, or full https URL → use as-is
  if (path.startsWith('blob:') || path.startsWith('data:') || path.startsWith('http')) return path;
  // Already an absolute path (/store/logo.png) → use as-is
  if (path.startsWith('/')) return path;
  // Legacy relative path (shouldn't happen with new uploads) → prefix
  return `/store/${path}`;
}
