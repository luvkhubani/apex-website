import { Link } from 'react-router-dom';

export default function Footer() {
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
                ['/about', 'Our Story'],
                ['/about', 'Since 1996'],
                ['/about', 'Our Values'],
                ['/contact', 'Visit the Store'],
              ].map(([path, label]) => (
                <li key={label}>
                  <Link to={path} className="text-[12px] text-apple-gray hover:text-apple-black transition-colors duration-200">
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
                  <Link to={path} className="text-[12px] text-apple-gray hover:text-apple-black transition-colors duration-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Brands */}
          <div>
            <p className="text-[12px] font-semibold text-apple-black mb-4">Brands</p>
            <ul className="space-y-2.5">
              {['Apple', 'Samsung', 'OnePlus', 'Sony', 'Xiaomi', 'Lenovo', 'HP', 'boAt'].map(brand => (
                <li key={brand}>
                  <span className="text-[12px] text-apple-gray">{brand}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[12px] font-semibold text-apple-black mb-4">Contact</p>
            <ul className="space-y-2.5 text-[12px] text-apple-gray">
              <li>Jail Road, Indore</li>
              <li>Madhya Pradesh, India</li>
              <li className="pt-1">
                <a href="tel:+919343777686" className="hover:text-apple-black transition-colors duration-200">
                  +91 93437 77686
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/919343777686"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-apple-black transition-colors duration-200"
                >
                  WhatsApp
                </a>
              </li>
              <li className="pt-1">Mon–Sun: 10AM – 10PM</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-apple-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-apple-gray">
            Copyright © 2025 Apex The Mobile Shoppe. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-[12px] text-apple-gray">
            <Link to="/about" className="hover:text-apple-black transition-colors">Privacy</Link>
            <span>|</span>
            <Link to="/about" className="hover:text-apple-black transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
