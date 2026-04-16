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

// Silently push admin localStorage data to GitHub whenever the admin visits
// any page — so other browsers stay in sync without admin having to open the panel.
function useAdminAutoSync() {
  useEffect(() => {
    if (!localStorage.getItem('apex_admin_auth')) return;
    try {
      const heroConfig   = JSON.parse(localStorage.getItem('apex_hero_config')   || '[]');
      const bannerConfig = JSON.parse(localStorage.getItem('apex_banner_config') || 'null') || {};
      const products     = JSON.parse(localStorage.getItem('apex_products_override') || 'null');

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
