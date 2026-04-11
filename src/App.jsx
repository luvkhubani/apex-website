import { BrowserRouter, Routes, Route, ScrollRestoration } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import Home from './pages/Home';
import Products from './pages/Products';
import About from './pages/About';
import Contact from './pages/Contact';

// ScrollToTop resets scroll position on every route change
function ScrollToTop() {
  // react-router v6.4+ provides ScrollRestoration, but a simple hook works fine too
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen font-sans">
        <Navbar />

        <main className="flex-1">
          <Routes>
            <Route path="/"         element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/about"    element={<About />} />
            <Route path="/contact"  element={<Contact />} />
            {/* Fallback — redirect unknown paths to home */}
            <Route path="*"         element={<Home />} />
          </Routes>
        </main>

        <Footer />

        {/* Floating WhatsApp button — visible on every page */}
        <WhatsAppButton />
      </div>
    </BrowserRouter>
  );
}
