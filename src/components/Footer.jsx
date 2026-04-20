import { Link } from 'react-router-dom';
import { useStoreConfig, waUrl } from '../hooks/useStoreConfig';

const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

export default function Footer() {
  const cfg = useStoreConfig();

  return (
    <footer className="bg-apple-light border-t border-apple-border">
      <div className="max-w-[1200px] mx-auto px-6 py-12">

        {/* 4-column grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

          {/* About Apex */}
          <div>
            <p className="text-[12px] font-semibold text-apple-black mb-4">About Apex</p>
            <ul className="space-y-2.5">
              {[
                ['/about',   'Our Story'],
                ['/about',   'Since 1996'],
                ['/about',   'Our Values'],
                ['/contact', 'Visit the Store'],
              ].map(([path, label]) => (
                <li key={label}>
                  <Link to={path} onClick={scrollTop} className="text-[12px] text-apple-gray hover:text-apple-black transition-colors duration-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shop */}
          <div>
            <p className="text-[12px] font-semibold text-apple-black mb-4">Shop</p>
            <ul className="space-y-2.5">
              {[
                ['/products?category=Mobiles',     'Mobiles'],
                ['/products?category=Tablets',     'Tablets'],
                ['/products?category=Laptops',     'Laptops'],
                ['/products?category=Accessories', 'Accessories'],
                ['/products',                       'All Products'],
              ].map(([path, label]) => (
                <li key={label}>
                  <Link to={path} onClick={scrollTop} className="text-[12px] text-apple-gray hover:text-apple-black transition-colors duration-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Brands */}
          <div>
            <p className="text-[12px] font-semibold text-apple-black mb-4">Brands</p>
            <ul className="flex flex-wrap gap-x-4 gap-y-2.5">
              {[
                'Apple','Samsung','OnePlus','Nothing','Motorola',
                'Xiaomi','Realme','Vivo','OPPO','Poco',
                'Infinix','Tecno','Nokia','Sony','Lenovo',
                'HP','boAt','AI Plus','Jio',
              ].map(brand => (
                <li key={brand}>
                  <Link
                    to={`/products?brand=${encodeURIComponent(brand)}`}
                    onClick={scrollTop}
                    className="text-[12px] text-apple-gray hover:text-apple-black transition-colors duration-200"
                  >
                    {brand}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[12px] font-semibold text-apple-black mb-4">Contact</p>
            <ul className="space-y-2.5 text-[12px] text-apple-gray">
              <li>{cfg.addressLine1}</li>
              <li>{cfg.addressLine2}</li>
              {(cfg.phoneNumbers?.length ? cfg.phoneNumbers : [{ label: '', number: cfg.phoneDisplay }]).map((ph, i) => (
                <li key={i} className={i === 0 ? 'pt-1' : ''}>
                  {ph.label && <span className="text-apple-gray">{ph.label}: </span>}
                  <a href={`tel:${ph.number.replace(/\s/g, '')}`} className="hover:text-apple-black transition-colors duration-200">
                    {ph.number}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={waUrl(cfg.whatsappNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-apple-black transition-colors duration-200"
                >
                  WhatsApp
                </a>
              </li>
              <li className="pt-1">{cfg.storeHoursShort}</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-apple-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-apple-gray">
            Copyright © {new Date().getFullYear()} Apex The Mobile Shoppe. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-[12px] text-apple-gray">
            <Link to="/about" onClick={scrollTop} className="hover:text-apple-black transition-colors">Privacy</Link>
            <span>|</span>
            <Link to="/about" onClick={scrollTop} className="hover:text-apple-black transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
