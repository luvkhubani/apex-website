/**
 * ============================================================
 *  APEX — The Mobile Shoppe · Product Catalog
 * ============================================================
 *
 *  HOW TO ADD A NEW PRODUCT:
 *  --------------------------
 *  1. Copy the template below and paste it at the end of the array (before the final "]")
 *  2. Increment the `id` by 1 (last id + 1)
 *  3. Fill in the fields — see field guide below
 *  4. Save the file — the Products page updates automatically
 *
 *  FIELD GUIDE:
 *  ------------
 *  id          : Unique number. Keep incrementing (13, 14, 15 …)
 *  name        : Full product name shown on the card  e.g. "iPhone 15 Pro"
 *  brand       : Brand name shown as a tag            e.g. "Apple"
 *  category    : Must be one of:
 *                  "Mobiles" | "Tablets" | "Laptops" | "Accessories"
 *  price       : Formatted price string               e.g. "₹1,29,900"
 *  image       : URL to product image. Use a direct image link or leave as
 *                the placeholder below. Free placeholder images:
 *                  https://placehold.co/400x300?text=ProductName
 *  whatsappMsg : URL-encoded message sent via WhatsApp. Keep the format:
 *                  "Hi+Apex!+I+am+interested+in+[Product+Name]"
 *
 *  TEMPLATE (copy from here):
 *  --------------------------
 *  {
 *    id: 13,
 *    name: "Your Product Name",
 *    brand: "Brand Name",
 *    category: "Mobiles",          // Mobiles | Tablets | Laptops | Accessories
 *    price: "₹0,000",
 *    image: "https://placehold.co/400x300?text=Product+Name",
 *    whatsappMsg: "Hi+Apex!+I+am+interested+in+Your+Product+Name",
 *  },
 *  ============================================================
 */

const products = [

  // ── MOBILES ────────────────────────────────────────────────
  {
    id: 1,
    name: "iPhone 15 Pro Max",
    brand: "Apple",
    category: "Mobiles",
    price: "₹1,59,900",
    image: "https://placehold.co/400x300/1a1a1a/C9A84C?text=iPhone+15+Pro+Max",
    whatsappMsg: "Hi+Apex!+I+am+interested+in+iPhone+15+Pro+Max",
  },
  {
    id: 2,
    name: "Samsung Galaxy S24 Ultra",
    brand: "Samsung",
    category: "Mobiles",
    price: "₹1,34,999",
    image: "https://placehold.co/400x300/1a1a1a/C9A84C?text=Galaxy+S24+Ultra",
    whatsappMsg: "Hi+Apex!+I+am+interested+in+Samsung+Galaxy+S24+Ultra",
  },
  {
    id: 3,
    name: "OnePlus 12R",
    brand: "OnePlus",
    category: "Mobiles",
    price: "₹39,999",
    image: "https://placehold.co/400x300/1a1a1a/C9A84C?text=OnePlus+12R",
    whatsappMsg: "Hi+Apex!+I+am+interested+in+OnePlus+12R",
  },

  // ── TABLETS ────────────────────────────────────────────────
  {
    id: 4,
    name: "iPad Pro 12.9\" M4",
    brand: "Apple",
    category: "Tablets",
    price: "₹1,09,900",
    image: "https://placehold.co/400x300/1a1a1a/C9A84C?text=iPad+Pro+M4",
    whatsappMsg: "Hi+Apex!+I+am+interested+in+iPad+Pro+12.9+M4",
  },
  {
    id: 5,
    name: "Samsung Galaxy Tab S9 FE",
    brand: "Samsung",
    category: "Tablets",
    price: "₹49,999",
    image: "https://placehold.co/400x300/1a1a1a/C9A84C?text=Galaxy+Tab+S9+FE",
    whatsappMsg: "Hi+Apex!+I+am+interested+in+Samsung+Galaxy+Tab+S9+FE",
  },
  {
    id: 6,
    name: "Xiaomi Pad 6",
    brand: "Xiaomi",
    category: "Tablets",
    price: "₹26,999",
    image: "https://placehold.co/400x300/1a1a1a/C9A84C?text=Xiaomi+Pad+6",
    whatsappMsg: "Hi+Apex!+I+am+interested+in+Xiaomi+Pad+6",
  },

  // ── LAPTOPS ────────────────────────────────────────────────
  {
    id: 7,
    name: "MacBook Air M3 13\"",
    brand: "Apple",
    category: "Laptops",
    price: "₹1,14,900",
    image: "https://placehold.co/400x300/1a1a1a/C9A84C?text=MacBook+Air+M3",
    whatsappMsg: "Hi+Apex!+I+am+interested+in+MacBook+Air+M3+13+inch",
  },
  {
    id: 8,
    name: "Dell XPS 15 OLED",
    brand: "Dell",
    category: "Laptops",
    price: "₹1,99,990",
    image: "https://placehold.co/400x300/1a1a1a/C9A84C?text=Dell+XPS+15",
    whatsappMsg: "Hi+Apex!+I+am+interested+in+Dell+XPS+15+OLED",
  },
  {
    id: 9,
    name: "HP Pavilion 15",
    brand: "HP",
    category: "Laptops",
    price: "₹62,990",
    image: "https://placehold.co/400x300/1a1a1a/C9A84C?text=HP+Pavilion+15",
    whatsappMsg: "Hi+Apex!+I+am+interested+in+HP+Pavilion+15",
  },

  // ── ACCESSORIES ────────────────────────────────────────────
  {
    id: 10,
    name: "AirPods Pro (2nd Gen)",
    brand: "Apple",
    category: "Accessories",
    price: "₹24,900",
    image: "https://placehold.co/400x300/1a1a1a/C9A84C?text=AirPods+Pro+2",
    whatsappMsg: "Hi+Apex!+I+am+interested+in+AirPods+Pro+2nd+Gen",
  },
  {
    id: 11,
    name: "Samsung 45W USB-C Charger",
    brand: "Samsung",
    category: "Accessories",
    price: "₹2,999",
    image: "https://placehold.co/400x300/1a1a1a/C9A84C?text=Samsung+45W+Charger",
    whatsappMsg: "Hi+Apex!+I+am+interested+in+Samsung+45W+USB-C+Charger",
  },
  {
    id: 12,
    name: "Anker MagSafe Power Bank",
    brand: "Anker",
    category: "Accessories",
    price: "₹6,499",
    image: "https://placehold.co/400x300/1a1a1a/C9A84C?text=Anker+MagSafe+Bank",
    whatsappMsg: "Hi+Apex!+I+am+interested+in+Anker+MagSafe+Power+Bank",
  },

];

export default products;
