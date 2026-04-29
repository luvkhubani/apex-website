import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
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
  { label:'Featured',  value:'featured' },
  { label:'Popular',   value:'popular' },
  { label:'Newest',    value:'newest' },
  { label:'Price ↑',   value:'price_asc' },
  { label:'Price ↓',   value:'price_desc' },
];

// Premium brands shown first in Featured sort
const BRAND_TIER = {
  Apple:1, Samsung:1, OnePlus:1,
  Nothing:2, Motorola:2, Xiaomi:2, Realme:2, Vivo:2,
  OPPO:3, Poco:3, Infinix:3, Tecno:3, 'AI Plus':3, Jio:3, Nokia:3,
};

function recordClick(key) {
  return fetch('/api/product-clicks', {
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
  const navigate       = useNavigate();
  const location       = useLocation();
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
  const [sort,       setSort]       = useState('featured');
  const [clicks,     setClicks]     = useState({});
  const [openGroup,  setOpenGroup]  = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Fetch backend click counts on mount
  useEffect(() => {
    fetch('/api/product-clicks')
      .then(r => r.ok ? r.json() : {})
      .then(data => setClicks(data))
      .catch(() => {});
  }, []);

  const handleGroupClick = (group) => {
    recordClick(group.key).then(() =>
      fetch('/api/product-clicks')
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data) setClicks(data); })
        .catch(() => {})
    );
    navigate(location.pathname + location.search + '#' + encodeURIComponent(group.key));
  };

  // Sync if URL params change (e.g. back/forward navigation)
  useEffect(() => {
    const b = searchParams.get('brand');
    if (b && BRANDS.includes(b)) setBrands(new Set([b]));
    const c = searchParams.get('category');
    if (c && CATEGORIES.includes(c)) setCategory(c);
  }, [searchParams]);

  const allGroups = useMemo(() => groupProducts(products), [products]);

  // Sync modal open/close with the URL hash so back/forward navigation works
  useEffect(() => {
    const key = decodeURIComponent(location.hash.slice(1));
    if (key) {
      const group = allGroups.find(g => g.key === key);
      setOpenGroup(group ?? null);
    } else {
      setOpenGroup(null);
    }
  }, [location.hash, allGroups]);

  // ── Filtered + grouped ───────────────────────────────────
  const groups = useMemo(() => {
    // Apply visibility reactively (catches same-tab storeConfig updates)
    const hiddenIds = new Set(storeCfg.hiddenProductIds || []);
    let list = hiddenIds.size > 0 ? products.filter(p => !hiddenIds.has(p.id)) : [...products];

    // Search
    if (search.trim()) {
      // Split into tokens — every token must match at least one field (AND logic)
      const tokens = search.trim().toLowerCase().split(/\s+/).filter(Boolean);
      list = list.filter(p => {
        const haystack = [p.name, p.brand, p.color, p.ram, p.storage, p.category, p.badge]
          .filter(Boolean).join(' ').toLowerCase();
        return tokens.every(t => haystack.includes(t));
      });
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

    if (sort === 'featured') {
      g.sort((a, b) => {
        const inStockA = a.variants.some(v => v.inStock) ? 0 : 1;
        const inStockB = b.variants.some(v => v.inStock) ? 0 : 1;
        if (inStockA !== inStockB) return inStockA - inStockB;
        const tierA = BRAND_TIER[a.brand] ?? 4;
        const tierB = BRAND_TIER[b.brand] ?? 4;
        if (tierA !== tierB) return tierA - tierB;
        return (clicks[b.key] || 0) - (clicks[a.key] || 0);
      });
    } else if (sort === 'price_asc') {
      g.sort((a, b) => Math.min(...a.variants.map(v => v.price || 0)) - Math.min(...b.variants.map(v => v.price || 0)));
    } else if (sort === 'price_desc') {
      g.sort((a, b) => Math.max(...b.variants.map(v => v.price || 0)) - Math.max(...a.variants.map(v => v.price || 0)));
    } else if (sort === 'popular') {
      g.sort((a, b) => (clicks[b.key] || 0) - (clicks[a.key] || 0));
    }

    return g;
  }, [products, storeCfg, search, brands, category, priceMin, priceMax, sort, clicks]);

  const totalModels = allGroups.length;

  // Whether any filter is active (switch to flat grid when true)
  const isFiltered = search.trim() || brands.size > 0 || category !== 'All' || priceMin !== '' || priceMax !== '';

  // Pinned row: groups matching pinnedProductKeys (from admin), shown above brand sections
  const pinnedGroups = useMemo(() => {
    const keys = new Set(storeCfg.pinnedProductKeys || []);
    if (!keys.size) return [];
    return allGroups.filter(g => keys.has(g.key));
  }, [allGroups, storeCfg.pinnedProductKeys]);

  // Brand sections: groups split by brand, ordered by storeCfg.brandOrder
  const brandSections = useMemo(() => {
    if (isFiltered) return [];
    const pinnedKeys = new Set(storeCfg.pinnedProductKeys || []);
    const order = storeCfg.brandOrder || [];
    // Build a map: brand → sorted groups (by click popularity)
    const map = new Map();
    for (const g of allGroups) {
      if (pinnedKeys.has(g.key)) continue; // pinned ones shown separately
      if (!map.has(g.brand)) map.set(g.brand, []);
      map.get(g.brand).push(g);
    }
    // Sort groups within each brand by popularity then in-stock
    map.forEach((gs, brand) => {
      gs.sort((a, b) => {
        const inStockA = a.variants.some(v => v.inStock) ? 0 : 1;
        const inStockB = b.variants.some(v => v.inStock) ? 0 : 1;
        if (inStockA !== inStockB) return inStockA - inStockB;
        return (clicks[b.key] || 0) - (clicks[a.key] || 0);
      });
    });
    // Order brands: listed ones first, then remaining alphabetically
    const ordered = [];
    for (const brand of order) { if (map.has(brand)) ordered.push({ brand, groups: map.get(brand) }); }
    for (const [brand, gs] of map) {
      if (!order.includes(brand)) ordered.push({ brand, groups: gs });
    }
    return ordered.filter(s => s.groups.length > 0);
  }, [allGroups, storeCfg.brandOrder, storeCfg.pinnedProductKeys, isFiltered, clicks]);

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
          Can&apos;t find your model? We stock thousands of products. Just whatsapp — our team will source it for you →
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
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-3 space-y-2.5">

          {/* Search + mobile filter toggle */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 text-[14px] px-4 py-2 rounded-pill border border-apple-border bg-apple-light text-apple-black placeholder-apple-gray focus:outline-none focus:ring-2 focus:ring-apple-black/20"
            />
            {/* Filter toggle button */}
            <button
              onClick={() => setFiltersOpen(f => !f)}
              className={`flex-shrink-0 flex items-center gap-1.5 text-[13px] font-medium px-4 py-2 rounded-pill border transition-all duration-200 ${
                filtersOpen || brands.size > 0 || category !== 'All' || sort !== 'featured' || priceMin !== '' || priceMax !== ''
                  ? 'bg-apple-black text-white border-apple-black'
                  : 'bg-apple-light text-apple-black border-apple-border'
              }`}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
              </svg>
              Filters
              {(() => {
                const n = (brands.size > 0 ? 1 : 0) + (category !== 'All' ? 1 : 0) + (sort !== 'featured' ? 1 : 0) + (priceMin !== '' || priceMax !== '' ? 1 : 0);
                return n > 0 ? <span className="bg-white text-apple-black rounded-full w-4 h-4 text-[10px] font-bold flex items-center justify-center leading-none">{n}</span> : null;
              })()}
            </button>
          </div>

          {/* Filter rows — toggled on all screen sizes */}
          <div className={`${filtersOpen ? 'flex' : 'hidden'} flex-col gap-2.5`}>

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
      </div>

      {/* ── Products area ─────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-16">

        {isFiltered ? (
          /* ── Filtered: flat grid ── */
          <>
            <p className="text-[13px] text-apple-gray pt-5 pb-3">
              Showing <strong className="text-apple-black">{groups.length}</strong> of{' '}
              <strong className="text-apple-black">{totalModels}</strong> models
            </p>
            {groups.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                {groups.map((group, i) => (
                  <FadeUp key={group.key} delay={Math.min(i * 30, 300)}>
                    <ProductCard group={group} onClick={() => handleGroupClick(group)} />
                  </FadeUp>
                ))}
              </div>
            ) : (
              <div className="text-center py-24">
                <p className="text-5xl mb-4">🔍</p>
                <p className="font-bold text-[22px] text-apple-black mb-2">No products found.</p>
                <p className="text-[15px] text-apple-gray mb-6">Try a different search or clear your filters.</p>
                <button
                  onClick={() => { setSearch(''); setBrands(new Set()); setCategory('All'); setPriceMin(''); setPriceMax(''); }}
                  className="text-[14px] font-medium text-white bg-apple-black px-6 py-3 rounded-pill hover:scale-[1.02] transition-transform"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </>
        ) : (
          /* ── Unfiltered: brand sections ── */
          <div className="pt-6 space-y-10">

            {/* Pinned / Featured row */}
            {pinnedGroups.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[10px] font-bold tracking-[0.18em] text-amber-600 uppercase bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">⭐ Featured</span>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                  {pinnedGroups.map((group, i) => (
                    <FadeUp key={group.key} delay={i * 40}>
                      <ProductCard group={group} onClick={() => handleGroupClick(group)} />
                    </FadeUp>
                  ))}
                </div>
                <div className="border-b border-apple-border mt-10" />
              </div>
            )}

            {/* Brand sections */}
            {brandSections.map(({ brand, groups: bGroups }) => (
              <div key={brand}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-[18px] sm:text-[20px] font-bold text-apple-black">{brand}</h2>
                    <span className="text-[11px] text-apple-gray bg-apple-light px-2 py-0.5 rounded-full border border-apple-border">
                      {bGroups.length} model{bGroups.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <button
                    onClick={() => { setBrands(new Set([brand])); setFiltersOpen(false); }}
                    className="text-[12px] font-medium text-apple-gray hover:text-apple-black transition-colors"
                  >
                    See all →
                  </button>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                  {bGroups.map((group, i) => (
                    <FadeUp key={group.key} delay={Math.min(i * 30, 200)}>
                      <ProductCard group={group} onClick={() => handleGroupClick(group)} />
                    </FadeUp>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
          onClose={() => navigate(-1)}
        />
      )}
    </main>
  );
}
