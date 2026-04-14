import { useState, useMemo } from 'react';
import ProductCard from '../components/ProductCard';
import FadeUp from '../components/FadeUp';
import products from '../data/products';

const BRANDS = [
  'All','Apple','Samsung','OnePlus','Nothing','Motorola',
  'Xiaomi','Realme','Vivo','OPPO','Poco','Infinix','Tecno',
  'AI Plus','Jio','Nokia',
];

const CATEGORIES = ['All', 'Mobiles', 'Laptops', 'Tablets', 'Earphones'];

const PRICE_RANGES = [
  { label: 'All Prices',          min: 0,     max: Infinity },
  { label: 'Under ₹15,000',       min: 0,     max: 15000 },
  { label: '₹15,000 – ₹30,000',   min: 15000, max: 30000 },
  { label: '₹30,000 – ₹60,000',   min: 30000, max: 60000 },
  { label: 'Above ₹60,000',       min: 60000, max: Infinity },
];

const SORT_OPTIONS = [
  { label: 'Newest First',       value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
];

// Pill button used in filter bars
function Pill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 text-[13px] font-medium px-4 py-1.5 rounded-pill transition-all duration-200 ${
        active
          ? 'bg-apple-black text-white'
          : 'bg-apple-light text-apple-black hover:bg-apple-border'
      }`}
    >
      {children}
    </button>
  );
}

export default function Products() {
  const [search,     setSearch]     = useState('');
  const [brand,      setBrand]      = useState('All');
  const [category,   setCategory]   = useState('All');
  const [priceRange, setPriceRange] = useState('All Prices');
  const [sort,       setSort]       = useState('newest');

  const filtered = useMemo(() => {
    let list = [...products];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q)  ||
        p.brand.toLowerCase().includes(q) ||
        (p.color && p.color.toLowerCase().includes(q)) ||
        (p.ram   && p.ram.toLowerCase().includes(q))   ||
        (p.storage && p.storage.toLowerCase().includes(q))
      );
    }

    // Brand
    if (brand !== 'All') list = list.filter(p => p.brand === brand);

    // Category
    if (category !== 'All') list = list.filter(p => p.category === category);

    // Price range — skip "Call for Price" items (price === 0) from range filter
    const range = PRICE_RANGES.find(r => r.label === priceRange);
    if (range && priceRange !== 'All Prices') {
      list = list.filter(p => p.price > 0 && p.price >= range.min && p.price < range.max);
    }

    // Sort
    if (sort === 'price_asc')  list.sort((a, b) => (a.price || 0) - (b.price || 0));
    if (sort === 'price_desc') list.sort((a, b) => (b.price || 0) - (a.price || 0));
    // 'newest' keeps insertion order (id ascending)

    return list;
  }, [search, brand, category, priceRange, sort]);

  const total = products.length;

  return (
    <main className="min-h-screen bg-white">

      {/* ── WhatsApp banner ───────────────────────────────────── */}
      <div className="bg-[#25D366] text-white text-center py-2.5 px-4">
        <a
          href="https://wa.me/919343777686?text=Hi%20Apex!%20Please%20share%20your%20complete%20price%20list."
          target="_blank"
          rel="noopener noreferrer"
          className="text-[13px] font-medium hover:underline"
        >
          Can&apos;t find your model? WhatsApp us for the complete price list →
        </a>
      </div>

      {/* ── Page header ───────────────────────────────────────── */}
      <section className="bg-white pt-12 pb-8 px-6 border-b border-apple-border">
        <div className="max-w-[1200px] mx-auto">
          <FadeUp>
            <p className="text-[12px] font-semibold tracking-[0.15em] text-apple-gray uppercase mb-3">
              Our Collection
            </p>
            <h1 className="font-sans font-bold text-[36px] md:text-[52px] text-apple-black leading-[1.07] tracking-[-0.02em] mb-3">
              Our Complete Price List — {total}+ Models
            </h1>
            <p className="text-[15px] text-apple-gray">
              Store hours: <strong className="text-apple-black">10 AM – 10 PM</strong>, Monday to Sunday &nbsp;·&nbsp; Jail Road, Indore
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ── Sticky filters ────────────────────────────────────── */}
      <div className="sticky top-12 z-40 bg-white/95 backdrop-blur-xl border-b border-apple-border shadow-sm">
        <div className="max-w-[1200px] mx-auto px-6 py-3 space-y-2.5">

          {/* Search + Sort row */}
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Search by name, brand, RAM, storage…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 text-[14px] px-4 py-2 rounded-pill border border-apple-border bg-apple-light text-apple-black placeholder-apple-gray focus:outline-none focus:ring-2 focus:ring-apple-black/20"
            />
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="text-[13px] px-4 py-2 rounded-pill border border-apple-border bg-apple-light text-apple-black focus:outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Brand pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {BRANDS.map(b => (
              <Pill key={b} active={brand === b} onClick={() => setBrand(b)}>{b}</Pill>
            ))}
          </div>

          {/* Category + Price pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {CATEGORIES.map(c => (
              <Pill key={c} active={category === c} onClick={() => setCategory(c)}>{c}</Pill>
            ))}
            <span className="text-apple-border mx-1">|</span>
            {PRICE_RANGES.map(r => (
              <Pill key={r.label} active={priceRange === r.label} onClick={() => setPriceRange(r.label)}>
                {r.label}
              </Pill>
            ))}
          </div>
        </div>
      </div>

      {/* ── Product count ─────────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-6 pt-6 pb-2">
        <p className="text-[13px] text-apple-gray">
          Showing <strong className="text-apple-black">{filtered.length}</strong> of{' '}
          <strong className="text-apple-black">{total}</strong> products
        </p>
      </div>

      {/* ── Grid ──────────────────────────────────────────────── */}
      <section className="py-6 px-6 pb-16">
        <div className="max-w-[1200px] mx-auto">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((product, i) => (
                <FadeUp key={product.id} delay={Math.min(i * 30, 300)}>
                  <ProductCard product={product} />
                </FadeUp>
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <p className="text-6xl mb-4">🔍</p>
              <p className="font-sans font-bold text-[24px] text-apple-black mb-2">No products found.</p>
              <p className="text-[15px] text-apple-gray mb-6">Try a different search or clear your filters.</p>
              <button
                onClick={() => { setSearch(''); setBrand('All'); setCategory('All'); setPriceRange('All Prices'); }}
                className="text-[14px] font-medium text-white bg-apple-black px-6 py-3 rounded-pill hover:scale-[1.02] transition-transform"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────── */}
      <section className="bg-apple-light border-t border-apple-border py-20 px-6 text-center">
        <FadeUp>
          <p className="text-[12px] font-semibold tracking-[0.15em] text-apple-gray uppercase mb-4">Custom Order</p>
          <h2 className="font-sans font-bold text-[28px] md:text-[36px] text-apple-black tracking-[-0.02em] mb-4">
            Can&apos;t find what you need?
          </h2>
          <p className="text-[15px] text-apple-gray mb-2 max-w-[440px] mx-auto">
            We stock thousands of products. Just ask — our team will source it for you.
          </p>
          <p className="text-[13px] text-apple-gray mb-8">
            Store open <strong className="text-apple-black">10 AM – 10 PM</strong> daily
          </p>
          <a
            href="https://wa.me/919343777686?text=Hi%20Apex!%20I%20am%20looking%20for%20a%20specific%20product.%20Please%20help."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[14px] font-medium text-white bg-[#25D366] px-7 py-3 rounded-pill hover:opacity-90 transition-opacity"
          >
            Ask on WhatsApp
          </a>
        </FadeUp>
      </section>
    </main>
  );
}
