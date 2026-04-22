import { useState, useEffect, useMemo } from 'react';
import { getProductImage } from '../utils/productImages';
import { useStoreConfig, waUrl } from '../hooks/useStoreConfig';

// ── Colour → hex ────────────────────────────────────────────
const COLOR_HEX = {
  'Black':'#1C1C1E','White':'#F5F5F0','Blue':'#4A90D9','Pink':'#FFB6C1',
  'Green':'#4CAF50','Silver':'#B8B8B8','Gold':'#D4AF37','Purple':'#9C27B0',
  'Red':'#E53935','Orange':'#FF9800','Grey':'#9E9E9E','Gray':'#9E9E9E',
  'Violet':'#7E57C2','Mint':'#80CBC4','Indigo':'#3949AB','Blush':'#FFAB91',
  'Desert':'#BCAAA4','Lavender':'#CE93D8','Marble':'#E8E8E0','Ice':'#B3E5FC',
  'Fog':'#CFD8DC','Teal':'#00897B','Fresh':'#A5D6A7','Active':'#78909C',
  'Yellow':'#FFEB3B',
};

function colorHex(colorStr) {
  if (!colorStr) return '#999';
  if (COLOR_HEX[colorStr]) return COLOR_HEX[colorStr];
  const words = colorStr.split(/\s+/);
  for (const w of words) if (COLOR_HEX[w]) return COLOR_HEX[w];
  return '#999';
}

const BRAND_EMOJI = {
  Apple:'🍎',Samsung:'📱',OnePlus:'📲',Nothing:'⚪',Motorola:'📡',
  Xiaomi:'🔵',Realme:'🟡',Vivo:'🟣',OPPO:'🟢',Poco:'⚡',
  Infinix:'🔷',Tecno:'🟠','AI Plus':'🤖',Jio:'📶',Nokia:'🔲',
};

function formatINR(price) {
  if (!price || price === 0) return 'Call for Price';
  return new Intl.NumberFormat('en-IN', {
    style:'currency', currency:'INR', maximumFractionDigits:0,
  }).format(price);
}

function specLabel(v) {
  return [v.ram, v.storage].filter(Boolean).join('/');
}

