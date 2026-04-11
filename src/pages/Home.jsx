import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import products from '../data/products';

// ── 1. Hero Section ───────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden bg-white">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#f9f5ec_0%,_#ffffff_70%)] pointer-events-none" />

      {/* Gold decorative lines */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-60" />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Tagline pill */}
        <span className="inline-block px-4 py-1.5 mb-6 rounded-full border border-gold/40 bg-gold/5 text-gold text-xs font-semibold tracking-widest uppercase">
          Trusted Since 1996 · Jail Road, Indore
        </span>

        {/* Main headline */}
        <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl text-black leading-tight tracking-tight mb-6">
          Indore&apos;s Most Trusted<br />
          <span className="relative inline-block">
            Electronics Store
            {/* Gold underline */}
            <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 400 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 9C60 4 130 2 200 2C270 2 340 4 398 9" stroke="#C9A84C" strokeWidth="4" strokeLinecap="round"/>
            </svg>
          </span>
          <br />Since 1996
        </h1>

        <p className="text-gray-500 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Premium mobiles, tablets, laptops, and accessories — backed by 30 years of expert advice and honest service.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-white font-semibold text-base rounded-full hover:bg-gold-dark active:scale-95 transition-all duration-200 shadow-lg shadow-gold/30"
          >
            Explore Products
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <a
            href="https://wa.me/919826000000?text=Hi+Apex!+I+would+like+to+know+more."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 border-2 border-black text-black font-semibold text-base rounded-full hover:bg-black hover:text-white active:scale-95 transition-all duration-200"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            WhatsApp Us
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
}

// ── 2. Categories Section ─────────────────────────────────────
const CATEGORIES = [
  { emoji: '📱', label: 'Mobiles',     desc: 'Latest smartphones from all top brands' },
  { emoji: '📟', label: 'Tablets',     desc: 'iPads, Galaxy Tabs & more' },
  { emoji: '💻', label: 'Laptops',     desc: 'MacBooks, Ultrabooks & gaming laptops' },
  { emoji: '🎧', label: 'Accessories', desc: 'Earbuds, chargers, cases & cables' },
];

function Categories() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-14">
          <p className="text-gold text-xs font-semibold tracking-widest uppercase mb-3">Browse by Category</p>
          <h2 className="font-display font-bold text-4xl sm:text-5xl text-black">What We Carry</h2>
        </div>

        {/* Category cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map(({ emoji, label, desc }) => (
            <Link
              key={label}
              to={`/products?category=${label}`}
              className="group flex flex-col items-center text-center p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-gold/40 transition-all duration-300"
            >
              <span className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-200">{emoji}</span>
              <h3 className="font-display font-semibold text-lg text-black mb-2">{label}</h3>
              <p className="text-gray-500 text-sm leading-snug">{desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── 3. Featured Products (first 6 from products.js) ───────────
function FeaturedProducts() {
  const featured = products.slice(0, 6);

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <p className="text-gold text-xs font-semibold tracking-widest uppercase mb-3">Hand-Picked</p>
            <h2 className="font-display font-bold text-4xl sm:text-5xl text-black">Featured Products</h2>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-black border-b-2 border-gold pb-0.5 hover:text-gold transition-colors duration-200 self-start sm:self-auto"
          >
            View all products
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── 4. Trust Bar ──────────────────────────────────────────────
const STATS = [
  { value: '30+',        label: 'Years in Business' },
  { value: '1 Lakh+',   label: 'Happy Customers' },
  { value: 'Expert',    label: 'Advice Always Free' },
  { value: 'Best',      label: 'Prices Guaranteed' },
];

function TrustBar() {
  return (
    <section className="py-20 bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 text-center">
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <p className="font-display font-bold text-4xl sm:text-5xl text-gold mb-2">{value}</p>
              <p className="text-gray-400 text-sm tracking-wide">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── 5. Testimonials ───────────────────────────────────────────
const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    location: 'Indore',
    text: "I've been buying from Apex since 2010. The staff knows their products inside out and never pushes unnecessary upsells. Got the perfect phone for my budget!",
    rating: 5,
  },
  {
    name: 'Rahul Malhotra',
    location: 'Indore',
    text: "Bought a MacBook Pro here last month. The price was actually better than online, and they helped me set it up too. Will always come back to Apex.",
    rating: 5,
  },
  {
    name: 'Anjali Verma',
    location: 'Indore',
    text: "Apex has been my family's go-to electronics store for two decades. Honest advice, genuine products, and after-sales support you simply can't find elsewhere.",
    rating: 5,
  },
];

function StarRating({ count }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} className="w-4 h-4 text-gold fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function Testimonials() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-gold text-xs font-semibold tracking-widest uppercase mb-3">What Customers Say</p>
          <h2 className="font-display font-bold text-4xl sm:text-5xl text-black">Trusted by Generations</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map(({ name, location, text, rating }) => (
            <div
              key={name}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              {/* Opening quote mark */}
              <svg className="w-8 h-8 text-gold/30 mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">{text}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-black text-sm">{name}</p>
                  <p className="text-gray-400 text-xs">{location}</p>
                </div>
                <StarRating count={rating} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── 6. Visit Us / CTA Section ─────────────────────────────────
function VisitUs() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-gold text-xs font-semibold tracking-widest uppercase mb-3">Find Us</p>
          <h2 className="font-display font-bold text-4xl sm:text-5xl text-black mb-6">Visit Our Store</h2>
          <p className="text-gray-500 text-lg mb-8">
            Come in, look around, and let our team help you find the perfect device. No pressure — just honest, expert guidance.
          </p>

          {/* Address card */}
          <div className="inline-flex flex-col items-center gap-4 p-8 rounded-2xl border-2 border-gold/30 bg-gold/5 mb-8">
            <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div className="text-center">
              <p className="font-display font-semibold text-xl text-black">Jail Road, Indore</p>
              <p className="text-gray-500 text-sm mt-1">Madhya Pradesh — 452 001</p>
              <p className="text-gray-500 text-sm mt-0.5">Open Mon–Sat · 10 AM to 8 PM</p>
            </div>
          </div>

          {/* WhatsApp CTA */}
          <div>
            <a
              href="https://wa.me/919826000000?text=Hi+Apex!+I+would+like+to+know+more."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#25D366] text-white font-semibold text-base rounded-full hover:opacity-90 active:scale-95 transition-all duration-200 shadow-lg shadow-green-200"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Chat with Us on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Main Home export ──────────────────────────────────────────
export default function Home() {
  return (
    <>
      <Hero />
      <Categories />
      <FeaturedProducts />
      <TrustBar />
      <Testimonials />
      <VisitUs />
    </>
  );
}
