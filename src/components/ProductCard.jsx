const brandEmoji = {
  Apple: '🍎', Samsung: '📱', OnePlus: '📲', Nothing: '⚪',
  Motorola: '📡', Xiaomi: '🔵', Realme: '🟡', Vivo: '🟣',
  OPPO: '🟢', Poco: '⚡', Infinix: '🔷', Tecno: '🟠',
  'AI Plus': '🤖', Jio: '📶', Nokia: '🔲',
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

export default function ProductCard({ product }) {
  const { name, brand, ram, storage, color, price, badge, inStock } = product;

  const specs = [ram, storage].filter(Boolean).join('/');
  const waText = `Hi Apex! I am interested in ${name}${specs ? ' ' + specs : ''}${color ? ' ' + color : ''}. Please share availability and best price.`;
  const waUrl  = `https://wa.me/919343777686?text=${encodeURIComponent(waText)}`;
  const emoji  = brandEmoji[brand] || '📦';
  const badgeStyle = badge ? (BADGE_STYLE[badge] || 'bg-apple-black text-white') : null;

  return (
    <div
      className="group bg-white rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 flex flex-col"
      style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.14)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'}
    >
      {/* Image area */}
      <div className="relative bg-apple-light aspect-square flex flex-col items-center justify-center text-center p-8">
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {badge && badgeStyle && (
            <span className={`text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-full ${badgeStyle}`}>
              {badge}
            </span>
          )}
          {!inStock && (
            <span className="text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-full bg-gray-300 text-gray-700">
              Out of Stock
            </span>
          )}
        </div>

        <div className="text-6xl mb-3 transition-transform duration-300 group-hover:scale-105">{emoji}</div>
        <p className="text-xs text-apple-gray font-medium leading-snug px-2">{name}</p>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <p className="text-[10px] font-semibold tracking-[0.12em] text-apple-gray uppercase mb-0.5">{brand}</p>
        <h3 className="text-[15px] font-semibold text-apple-black leading-snug mb-1">{name}</h3>

        {/* Specs row */}
        {(specs || color) && (
          <p className="text-[12px] text-apple-gray mb-1">
            {specs}{specs && color ? ' · ' : ''}{color}
          </p>
        )}

        <p className="text-[17px] font-bold text-apple-black mt-auto mb-4">{formatINR(price)}</p>

        {inStock ? (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-[13px] font-medium text-white bg-[#25D366] py-2.5 rounded-pill hover:opacity-90 transition-opacity duration-200"
          >
            Enquire on WhatsApp
          </a>
        ) : (
          <span className="block text-center text-[13px] font-medium text-gray-400 bg-gray-100 py-2.5 rounded-pill cursor-not-allowed">
            Out of Stock
          </span>
        )}
      </div>
    </div>
  );
}
