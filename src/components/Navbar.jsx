import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useStoreConfig, waUrl, getStoreImage } from '../hooks/useStoreConfig';

const navLinks = [
  { to: '/',         label: 'Home',     end: true },
  { to: '/products', label: 'Products' },
  { to: '/about',    label: 'About' },
  { to: '/contact',  label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const storeCfg = useStoreConfig();
  const logoSrc  = getStoreImage(storeCfg.logoImage);

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-apple-border">

      <nav className="max-w-[1200px] mx-auto px-6 h-12 flex items-center justify-between gap-8">

        {/* Logo + tagline */}
        <Link
          to="/"
          onClick={() => setOpen(false)}
          className="shrink-0 flex items-center gap-3 hover:opacity-70 transition-opacity duration-200"
        >
          {logoSrc
            ? <img src={logoSrc} alt={storeCfg.logoText || 'Apex'} className="h-8 w-auto object-contain" onError={e => { e.target.style.display = 'none'; }} />
            : <span className="text-[20px] font-bold text-apple-black tracking-tight">{storeCfg.logoText || 'APEX'}</span>
          }
          <span
            className="text-[10px] font-semibold tracking-[0.1em] uppercase leading-tight border-l border-apple-border pl-3"
            style={{ color: '#6e6e73' }}
          >
            Trusted<br />Since 1996
          </span>
        </Link>

        {/* Desktop center nav */}
        <ul className="hidden md:flex items-center gap-8 flex-1 justify-center">
          {navLinks.map(({ to, label, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `text-[14px] transition-opacity duration-200 ${
                    isActive ? 'text-apple-black font-medium' : 'text-apple-black opacity-80 hover:opacity-100'
                  }`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Desktop right CTA */}
        <a
          href={waUrl(storeCfg.whatsappNumber)}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center text-[14px] font-medium text-white bg-apple-black px-4 py-1.5 rounded-pill hover:scale-[1.02] transition-transform duration-200 shrink-0"
        >
          WhatsApp
        </a>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-1 text-apple-black focus:outline-none"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <div className="space-y-[5px] w-[22px]">
            <span className={`block h-px bg-current transition-all duration-300 origin-center ${open ? 'rotate-45 translate-y-[6px]' : ''}`} />
            <span className={`block h-px bg-current transition-all duration-300 ${open ? 'opacity-0 scale-x-0' : ''}`} />
            <span className={`block h-px bg-current transition-all duration-300 origin-center ${open ? '-rotate-45 -translate-y-[6px]' : ''}`} />
          </div>
        </button>
      </nav>

      {/* Mobile menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 bg-white border-b border-apple-border ${open ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="max-w-[1200px] mx-auto px-6 py-4 space-y-3">
          {navLinks.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block text-[15px] py-1 transition-opacity ${
                  isActive ? 'text-apple-black font-semibold' : 'text-apple-black opacity-80'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          <a
            href={waUrl(storeCfg.whatsappNumber)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="block text-center text-[14px] font-medium text-white bg-apple-black py-2.5 rounded-pill mt-2 hover:scale-[1.02] transition-transform"
          >
            WhatsApp Us
          </a>
        </div>
      </div>
    </header>
  );
}
