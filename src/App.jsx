import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import Home from './pages/Home';
import Products from './pages/Products';
import About from './pages/About';
import Contact from './pages/Contact';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

// Silently push admin localStorage data to GitHub once per browser session.
// Runs on first page load only — avoids a GitHub commit (and Vercel webhook) on
// every navigation within the same tab.
function useAdminAutoSync() {
  useEffect(() => {
    if (!localStorage.getItem('apex_admin_auth')) return;
    if (sessionStorage.getItem('apex_synced')) return;
    sessionStorage.setItem('apex_synced', '1');
    try {
      const heroConfig   = JSON.parse(localStorage.getItem('apex_hero_config')   || '[]');
      const bannerConfig = JSON.parse(localStorage.getItem('apex_banner_config') || 'null') || {};
      const products     = JSON.parse(localStorage.getItem('apex_products_override') || 'null');
      const storeConfig  = JSON.parse(localStorage.getItem('apex_store_config')  || 'null');

      fetch('/api/sync-hero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ heroConfig, bannerConfig }),
      }).catch(() => {});

      if (Array.isArray(products) && products.length > 0) {
        fetch('/api/sync-products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ products }),
        }).catch(() => {});
      }

      if (storeConfig && typeof storeConfig === 'object') {
        // Strip blob: URLs and storePhotos before syncing.
        // storePhotos are managed independently via /api/store-photos — the server-side
        // sync-store-config API will preserve whatever photos are already in GitHub.
        const cleanStore = {
          ...storeConfig,
          storePhotos: [],  // Never overwrite repo photos from localStorage
          categories:  (storeConfig.categories  || []).map(cat => ({
            ...cat,
            images: (cat.images || []).filter(img => img && !img.startsWith('blob:')),
          })),
          logoImage: (storeConfig.logoImage || '').startsWith('blob:') ? '' : (storeConfig.logoImage || ''),
        };
        if (storeConfig._savedAt) {
          fetch('/api/sync-store-config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ storeConfig: cleanStore }),
          }).catch(() => {});
        }
      }
    } catch (_) {}
  }, []);
}

export default function App() {
  useAdminAutoSync();
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/products" element={<PublicLayout><Products /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
        <Route path="*" element={<PublicLayout><Home /></PublicLayout>} />
      </Routes>
    </BrowserRouter>
  );
}

function PublicLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen font-sans">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
