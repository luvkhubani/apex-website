import { BrowserRouter, Routes, Route, ScrollRestoration } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import Home from './pages/Home';
import Products from './pages/Products';
import About from './pages/About';
import Contact from './pages/Contact';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

function ScrollToTop() {
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin routes - no Navbar/Footer */}
        <Route path="/admin-apex-secret" element={<AdminLogin />} />
        <Route path="/admin-apex-secret/dashboard" element={<AdminDashboard />} />

        {/* Public routes - with Navbar/Footer */}
        <Route path="/*" element={
          <div className="flex flex-col min-h-screen font-sans">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/"         element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/about"    element={<About />} />
                <Route path="/contact"  element={<Contact />} />
                <Route path="*"         element={<Home />} />
              </Routes>
            </main>
            <Footer />
            <WhatsAppButton />
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}
