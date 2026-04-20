import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard  from '../components/ProductCard';
import ProductModal from '../components/ProductModal';
import FadeUp       from '../components/FadeUp';
import { useProducts } from '../hooks/useProducts';
import { useStoreConfig, waUrl } from '../hooks/useStoreConfig';

// ── Filter config ────────────────────────────────────────────
const BRANDS = [
  'All','Apple','Samsung','OnePlus','Nothing','Motorola',
  'Xiaomi','Realme','Vivo','OPPO','Poco','Infinix','Tecno',
  'AI Plus','Jio','Nokia',
];
const CATEGORIES = ['All','Mobiles','Laptops','Tablets','Earphones'];
const SORT_OPTIONS = [
  { label:'Newest',    value:'newest' },
  { label:'Price ↑',  value:'price_asc' },
  { label:'Price ↓',  value:'price_desc' },
  { label:'Popular',  value:'popular' },
];

function recordClick(key) {
  fetch('/api/product-clicks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key }),
  }).catch(() => {});
}

// ── Group variants into models ───────────────────────────────
function groupProducts(list) {
  const map = new Map();
  list.forEach(p => {
    const key = `${p.brand}__${p.name}`;
    if (!map.has(key)) {
      map.set(key, {
        key,
        name:     p.name,
        brand:    p.brand,
        category: p.category,
        badge:    p.badge,
        description: p.description || '',
        variants: [],
      });
    }
    map.get(key).variants.push(p);
  });
  return [...map.values()];
}

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
  const products       = useProducts();
  const storeCfg       = useStoreConfig();
  const [searchParams] = useSearchParams();
  const [search,     setSearch]     = useState('');
  const [brands,     setBrands]     = useState(() => {
    const b = searchParams.get('brand');
    return b && BRANDS.includes(b) ? new Set([b]) : new Set();
  });
  const [category,   setCategory]   = useState(() => {
    const c = searchParams.get('category');
    return c && CATEGORIES.includes(c) ? c : 'All';
  });
  const [priceMin,   setPriceMin]   = useState('');
  const [priceMax,   setPriceMax]   = useState('');
  const [sort,       setSort]       = useState('newest');
  const [clicks,     setClicks]     = useState({});
  const [openGroup,  setOpenGroup]  = useState(null);

  // Fetch backend click counts on mount
  useEffect(() => {
    fetch('/api/product-clicks')
      .then(r => r.ok ? r.json() : {})
      .then(data => setClicks(data))
      .catch(() => {});
  }, []);

  const handleGroupClick = (group) => {
    recordClick(group.key);
    setClicks(prev => ({ ...prev, [group.key]: (prev[group.key] || 0) + 1 }));
    setOpenGroup(group);
  };

  // Sync if URL params change (e.g. back/forward navigation)
  useEffect(() => {
    const b = searchParams.get('brand');
    if (b && BRANDS.includes(b)) setBrands(new Set([b]));
    const c = searchParams.get('category');
    if (c && CATEGORIES.includes(c)) setCategory(c);
  }, [searchParams]);

  // ── Filtered + grouped ───────────────────────────────────
  const groups = useMemo(() => {
    let list = [...products];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q)    ||
        p.brand.toLowerCase().includes(q)   ||
        (p.color   && p.color.toLowerCase().includes(q))   ||
        (p.ram     && p.ram.toLowerCase().includes(q))     ||
        (p.storage && p.storage.toLowerCase().includes(q))
      );
    }

    // Brand (multi-select — empty set = all)
    if (brands.size > 0) list = list.filter(p => brands.has(p.brand));

    // Category
    if (category !== 'All') list = list.filter(p => p.category === category);

    // Price — manual min/max inputs
    const minP = priceMin !== '' ? Number(priceMin) : 0;
    const maxP = priceMax !== '' ? Number(priceMax) : Infinity;
    if (priceMin !== '' || priceMax !== '') {
      list = list.filter(p => p.price > 0 && p.price >= minP && p.price <= maxP);
    }

    // Group
    let g = groupProducts(list);

    if (sort === 'price_asc') {
      g.sort((a, b) => Math.min(...a.variants.map(v => v.price || 0)) - Math.min(...b.variants.map(v => v.price || 0)));
    } else if (sort === 'price_desc') {
      g.sort((a, b) => Math.max(...b.variants.map(v => v.price || 0)) - Math.max(...a.variants.map(v => v.price || 0)));
    } else if (sort === 'popular') {
      g.sort((a, b) => (clicks[b.key] || 0) - (clicks[a.key] || 0));
    }

    return g;
  }, [products, search, brands, category, priceMin, priceMax, sort, clicks]);

  const totalModels   = useMemo(() => groupProducts(products).length, [products]);
  const totalVariants = products.length;

  return (
    <main className="min-h-screen bg-white">

      {/* ── WhatsApp banner ───────────────────────────────── */}
      <div className="bg-[#25D366] text-white text-center py-2.5 px-4">
        <a
          href={waUrl(storeCfg.whatsappNumber, 'Hi Apex! I am looking for:\nModel: \nColour: \nStorage / Variant: \nBudget: \nBrands preferred: ')}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[13px] font-medium hover:underline"
        >
          Can&apos;t find your model? WhatsApp us for your required model →
        </a>
      </div>

      {/* ── Page header ───────────────────────────────────── */}
      <section className="bg-white pt-12 pb-8 px-6 border-b border-apple-border">
        <div className="max-w-[1200px] mx-auto">
          <FadeUp>
            <p className="text-[12px] font-semibold tracking-[0.15em] text-apple-gray uppercase mb-3">
              Our Collection
            </p>
            <p className="text-[15px] text-apple-gray">
              Store hours: <strong className="text-apple-black">{storeCfg.storeHoursShort}</strong>, Monday to Sunday
              &nbsp;·&nbsp; {storeCfg.addressLine1}
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ── Sticky filters ────────────────────────────────── */}
      <div className="sticky top-12 z-40 bg-white/95 backdrop-blur-xl border-b border-apple-border shadow-sm">
        <div className="max-w-[1200px] mx-auto px-6 py-3 space-y-2.5">

          {/* Search */}
          <input
            type="text"
            placeholder="Search by name, brand, RAM, storage, colour…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full text-[14px] px-4 py-2 rounded-pill border border-apple-border bg-apple-light text-apple-black placeholder-apple-gray focus:outline-none focus:ring-2 focus:ring-apple-black/20"
          />

          {/* Sort pills */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar items-center">
            <span className="text-[12px] text-apple-gray font-medium flex-shrink-0">Sort:</span>
            {SORT_OPTIONS.map(o => (
              <Pill key={o.value} active={sort === o.value} onClick={() => setSort(o.value)}>
                {o.label}
              </Pill>
            ))}
          </div>

          {/* Brand pills — multi-select, "All" clears selection */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <Pill active={brands.size === 0} onClick={() => setBrands(new Set())}>All</Pill>
            {BRANDS.filter(b => b !== 'All').map(b => (
              <Pill
                key={b}
                active={brands.has(b)}
                onClick={() => setBrands(prev => {
                  const next = new Set(prev);
                  next.has(b) ? next.delete(b) : next.add(b);
                  return next;
                })}
              >{b}</Pill>
            ))}
          </div>

          {/* Category + Price range */}
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {CATEGORIES.map(c => (
                <Pill key={c} active={category === c} onClick={() => setCategory(c)}>{c}</Pill>
              ))}
            </div>
            <span className="text-apple-border self-center mx-1 text-lg hidden sm:inline">|</span>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-[12px] text-apple-gray font-medium">₹</span>
              <input
                type="number"
                min="0"
                placeholder="Min"
                value={priceMin}
                onChange={e => setPriceMin(e.target.value)}
                className="w-24 text-[13px] px-3 py-1.5 rounded-pill border border-apple-border bg-apple-light text-apple-black placeholder-apple-gray focus:outline-none focus:ring-2 focus:ring-apple-black/20"
              />
              <span className="text-[12px] text-apple-gray">–</span>
              <span className="text-[12px] text-apple-gray font-medium">₹</span>
              <input
                type="number"
                min="0"
                placeholder="Max"
                value={priceMax}
                onChange={e => setPriceMax(e.target.value)}
                className="w-24 text-[13px] px-3 py-1.5 rounded-pill border border-apple-border bg-apple-light text-apple-black placeholder-apple-gray focus:outline-none focus:ring-2 focus:ring-apple-black/20"
              />
              {(priceMin !== '' || priceMax !== '') && (
                <button
                  onClick={() => { setPriceMin(''); setPriceMax(''); }}
                  className="text-[12px] text-apple-gray hover:text-apple-black transition-colors px-1"
                >✕</button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Count ─────────────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-6 pt-5 pb-2">
        <p className="text-[13px] text-apple-gray">
          Showing{' '}
          <strong className="text-apple-black">{groups.length}</strong> of{' '}
          <strong className="text-apple-black">{totalModels}</strong> models
        </p>
      </div>

      {/* ── Grid ──────────────────────────────────────────── */}
      <section className="py-4 px-6 pb-16">
        <div className="max-w-[1200px] mx-auto">
          {groups.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {groups.map((group, i) => (
                <FadeUp key={group.key} delay={Math.min(i * 30, 300)}>
                  <ProductCard group={group} onClick={() => handleGroupClick(group)} />
                </FadeUp>
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <p className="text-6xl mb-4">🔍</p>
              <p className="font-sans font-bold text-[24px] text-apple-black mb-2">No products found.</p>
              <p className="text-[15px] text-apple-gray mb-6">Try a different search or clear your filters.</p>
              <button
                onClick={() => { setSearch(''); setBrands(new Set()); setCategory('All'); setPriceMin(''); setPriceMax(''); }}
                className="text-[14px] font-medium text-white bg-apple-black px-6 py-3 rounded-pill hover:scale-[1.02] transition-transform"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────── */}
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
            Store open <strong className="text-apple-black">{storeCfg.storeHoursShort}</strong> daily
          </p>
          <a
            href={waUrl(storeCfg.whatsappNumber, 'Hi Apex! I am looking for a specific product. Please help.')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[14px] font-medium text-white bg-[#25D366] px-7 py-3 rounded-pill hover:opacity-90 transition-opacity"
          >
            Ask on WhatsApp
          </a>
        </FadeUp>
      </section>

      {/* ── Detail modal ──────────────────────────────────── */}
      {openGroup && (
        <ProductModal
          group={openGroup}
          onClose={() => setOpenGroup(null)}
        />
      )}
    </main>
  );
}
