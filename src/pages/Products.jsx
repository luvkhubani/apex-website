import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import FadeUp from '../components/FadeUp';
import products from '../data/products';

const FILTERS = [
  { id: 'All',         label: 'All' },
  { id: 'Mobiles',     label: 'Mobiles' },
  { id: 'Tablets',     label: 'Tablets' },
  { id: 'Laptops',     label: 'Laptops' },
  { id: 'Accessories', label: 'Accessories' },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [active, setActive] = useState('All');

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat && FILTERS.find(f => f.id === cat)) {
      setActive(cat);
    } else {
      setActive('All');
    }
  }, [searchParams]);

  const filtered = active === 'All' ? products : products.filter(p => p.category === active);

  function handleFilter(id) {
    setActive(id);
    id === 'All' ? setSearchParams({}) : setSearchParams({ category: id });
  }

  return (
    <main className="min-h-screen bg-white">

      {/* Page header */}
      <section className="bg-white pt-14 pb-8 px-6 border-b border-apple-border">
        <div className="max-w-[1200px] mx-auto">
          <FadeUp>
            <p className="text-[12px] font-semibold tracking-[0.15em] text-apple-gray uppercase mb-3">Our Collection</p>
            <h1 className="font-sans font-bold text-[40px] md:text-[56px] text-apple-black leading-[1.07] tracking-[-0.02em] mb-3">
              Products.
            </h1>
            <p className="text-[17px] text-apple-gray">
              {filtered.length} {filtered.length === 1 ? 'product' : 'products'} available.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* Sticky filter bar */}
      <div className="sticky top-12 z-40 bg-white/90 backdrop-blur-xl border-b border-apple-border">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-3">
            {FILTERS.map(({ id, label }) => {
              const count = id === 'All' ? products.length : products.filter(p => p.category === id).length;
              return (
                <button
                  key={id}
                  onClick={() => handleFilter(id)}
                  className={`flex-shrink-0 text-[14px] font-medium px-5 py-1.5 rounded-pill transition-all duration-200 ${
                    active === id
                      ? 'bg-apple-black text-white'
                      : 'bg-apple-light text-apple-black hover:bg-apple-border'
                  }`}
                >
                  {label}
                  <span className={`ml-1.5 text-[12px] ${active === id ? 'opacity-60' : 'opacity-50'}`}>
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid */}
      <section className="py-14 px-6">
        <div className="max-w-[1200px] mx-auto">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((product, i) => (
                <FadeUp key={product.id} delay={i * 40}>
                  <ProductCard product={product} />
                </FadeUp>
              ))}
            </div>
          ) : (
            <div className="text-center py-28">
              <p className="text-7xl mb-6">📦</p>
              <p className="font-sans font-bold text-[28px] text-apple-black mb-3">Nothing here yet.</p>
              <p className="text-[17px] text-apple-gray mb-8">Try another category or ask us directly.</p>
              <button
                onClick={() => handleFilter('All')}
                className="text-[15px] font-medium text-white bg-apple-black px-6 py-3 rounded-pill hover:scale-[1.02] transition-transform"
              >
                View All Products
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-apple-light border-t border-apple-border py-20 px-6 text-center">
        <FadeUp>
          <p className="text-[12px] font-semibold tracking-[0.15em] text-apple-gray uppercase mb-4">Custom Order</p>
          <h2 className="font-sans font-bold text-[32px] md:text-[40px] text-apple-black tracking-[-0.02em] mb-4">
            Can&apos;t find what you need?
          </h2>
          <p className="text-[17px] text-apple-gray mb-8 max-w-[440px] mx-auto">
            We stock thousands of products. Just ask — our team will source it for you.
          </p>
          <a
            href="https://wa.me/919343777686?text=Hi%20Apex!%20I%20am%20looking%20for%20a%20specific%20product."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-[15px] font-medium text-white bg-apple-black px-7 py-3 rounded-pill hover:scale-[1.02] transition-transform"
          >
            Ask on WhatsApp
          </a>
        </FadeUp>
      </section>
    </main>
  );
}
