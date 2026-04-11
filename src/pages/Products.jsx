import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import products from '../data/products';

const FILTERS = ['All', 'Mobiles', 'Tablets', 'Laptops', 'Accessories'];

export default function Products() {
  const [searchParams] = useSearchParams();
  const [activeFilter, setActiveFilter] = useState('All');

  // Sync filter with URL query param (?category=Mobiles)
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat && FILTERS.includes(cat)) {
      setActiveFilter(cat);
    }
  }, [searchParams]);

  // Filter the product list
  const filtered =
    activeFilter === 'All'
      ? products
      : products.filter((p) => p.category === activeFilter);

  return (
    <main className="min-h-screen bg-white">
      {/* Page header */}
      <section className="bg-gray-50 border-b border-gray-100 py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gold text-xs font-semibold tracking-widest uppercase mb-3">Our Catalog</p>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-black mb-4">Products</h1>
          <p className="text-gray-500 text-base max-w-xl mx-auto">
            Genuine products, expert advice, and prices that won&apos;t be beaten. Enquire directly via WhatsApp for availability and offers.
          </p>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-3 mb-10">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`
                  px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200
                  ${activeFilter === filter
                    ? 'bg-gold text-white shadow-md shadow-gold/20'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-black'
                  }
                `}
              >
                {filter}
                {/* Count badge */}
                <span className={`ml-2 text-xs ${activeFilter === filter ? 'opacity-80' : 'opacity-50'}`}>
                  ({filter === 'All' ? products.length : products.filter((p) => p.category === filter).length})
                </span>
              </button>
            ))}
          </div>

          {/* Result count */}
          <p className="text-gray-400 text-sm mb-8">
            Showing <span className="font-semibold text-black">{filtered.length}</span>{' '}
            {filtered.length === 1 ? 'product' : 'products'}
            {activeFilter !== 'All' && (
              <> in <span className="font-semibold text-black">{activeFilter}</span></>
            )}
          </p>

          {/* Product grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-24 text-center text-gray-400">
              <p className="text-5xl mb-4">🔍</p>
              <p className="text-lg font-medium">No products in this category yet.</p>
              <p className="text-sm mt-2">Check back soon or WhatsApp us for availability.</p>
            </div>
          )}

          {/* Bottom WhatsApp CTA */}
          <div className="mt-20 p-10 rounded-2xl bg-gray-50 border border-gray-100 text-center">
            <h3 className="font-display font-bold text-2xl text-black mb-2">
              Can&apos;t find what you&apos;re looking for?
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              WhatsApp us and our team will help you source any device or accessory.
            </p>
            <a
              href="https://wa.me/919826000000?text=Hi+Apex!+I+am+looking+for+a+specific+product."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3 bg-gold text-white font-semibold rounded-full hover:bg-gold-dark transition-colors duration-200"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Ask on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
