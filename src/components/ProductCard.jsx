/**
 * Apple-style category card — used in the Products grid.
 * Square aspect-ratio placeholder, brand label, product name, price, WhatsApp CTA.
 */
const brandEmoji = {
  Apple: '🍎', Samsung: '📱', OnePlus: '📲', Sony: '🎧',
  Xiaomi: '📡', Dell: '💻', HP: '🖥️', Lenovo: '⌨️',
  Anker: '🔋', boAt: '🎵',
};

export default function ProductCard({ product }) {
  const { name, brand, price, whatsappMsg } = product;
  const waUrl = `https://wa.me/919343777686?text=${whatsappMsg || encodeURIComponent(`Hi Apex! I am interested in ${name}`)}`;
  const emoji = brandEmoji[brand] || '📦';

  return (
    <div
      className="group bg-white rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.14)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'}
    >
      {/* Placeholder image */}
      <div className="bg-apple-light aspect-square flex flex-col items-center justify-center text-center p-8">
        <div className="text-6xl mb-3 transition-transform duration-300 group-hover:scale-105">{emoji}</div>
        <p className="text-xs text-apple-gray font-medium leading-snug px-2">{name}</p>
      </div>

      {/* Content */}
      <div className="p-6">
        <p className="text-[11px] font-semibold tracking-[0.12em] text-apple-gray uppercase mb-1">{brand}</p>
        <h3 className="text-[18px] font-semibold text-apple-black leading-snug mb-1">{name}</h3>
        <p className="text-[17px] font-semibold text-apple-black mb-5">{price}</p>
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-[14px] font-medium text-white bg-apple-black py-2.5 rounded-pill hover:scale-[1.02] transition-transform duration-200"
        >
          Enquire on WhatsApp
        </a>
      </div>
    </div>
  );
}
