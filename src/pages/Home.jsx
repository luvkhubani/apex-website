import { Link } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import FadeUp from '../components/FadeUp';
import { useProducts } from '../hooks/useProducts';
import { useHeroConfig } from '../hooks/useHeroConfig';
import { useBannerConfig } from '../hooks/useBannerImage';
import { getProductImage } from '../utils/productImages';
import { useStoreConfig, waUrl, getStoreImage, getCatImages } from '../hooks/useStoreConfig';

// ── Store photo slider ────────────────────────────────────
function StorePhotoSlider({ photos }) {
  const [idx, setIdx]     = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX            = useRef(null);
  const touchY            = useRef(null);
  const n                 = photos.length;

  const go = useCallback((next) => setIdx((next + n) % n), [n]);

  // Auto-advance every 3.5 s
  useEffect(() => {
    if (n < 2 || paused) return;
    const t = setInterval(() => setIdx(i => (i + 1) % n), 3500);
    return () => clearInterval(t);
  }, [n, paused]);

  // Touch swipe — horizontal = change slide, vertical = let page scroll
  const onTouchStart = (e) => {
    touchX.current = e.touches[0].clientX;
    touchY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    const dy = e.changedTouches[0].clientY - touchY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      go(idx + (dx < 0 ? 1 : -1));
    }
    touchX.current = null;
    touchY.current = null;
  };

  if (n === 0) return (
    <div className="bg-apple-light rounded-[28px] min-h-[340px] md:min-h-[500px] h-full flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-apple-border">
      <div className="text-8xl mb-4">🏪</div>
      <p className="text-[13px] font-medium text-apple-gray tracking-wide uppercase">Add your store photos</p>
      <p className="text-[11px] text-apple-gray mt-1">Admin → 🏪 Store → Store Photos</p>
    </div>
  );

  return (
    <div
      className="relative rounded-[28px] overflow-hidden min-h-[340px] md:min-h-[500px] h-full select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Each slide absolutely stacked, opacity cross-fade */}
      {photos.map((ph, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === idx ? 1 : 0, zIndex: i === idx ? 1 : 0 }}
        >
          <img
            src={getStoreImage(ph)}
            alt={`Store ${i + 1}`}
            className="w-full h-full object-cover"
            draggable={false}
            loading={i === 0 ? 'eager' : 'lazy'}
            fetchpriority={i === 0 ? 'high' : 'auto'}
            decoding="async"
          />
        </div>
      ))}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" style={{ zIndex:2 }} />

      {/* Prev / Next arrows */}
      {n > 1 && (
        <>
          <button
            onClick={() => { setPaused(true); go(idx - 1); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center text-xl text-apple-black hover:bg-white transition-all shadow-lg"
            style={{ zIndex:3 }}
            aria-label="Previous"
            tabIndex={-1}
          >‹</button>
          <button
            onClick={() => { setPaused(true); go(idx + 1); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center text-xl text-apple-black hover:bg-white transition-all shadow-lg"
            style={{ zIndex:3 }}
            aria-label="Next"
            tabIndex={-1}
          >›</button>
        </>
      )}

      {/* Dot indicators */}
      {n > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2" style={{ zIndex:3 }}>
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => { setPaused(true); setIdx(i); }}
              className={`rounded-full transition-all duration-300 ${i === idx ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/80'}`}
              aria-label={`Photo ${i + 1}`}
              tabIndex={-1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function useStorePhotos() {
  const [photos, setPhotos] = useState([]);
  useEffect(() => {
    fetch('/api/store-photos')
      .then(r => r.ok ? r.json() : [])
      .then(d => setPhotos(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);
  return photos;
}

const BRAND_EMOJI = {
  Apple:'🍎',Samsung:'📱',OnePlus:'📲',Nothing:'⚪',Motorola:'📡',
  Xiaomi:'🔵',Realme:'🟡',Vivo:'🟣',OPPO:'🟢',Poco:'⚡',
  Infinix:'🔷',Tecno:'🟠','AI Plus':'🤖',Jio:'📶',Nokia:'🔲',
};

// Brand display order preference
const BRAND_ORDER = ["Apple","Samsung","OnePlus","Nothing","Xiaomi","Realme","Vivo","OPPO","Poco","Motorola","Infinix","Tecno","AI Plus","Jio","Nokia"];

function formatINR(price) {
  if (!price || price === 0) return null;
  return new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(price);
}

function PillBlack({ href, to, children, className = '' }) {
  const cls = `inline-flex items-center justify-center text-[17px] font-medium text-white bg-apple-black px-6 py-3 rounded-pill hover:scale-[1.02] transition-transform duration-200 ${className}`;
  if (href) return <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{children}</a>;
  return <Link to={to} className={cls}>{children}</Link>;
}

function PillOutline({ href, to, children, className = '' }) {
  const cls = `inline-flex items-center justify-center text-[17px] font-medium text-apple-black bg-white border border-apple-black px-6 py-3 rounded-pill hover:scale-[1.02] transition-transform duration-200 ${className}`;
  if (href) return <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{children}</a>;
  return <Link to={to} className={cls}>{children}</Link>;
}

function Section({ bg = 'bg-white', children, className = '' }) {
  return (
    <section className={`${bg} py-10 sm:py-[80px] md:py-[120px] px-4 sm:px-6 ${className}`}>
      <div className="max-w-[1200px] mx-auto">{children}</div>
    </section>
  );
}

// ── Hero product section (dynamic) ────────────────────────
function HeroProductSection({ item, products, index, waN }) {
  const variants = products.filter(p => p.brand === item.brand && p.name === item.name);
  if (variants.length === 0) return null;

  const thumbV   = variants.find(v => v.image) || variants[0];
  const imgSrc   = getProductImage(thumbV?.image);
  const prices   = variants.map(v => v.price).filter(Boolean);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const priceStr = formatINR(minPrice);
  const bg       = index % 2 === 0 ? 'bg-white' : 'bg-apple-light';
  const layout   = item.layout || 'left';
  const waMsg    = `Hi Apex! I am interested in ${item.name}. Please share availability and best price.`;

  const ImageBox = () => (
    <div className="bg-apple-light rounded-[32px] aspect-square overflow-hidden flex items-center justify-center">
      {imgSrc
        ? <img src={imgSrc} alt={item.name} className="w-full h-full object-contain p-4 sm:p-8 lg:p-10" fetchpriority={index === 0 ? 'high' : 'auto'} loading={index === 0 ? 'eager' : 'lazy'} decoding="async" />
        : <span className="text-9xl">{BRAND_EMOJI[item.brand] || '📱'}</span>
      }
    </div>
  );

  const TextBlock = () => (
    <div>
      <p className="text-[12px] font-semibold tracking-[0.15em] text-apple-gray uppercase mb-4">{item.brand}</p>
      <h2 className="font-sans font-bold text-[40px] md:text-[56px] text-apple-black leading-[1.07] tracking-[-0.02em] mb-5">
        {item.name}.
      </h2>
      {item.description && (
        <p className="text-[19px] md:text-[21px] text-apple-gray leading-relaxed mb-6 max-w-[400px]">
          {item.description}
        </p>
      )}
      {priceStr && <p className="text-[28px] font-semibold text-apple-black mb-6">From {priceStr}</p>}
      <PillBlack href={waUrl(waN, waMsg)}>
        Order on WhatsApp
      </PillBlack>
      <p className="text-[12px] font-semibold text-emerald-600 mt-4">
        ⚡ 2-Hour Delivery · All Indore
      </p>
    </div>
  );

  if (layout === 'center') {
    return (
      <Section bg={bg}>
        <FadeUp>
          <div className="text-center mb-12">
            <p className="text-[12px] font-semibold tracking-[0.15em] text-apple-gray uppercase mb-4">{item.brand}</p>
            <h2 className="font-sans font-bold text-[40px] md:text-[56px] text-apple-black leading-[1.07] tracking-[-0.02em] mb-5">
              {item.name}.
            </h2>
            {item.description && (
              <p className="text-[19px] md:text-[21px] text-apple-gray leading-relaxed mb-6 max-w-[540px] mx-auto">
                {item.description}
              </p>
            )}
            {priceStr && <p className="text-[28px] font-semibold text-apple-black mb-8">From {priceStr}</p>}
            <PillBlack href={waUrl(waN, waMsg)}>Order on WhatsApp</PillBlack>
          </div>
          <div className="bg-apple-light rounded-[32px] aspect-square sm:aspect-[4/3] md:aspect-[16/9] max-w-[860px] mx-auto overflow-hidden flex items-center justify-center">
            {imgSrc
              ? <img src={imgSrc} alt={item.name} className="w-full h-full object-contain p-4 sm:p-8 md:p-12" fetchpriority={index === 0 ? 'high' : 'auto'} loading={index === 0 ? 'eager' : 'lazy'} decoding="async" />
              : <span className="text-9xl">{BRAND_EMOJI[item.brand] || '📱'}</span>
            }
          </div>
        </FadeUp>
      </Section>
    );
  }

  return (
    <Section bg={bg}>
      <FadeUp>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 lg:gap-20 items-center">
          {layout === 'right' ? (
            <>
              {/* On mobile always show image on top for visual impact */}
              <div className="lg:hidden"><ImageBox /></div>
              <TextBlock />
              <div className="hidden lg:block"><ImageBox /></div>
            </>
          ) : (
            <>
              {/* On mobile always show image on top */}
              <div className="lg:hidden"><ImageBox /></div>
              <div className="hidden lg:block"><ImageBox /></div>
              <TextBlock />
            </>
          )}
        </div>
      </FadeUp>
    </Section>
  );
}

// ── Fallback static product sections ─────────────────────
function StaticHeroSections() {
  return (
    <>
      <Section bg="bg-white">
        <FadeUp>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="bg-apple-light rounded-[32px] aspect-square flex items-center justify-center"><span className="text-9xl">🍎</span></div>
            <div>
              <p className="text-[12px] font-semibold tracking-[0.15em] text-apple-gray uppercase mb-4">Mobiles</p>
              <h2 className="font-sans font-bold text-[40px] md:text-[56px] text-apple-black leading-[1.07] tracking-[-0.02em] mb-5">Your Hero Product.</h2>
              <p className="text-[19px] md:text-[21px] text-apple-gray leading-relaxed mb-6 max-w-[400px]">Select featured products from the admin panel to showcase them here.</p>
              <PillBlack to="/products">Browse All Products</PillBlack>
            </div>
          </div>
        </FadeUp>
      </Section>
    </>
  );
}

// ─────────────────────────────────────────────────────────
export default function Home() {
  const products    = useProducts();
  const heroConfig  = useHeroConfig();
  const banner      = useBannerConfig();
  const storeCfg    = useStoreConfig();
  const storePhotos = useStorePhotos();

  // Dynamic brands — only show brands present in our product list, in preferred order
  const activeBrands = BRAND_ORDER.filter(b => products.some(p => p.brand === b));

  return (
    <div className="bg-white">

      {/* ── 1. HERO ─────────────────────────────────────────── */}
      {banner.title || banner.image ? (
        /* ── CLEAN PRODUCT HERO (when banner is set) ── */
        <section
          className="relative min-h-screen flex flex-col items-center justify-start text-center overflow-hidden"
          style={{ background: 'linear-gradient(180deg, #f9f9f9 0%, #ffffff 50%, #f5f5f7 100%)' }}
        >
          {/* Very subtle radial accent behind product */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 60% 55% at 50% 85%, rgba(0,113,227,0.05) 0%, transparent 70%)' }}
          />

          {/* Text + Image — single continuous block, no gap */}
          <div className="relative z-10 w-full flex flex-col items-center pt-24 px-6">

            {/* Store headline */}
            <p className="text-[13px] font-medium text-apple-gray tracking-[0.1em] uppercase mb-4">
              {storeCfg.heroEyebrow || `Trusted Since 1996 · ${storeCfg.addressLine1}`}
            </p>
            <h2 className="font-sans font-bold text-[32px] md:text-[48px] text-apple-black leading-[1.07] tracking-[-0.02em] mb-8">
              {(storeCfg.heroHeadline || 'The Best Phones.\nIndore\'s Best Price.').split('\n').map((line, i, arr) => (
                <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
              ))}
            </h2>

            {/* Divider */}
            <div className="w-12 h-px bg-apple-border mb-8" />

            {/* Eyebrow badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3] animate-pulse" />
              <span className="text-[11px] font-semibold tracking-[0.2em] text-[#0071e3] uppercase">
                {banner.label || 'Highlight of the Day'}
              </span>
            </div>

            {/* Product name */}
            <h1
              className="font-sans font-bold text-apple-black leading-[1.04] tracking-[-0.03em] mb-3"
              style={{ fontSize: 'clamp(40px, 8vw, 96px)' }}
            >
              {banner.title}
            </h1>

            {/* Tagline */}
            {banner.subtitle && (
              <p
                className="text-apple-gray leading-relaxed mb-4 max-w-[520px]"
                style={{ fontSize: 'clamp(16px, 2.2vw, 20px)' }}
              >
                {banner.subtitle}
              </p>
            )}

            {/* Price */}
            {banner.price && (
              <p className="font-bold text-apple-black mb-5 tracking-tight" style={{ fontSize: 'clamp(28px, 5vw, 48px)' }}>
                {isNaN(Number(banner.price))
                  ? banner.price
                  : `From ${new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(Number(banner.price))}`
                }
              </p>
            )}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3 mb-3">
              <a
                href={banner.ctaLink || waUrl(storeCfg.whatsappNumber, 'Hi Apex! I am interested in ' + banner.title + '. Please share availability and best price.')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-[15px] font-medium text-white bg-[#0071e3] px-7 py-3 rounded-full hover:bg-[#0077ed] active:scale-[0.98] transition-all shadow-sm"
              >
                {banner.ctaText || 'Order on WhatsApp'}
              </a>
              <Link
                to="/products"
                className="inline-flex items-center gap-1 text-[15px] font-medium text-[#0071e3] hover:underline underline-offset-2 transition-all"
              >
                View all products <span className="text-[18px] leading-none">›</span>
              </Link>
            </div>

            {/* Delivery badge */}
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5 mb-0">
              <span className="text-emerald-600 text-[15px]">⚡</span>
              <p className="text-[13px] font-bold text-emerald-700 tracking-wide">
                2-Hour Delivery · All Indore
              </p>
            </div>

            {/* Product image — flows directly below CTAs */}
            <div className="w-full max-w-[640px] -mt-4">
              {banner.image ? (
                <img
                  src={getProductImage(banner.image) || banner.image}
                  alt={banner.title}
                  className="w-full object-contain select-none"
                  fetchpriority="high"
                  loading="eager"
                  decoding="async"
                  style={{
                    maxHeight: '72vh',
                  }}
                />
              ) : (
                <div className="text-[140px] text-center" style={{ filter:'drop-shadow(0 16px 32px rgba(0,0,0,0.08))' }}>📱</div>
              )}
            </div>

          </div>

          {/* Bottom gradient fade to next section */}
          <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
            style={{ background:'linear-gradient(to bottom, transparent, #fff)' }} />
        </section>
      ) : (
        /* ── DEFAULT STORE HERO (when no banner set) ── */
        <section className="bg-white min-h-screen flex flex-col items-center justify-center text-center px-6 py-20">
          <FadeUp>
            <p className="text-[14px] font-medium text-apple-gray tracking-[0.1em] uppercase mb-6">
              {storeCfg.heroEyebrow || `Trusted Since 1996 · ${storeCfg.addressLine1}`}
            </p>
            <h1 className="font-sans font-bold text-[48px] md:text-[80px] text-apple-black leading-[1.05] tracking-[-0.02em] mb-6">
              {(storeCfg.heroHeadline || 'The Best Phones.\nIndore\'s Best Price.').split('\n').map((line, i, arr) => (
                <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
              ))}
            </h1>
            <p className="text-[19px] md:text-[21px] text-apple-gray max-w-[560px] mx-auto mb-10 leading-relaxed">
              {activeBrands.slice(0, 4).join('. ')}. All in one place.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <PillBlack to="/products">Shop Now</PillBlack>
              <PillOutline href={waUrl(storeCfg.whatsappNumber)}>Chat on WhatsApp</PillOutline>
            </div>
            <p className="text-[12px] font-semibold text-emerald-600 mt-6">
              ⚡ 2-Hour Delivery · All Indore
            </p>
          </FadeUp>
          <FadeUp delay={150} className="w-full max-w-[700px] mt-16">
            <div className="w-full bg-apple-light rounded-[32px] aspect-[16/9] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-apple-border">
              <div className="text-7xl mb-4">🌟</div>
              <p className="text-[14px] font-semibold text-apple-black mb-1">Highlight of the Day</p>
              <p className="text-[13px] text-apple-gray">Set it in Admin → 🌟 Hero → Highlight of the Day</p>
            </div>
          </FadeUp>
        </section>
      )}

      {/* ── 2. BRANDS BAR (dynamic) ─────────────────────────── */}
      <div className="border-t border-b border-apple-border py-4 overflow-x-auto no-scrollbar">
        <div className="flex items-center justify-center min-w-max gap-0 px-6">
          {activeBrands.map((brand, i) => (
            <span key={brand} className="flex items-center">
              <Link
                to={`/products?brand=${encodeURIComponent(brand)}`}
                className="text-[18px] font-medium text-apple-black px-5 hover:underline underline-offset-4 transition-all duration-150"
              >
                {brand}
              </Link>
              {i < activeBrands.length - 1 && (
                <span className="text-apple-border text-lg select-none">·</span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* ── 3. HERO PRODUCT SECTIONS ─────────────────────────── */}
      {heroConfig.length > 0
        ? heroConfig.map((item, i) => (
            <HeroProductSection key={`${item.brand}||${item.name}`} item={item} products={products} index={i} waN={storeCfg.whatsappNumber} />
          ))
        : <StaticHeroSections />
      }

      {/* ── 4. CATEGORY GRID ─────────────────────────────────── */}
      <Section bg="bg-apple-light">
        <FadeUp>
          <div className="text-center mb-14">
            <p className="text-[12px] font-semibold tracking-[0.15em] text-apple-gray uppercase mb-4">Browse</p>
            <h2 className="font-sans font-bold text-[40px] md:text-[56px] text-apple-black leading-[1.07] tracking-[-0.02em]">
              Shop by Category.
            </h2>
          </div>
        </FadeUp>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {storeCfg.categories.map((cat, i) => {
            const href    = cat.link || `/products?category=${cat.filter}`;
            const isExt   = href.startsWith('http');
            const cardCls = "group block bg-white rounded-[24px] overflow-hidden transition-all duration-300 hover:-translate-y-1";
            const cardEvt = {
              onMouseEnter: e => e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.12)',
              onMouseLeave: e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)',
              style: { boxShadow:'0 4px 20px rgba(0,0,0,0.06)' },
            };
            const CardWrap = ({ children }) => isExt
              ? <a href={href} target="_blank" rel="noopener noreferrer" className={cardCls} {...cardEvt}>{children}</a>
              : <Link to={href} className={cardCls} {...cardEvt}>{children}</Link>;

            const catImgs = getCatImages(cat);

            return (
            <FadeUp key={cat.label + i} delay={i * 80}>
              <CardWrap>
                {catImgs.length === 0 ? (
                  <div className="bg-apple-light h-52 flex items-center justify-center">
                    <span className="text-7xl transition-transform duration-300 group-hover:scale-110">{cat.emoji}</span>
                  </div>
                ) : catImgs.length === 1 ? (
                  <div className="bg-apple-light h-52 overflow-hidden">
                    <img src={getStoreImage(catImgs[0])} alt={cat.label} className="w-full h-full object-contain p-6 transition-transform duration-300 group-hover:scale-105" loading="lazy" decoding="async" />
                  </div>
                ) : (
                  <div className="h-52 flex overflow-hidden bg-apple-light">
                    {catImgs.slice(0, 2).map((img, idx) => (
                      <div key={idx} className="flex-1 flex items-center justify-center p-4 relative">
                        <img src={getStoreImage(img)} alt={`${cat.label} ${idx + 1}`} className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105" loading="lazy" decoding="async" />
                        {idx === 0 && <div className="absolute inset-y-0 right-0 w-px bg-apple-border/40" />}
                      </div>
                    ))}
                  </div>
                )}
                <div className="px-7 py-5 flex items-center justify-between">
                  <div>
                    <p className="text-[18px] font-semibold text-apple-black">{cat.label}</p>
                    <p className="text-[14px] text-apple-gray mt-0.5">{cat.sub}</p>
                  </div>
                  <span className="text-[22px] text-apple-gray group-hover:translate-x-1 transition-transform duration-200">→</span>
                </div>
              </CardWrap>
            </FadeUp>
            );
          })}
        </div>
      </Section>

      {/* ── 5. TRUST STATS ───────────────────────────────────── */}
      <Section bg="bg-white">
        <FadeUp>
          <div className="text-center mb-16">
            <p className="text-[12px] font-semibold tracking-[0.15em] text-apple-gray uppercase mb-4">Our Track Record</p>
            <h2 className="font-sans font-bold text-[40px] md:text-[56px] text-apple-black leading-[1.07] tracking-[-0.02em]">
              Why Indore Trusts Apex.
            </h2>
          </div>
        </FadeUp>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {storeCfg.trustStats.map((s, i) => (
            <FadeUp key={s.label + i} delay={i * 100}>
              <div className="text-center">
                <p className="font-display font-bold text-[56px] md:text-[72px] text-apple-black leading-none tracking-tight mb-3">
                  {s.num || `${activeBrands.length}+`}
                </p>
                <p className="text-[16px] text-apple-gray">{s.label}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </Section>

      {/* ── 6. TESTIMONIALS ──────────────────────────────────── */}
      {storeCfg.testimonials.length > 0 && (
        <Section bg="bg-apple-light">
          <FadeUp>
            <div className="text-center mb-14">
              <p className="text-[12px] font-semibold tracking-[0.15em] text-apple-gray uppercase mb-4">Reviews</p>
              <h2 className="font-sans font-bold text-[40px] md:text-[56px] text-apple-black leading-[1.07] tracking-[-0.02em]">
                Loved in Indore.
              </h2>
            </div>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {storeCfg.testimonials.map((t, i) => (
              <FadeUp key={t.name + i} delay={i * 100}>
                <div className="bg-white rounded-[20px] p-8" style={{ boxShadow:'0 4px 20px rgba(0,0,0,0.06)' }}>
                  <p className="font-display text-[64px] leading-none text-apple-border mb-2 select-none">&ldquo;</p>
                  <p className="font-display italic text-[19px] text-apple-black leading-relaxed mb-6">{t.quote}</p>
                  <p className="text-[15px] font-medium text-apple-black">{t.name}</p>
                  <p className="text-[13px] text-apple-gray mt-0.5">{t.location || 'Indore'}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </Section>
      )}

      {/* ── 7. STORE ──────────────────────────────────────────── */}
      <Section bg="bg-white">
        <FadeUp>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-stretch">
            {/* Store photo slider — stretches to match right column height */}
            <StorePhotoSlider photos={storePhotos} />
            <div className="py-2">
              <p className="text-[12px] font-semibold tracking-[0.15em] text-apple-gray uppercase mb-4">Visit Us</p>
              <h2 className="font-sans font-bold text-[40px] md:text-[48px] text-apple-black leading-[1.1] tracking-[-0.02em] mb-5">
                Apex The Mobile Shoppe.
              </h2>
              <p className="text-[21px] text-apple-gray mb-2">{storeCfg.addressLine1}</p>
              <p className="text-[17px] text-apple-gray mb-10">Open daily {storeCfg.storeHoursShort}</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <PillBlack href={storeCfg.googleMapsLink || 'https://maps.google.com/?q=Apex+The+Mobile+Shoppe+Jail+Road+Indore'}>Get Directions</PillBlack>
                <PillBlack href={waUrl(storeCfg.whatsappNumber)}>WhatsApp Us</PillBlack>
              </div>
            </div>
          </div>
        </FadeUp>
      </Section>

      {/* ── 8. INSTAGRAM ─────────────────────────────────────── */}
      <Section bg="bg-white">
        <FadeUp>
          <div className="text-center mb-12">
            <h2 className="font-sans font-bold text-[40px] md:text-[56px] text-apple-black leading-[1.07] tracking-[-0.02em] mb-3">
              Follow Along.
            </h2>
            <p className="text-[19px] text-apple-gray">@{storeCfg.instagramHandle}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-apple-light aspect-square rounded-[12px] flex flex-col items-center justify-center gap-2 hover:opacity-75 transition-opacity cursor-pointer">
                <svg className="w-6 h-6 text-apple-gray fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
                <span className="text-[11px] text-apple-gray">Post {i + 1}</span>
              </div>
            ))}
          </div>
          <div className="text-center">
            <PillBlack href={storeCfg.instagramUrl}>Follow on Instagram</PillBlack>
          </div>
        </FadeUp>
      </Section>

    </div>
  );
}