export default function ProductModal({ group, onClose }) {
  const { name, brand, variants } = group;

  // ── Unique storage options (preserving order) ──────────
  const storageOptions = useMemo(() => {
    const seen = new Set();
    return variants
      .map(v => specLabel(v))
      .filter(s => { if (!s || seen.has(s)) return false; seen.add(s); return true; });
  }, [variants]);

  const [selectedStorage, setSelectedStorage] = useState(storageOptions[0] ?? '');

  // ── Colors available for selected storage ──────────────
  const availableColors = useMemo(() => {
    const seen = new Set();
    return variants
      .filter(v => !selectedStorage || specLabel(v) === selectedStorage)
      .map(v => v.color)
      .filter(c => { if (!c || seen.has(c)) return false; seen.add(c); return true; });
  }, [variants, selectedStorage]);

  const [selectedColor, setSelectedColor] = useState(availableColors[0] ?? '');

  // Reset color when storage changes
  useEffect(() => {
    setSelectedColor(availableColors[0] ?? '');
  }, [selectedStorage]);

  // ── Active variant ─────────────────────────────────────
  const activeVariant = useMemo(() => {
    return (
      variants.find(v =>
        specLabel(v) === selectedStorage &&
        (v.color === selectedColor || (!v.color && !selectedColor))
      ) ||
      variants.find(v => specLabel(v) === selectedStorage) ||
      variants[0]
    );
  }, [variants, selectedStorage, selectedColor]);

  const imgSrc = getProductImage(activeVariant?.image);

  // ── WhatsApp ───────────────────────────────────────────
  const storeCfg = useStoreConfig();
  const specs    = specLabel(activeVariant ?? {});
  const color    = activeVariant?.color ?? '';
  const price    = formatINR(activeVariant?.price);
  const waText   = (storeCfg.productWaMessage || 'Hi Apex! I am interested in {name} {specs} {color} at "{price}". Kindly get it delivered to {name, contact, address}')
    .replace('{name}', name)
    .replace('{specs}', specs)
    .replace('{color}', color)
    .replace('{price}', price)
    .replace(/\s{2,}/g, ' ')
    .trim();
  const waLink   = waUrl(storeCfg.whatsappNumber, waText);

  // ── Keyboard + scroll lock ─────────────────────────────
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal panel */}
      <div
        className="relative bg-white w-full sm:max-w-2xl md:max-w-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[95vh] sm:max-h-[88vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 bg-apple-light hover:bg-apple-border rounded-full flex items-center justify-center text-[16px] text-apple-gray transition-colors"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Body — scrollable on small screens */}
        <div className="flex flex-col sm:flex-row overflow-y-auto">

          {/* ── Image panel ─────────────────────────────── */}
          <div className="bg-apple-light sm:w-[55%] aspect-square flex-shrink-0 flex items-center justify-center p-2 sm:p-3">
            {imgSrc ? (
              <img
                src={imgSrc}
                alt={`${name} ${color}`}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-3">
                <span className="text-8xl">{BRAND_EMOJI[brand] || '📦'}</span>
                <p className="text-[13px] text-apple-gray text-center">{name}</p>
              </div>
            )}
          </div>

          {/* ── Info panel ──────────────────────────────── */}
          <div className="flex-1 p-7 sm:p-8 overflow-y-auto flex flex-col">

            <p className="text-[11px] font-semibold tracking-[0.18em] text-apple-gray uppercase mb-1">{brand}</p>
            <h2 className="text-[26px] sm:text-[30px] font-bold text-apple-black leading-tight mb-3">{name}</h2>

            {/* Description */}
            {(() => { const desc = variants.find(v => v.description)?.description; return desc ? (
              <p className="text-[14px] text-apple-gray leading-relaxed mb-4">{desc}</p>
            ) : null; })()}

            {/* Storage / RAM selector */}
            {storageOptions.length > 0 && (
              <div className="mb-5">
                <p className="text-[11px] font-semibold tracking-[0.12em] text-apple-gray uppercase mb-2">Variant</p>
                {storageOptions.length === 1 ? (
                  <span className="inline-block text-[13px] font-medium px-4 py-1.5 rounded-pill border-2 bg-apple-black text-white border-apple-black">
                    {storageOptions[0]}
                  </span>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {storageOptions.map(opt => (
                      <button
                        key={opt}
                        onClick={() => setSelectedStorage(opt)}
                        className={`text-[13px] font-medium px-4 py-1.5 rounded-pill border-2 transition-all duration-150 ${
                          selectedStorage === opt
                            ? 'bg-apple-black text-white border-apple-black'
                            : 'bg-white text-apple-black border-apple-border hover:border-apple-black'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Colour selector */}
            {availableColors.length > 0 && (
              <div className="mb-5">
                <p className="text-[11px] font-semibold tracking-[0.12em] text-apple-gray uppercase mb-2">
                  Colour
                  {selectedColor && (
                    <span className="ml-2 text-apple-black normal-case font-medium tracking-normal">{selectedColor}</span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {availableColors.map(c => (
                    <button
                      key={c}
                      title={c}
                      onClick={() => setSelectedColor(c)}
                      className={`w-8 h-8 rounded-full border-2 transition-all duration-150 ${
                        selectedColor === c
                          ? 'border-apple-black scale-110 shadow-md'
                          : 'border-apple-border hover:border-apple-gray hover:scale-105'
                      }`}
                      style={{ backgroundColor: colorHex(c) }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Price */}
            <p className="text-[32px] font-bold text-apple-black tracking-tight mb-6">
              {formatINR(activeVariant?.price)}
            </p>

            {/* CTA */}
            {activeVariant?.inStock ? (
              <div className="flex gap-3">
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 text-[15px] font-semibold text-white bg-[#25D366] py-3.5 rounded-pill hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
                <a
                  href={`tel:${(storeCfg.phoneNumbers?.[0]?.number || storeCfg.phoneDisplay).replace(/\s/g,'')}`}
                  className="flex-1 flex items-center justify-center gap-2 text-[15px] font-semibold text-white bg-apple-black py-3.5 rounded-pill hover:opacity-80 active:scale-[0.98] transition-all"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                  </svg>
                  Call Now
                </a>
              </div>
            ) : (
              <div className="text-center text-[15px] text-gray-400 bg-gray-100 py-3.5 rounded-pill">
                Out of Stock
              </div>
            )}

            {/* COD delivery highlight */}
            <div className="flex items-center justify-center gap-2 mt-4 py-2.5 px-4 rounded-xl bg-emerald-50 border border-emerald-100">
              <span className="text-emerald-600 text-[15px]">⚡</span>
              <p className="text-[12px] font-semibold text-emerald-700">2-Hour Delivery · All Indore</p>
            </div>

            <p className="text-center text-[11px] text-apple-gray mt-3">
              Store open <strong className="text-apple-black">{storeCfg.storeHoursShort}</strong> daily · {storeCfg.addressLine1}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
