import { getProductImage } from '../utils/productImages';
import { useDisplaySettings } from '../hooks/useDisplaySettings';

const COLOR_HEX = {
  'Black':'#1C1C1E','White':'#F5F5F0','Blue':'#4A90D9','Pink':'#FFB6C1',
  'Green':'#4CAF50','Silver':'#B8B8B8','Gold':'#D4AF37','Purple':'#9C27B0',
  'Red':'#E53935','Orange':'#FF9800','Grey':'#9E9E9E','Gray':'#9E9E9E',
  'Violet':'#7E57C2','Mint':'#80CBC4','Indigo':'#3949AB','Blush':'#FFAB91',
  'Desert':'#BCAAA4','Lavender':'#CE93D8','Marble':'#E8E8E0','Ice':'#B3E5FC',
  'Fog':'#CFD8DC','Teal':'#00897B','Fresh':'#A5D6A7','Active':'#78909C',
  'Yellow':'#FFEB3B',
};

function colorHex(c) {
  if (!c) return '#999';
  // Exact match first, then check each word (handles "Cosmic Orange" → Orange)
  if (COLOR_HEX[c]) return COLOR_HEX[c];
  const words = c.split(/\s+/);
  for (const w of words) if (COLOR_HEX[w]) return COLOR_HEX[w];
  return '#999';
}

const BRAND_EMOJI = {
  Apple:'🍎',Samsung:'📱',OnePlus:'📲',Nothing:'⚪',Motorola:'📡',
  Xiaomi:'🔵',Realme:'🟡',Vivo:'🟣',OPPO:'🟢',Poco:'⚡',
  Infinix:'🔷',Tecno:'🟠','AI Plus':'🤖',Jio:'📶',Nokia:'🔲',
};

const BADGE_STYLE = {
  'New':         'bg-blue-600 text-white',
  '5G':          'bg-emerald-600 text-white',
  'Best Seller': 'bg-amber-500 text-white',
  '4G':          'bg-slate-500 text-white',
  'WiFi':        'bg-sky-500 text-white',
};

function formatINR(price) {
  if (!price || price === 0) return 'Call for Price';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(price);
}

export default function ProductCard({ group, onClick }) {
  const { name, brand, badge, variants } = group;
  const { showColours, showStorage, showRAM, showVariantCount } = useDisplaySettings();

  const firstWithImg = variants.find(v => v.image);
  const imgSrc       = getProductImage(firstWithImg?.image);

  const prices    = variants.map(v => v.price).filter(Boolean);
  const minPrice  = prices.length ? Math.min(...prices) : 0;
  const showFrom  = prices.length > 1 || minPrice === 0;
  const cheapest  = variants.find(v => v.price === minPrice);
  const cardMrp   = cheapest?.mrp || cheapest?.originalPrice || 0;
  const pctOff    = cardMrp > minPrice && minPrice > 0 ? Math.round((cardMrp - minPrice) / cardMrp * 100) : 0;

  const colors   = [...new Set(variants.map(v => v.color).filter(Boolean))];
  const storages = [...new Set(variants.map(v => v.storage).filter(Boolean))];
  const rams     = [...new Set(variants.map(v => v.ram).filter(Boolean))];

  const activeBadge = badge || variants.find(v => v.badge)?.badge || '';
  const badgeStyle  = BADGE_STYLE[activeBadge] || 'bg-apple-black text-white';
  const anyInStock  = variants.some(v => v.inStock);

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 flex flex-col cursor-pointer"
      style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.16)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'}
    >
      {/* Image area */}
      <div className="relative bg-apple-light aspect-square flex items-center justify-center overflow-hidden">
        {activeBadge && (
          <span className={`absolute top-3 left-3 z-10 text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-full ${badgeStyle}`}>
            {activeBadge}
          </span>
        )}
        {!anyInStock && (
          <span className="absolute top-3 right-3 z-10 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-300 text-gray-700">
            Out of Stock
          </span>
        )}
        {showVariantCount && variants.length > 1 && (
          <span className="absolute bottom-3 right-3 z-10 text-[10px] font-semibold text-apple-gray bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full">
            {variants.length} variants
          </span>
        )}
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={name}
            className="w-full h-full object-contain p-8 transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-8">
            <div className="text-6xl mb-3 transition-transform duration-300 group-hover:scale-105">
              {BRAND_EMOJI[brand] || '📦'}
            </div>
            <p className="text-xs text-apple-gray font-medium leading-snug px-2 text-center">{name}</p>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1">
        <p className="text-[10px] font-semibold tracking-[0.12em] text-apple-gray uppercase mb-0.5">{brand}</p>
        <h3 className="text-[15px] font-semibold text-apple-black leading-snug mb-2">{name}</h3>

        {/* Storage chips */}
        {showStorage && storages.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {storages.slice(0, 5).map(s => (
              <span key={s} className="text-[10px] font-medium text-apple-gray bg-apple-light px-2 py-0.5 rounded-full border border-apple-border">
                {s}
              </span>
            ))}
            {storages.length > 5 && (
              <span className="text-[10px] text-apple-gray self-center">+{storages.length - 5}</span>
            )}
          </div>
        )}

        {/* RAM chips */}
        {showRAM && rams.length > 0 && storages.length === 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {rams.slice(0, 4).map(r => (
              <span key={r} className="text-[10px] font-medium text-apple-gray bg-apple-light px-2 py-0.5 rounded-full border border-apple-border">
                {r}
              </span>
            ))}
          </div>
        )}

        {/* Colour swatches */}
        {showColours && colors.length > 0 && (
          <div className="flex items-center gap-1.5 mb-3">
            {colors.slice(0, 8).map(c => (
              <span
                key={c}
                title={c}
                className="w-3.5 h-3.5 rounded-full border border-black/10 flex-shrink-0"
                style={{ backgroundColor: colorHex(c) }}
              />
            ))}
            {colors.length > 8 && (
              <span className="text-[10px] text-apple-gray ml-0.5">+{colors.length - 8}</span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="mt-auto mb-2">
          <p className="text-[16px] font-bold text-apple-black">
            {showFrom && minPrice > 0 ? 'From ' : ''}{formatINR(minPrice)}
          </p>
          {pctOff > 0 && (
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-apple-gray line-through">{formatINR(cardMrp)}</span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">{pctOff}% off</span>
            </div>
          )}
        </div>

        {/* COD delivery badge */}
        <p className="text-[11px] text-emerald-600 font-medium mb-3">
          ⚡ 2-Hour Delivery · All Indore
        </p>

        {/* CTA */}
        <button className="block w-full text-center text-[13px] font-medium text-apple-black bg-apple-light py-2.5 rounded-pill group-hover:bg-apple-black group-hover:text-white transition-colors duration-200">
          Order Now →
        </button>
      </div>
    </div>
  );
}
