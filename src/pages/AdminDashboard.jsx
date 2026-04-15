import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import defaultProducts from "../data/products";

const STORAGE_KEY = "apex_products_override";
const AUTH_KEY = "apex_admin_auth";

function loadProducts() {
  try { const s = localStorage.getItem(STORAGE_KEY); if (s) return JSON.parse(s); } catch (_) {}
  return defaultProducts;
}
function saveProducts(p) { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); }

// Resolve image path: supports http/https URLs and local asset paths
function resolveImg(path) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return "/src/assets/products/" + path;
}

const BRANDS = ["Apple","Samsung","OnePlus","Nothing","Motorola","Xiaomi","Realme","Vivo","OPPO","Poco","Infinix","Tecno","AI Plus","Jio","Nokia"];
const CATEGORIES = ["Mobiles","Tablets","Laptops","Accessories","Earphones"];
const BADGES = ["","5G","New","Hot","Sale","Flagship","Best Seller","WiFi"];
const EMPTY = { name:"", brand:"Apple", category:"Mobiles", ram:"", storage:"", color:"", price:"", originalPrice:"", badge:"", inStock:true, image:"" };

const iStyle = { width:"100%", padding:"10px 12px", background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:"8px", color:"#fff", fontSize:"13px", outline:"none", boxSizing:"border-box", fontFamily:"inherit" };

const Btn = ({ children, onClick, color = "#00c851", small, danger, disabled, style: s }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      background: danger ? "#ff444422" : color === "ghost" ? "transparent" : color + "22",
      color: danger ? "#ff4444" : color === "ghost" ? "#888" : color,
      border: `1px solid ${danger ? "#ff444444" : color === "ghost" ? "#333" : color + "44"}`,
      borderRadius: "8px",
      padding: small ? "6px 12px" : "10px 18px",
      fontSize: small ? "12px" : "13px",
      fontWeight: 600,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      transition: "all 0.15s",
      whiteSpace: "nowrap",
      ...s,
    }}
  >
    {children}
  </button>
);

const FInput = ({ label, value, onChange, type = "text", placeholder, options, required }) => (
  <div style={{ marginBottom: "14px" }}>
    <label style={{ color: "#888", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
      {label}{required && <span style={{ color: "#ff4444" }}> *</span>}
    </label>
    {options
      ? <select value={value} onChange={e => onChange(e.target.value)} style={iStyle}>
          {options.map(o => <option key={o} value={o}>{o || "— none —"}</option>)}
        </select>
      : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={iStyle} />
    }
  </div>
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [products, setProducts] = useState(loadProducts);
  const [search, setSearch] = useState("");
  const [filterBrand, setFilterBrand] = useState("All");
  const [tab, setTab] = useState("products");
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [editingModel, setEditingModel] = useState(null); // { key, brand, oldName, newName }
  const [expanded, setExpanded] = useState(new Set());

  useEffect(() => {
    if (!localStorage.getItem(AUTH_KEY)) navigate("/admin-apex-secret");
  }, []);

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const persist = (p) => { setProducts(p); saveProducts(p); };
  const F = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  // ── Filter & group ────────────────────────────────────────
  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    return (
      (!q || p.name?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q) ||
        p.color?.toLowerCase().includes(q) || p.storage?.toLowerCase().includes(q))
      && (filterBrand === "All" || p.brand === filterBrand)
    );
  });

  const grouped = filtered.reduce((acc, p) => {
    const k = p.brand + "||" + p.name;
    if (!acc[k]) acc[k] = [];
    acc[k].push(p);
    return acc;
  }, {});

  // ── CRUD ─────────────────────────────────────────────────
  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      const priceNum = Number(form.price) || 0;
      const origNum = Number(form.originalPrice) || priceNum;
      if (editId) {
        persist(products.map(p => p.id === editId ? { ...form, id: editId, price: priceNum, originalPrice: origNum } : p));
        showToast("Variant updated!");
      } else {
        const newId = Math.max(0, ...products.map(p => p.id || 0)) + 1;
        persist([...products, { ...form, id: newId, price: priceNum, originalPrice: origNum }]);
        showToast("Product added!");
      }
      setEditId(null);
      setForm(EMPTY);
      setTab("products");
      setSaving(false);
    }, 400);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this variant?")) return;
    persist(products.filter(p => p.id !== id));
    showToast("Variant deleted.", "warn");
  };

  const handleDeleteModel = (brand, name) => {
    if (!window.confirm(`Delete ALL variants of "${name}"? This cannot be undone.`)) return;
    persist(products.filter(p => !(p.brand === brand && p.name === name)));
    showToast(`All "${name}" variants deleted.`, "warn");
  };

  const handleToggleStock = (id) => persist(products.map(p => p.id === id ? { ...p, inStock: !p.inStock } : p));

  const handlePriceBlur = (id, val) => {
    const n = Number(val);
    if (!isNaN(n) && n >= 0) persist(products.map(p => p.id === id ? { ...p, price: n } : p));
  };

  const startEdit = (p) => {
    setEditId(p.id);
    setForm({ ...p, price: String(p.price || ""), originalPrice: String(p.originalPrice || "") });
    setTab("add");
  };

  // ── Model rename ─────────────────────────────────────────
  const saveModelRename = () => {
    if (!editingModel?.newName?.trim()) { setEditingModel(null); return; }
    const { brand, oldName, newName } = editingModel;
    persist(products.map(p => p.brand === brand && p.name === oldName ? { ...p, name: newName.trim() } : p));
    showToast("Model renamed!");
    setEditingModel(null);
  };

  // ── Expand / collapse ─────────────────────────────────────
  const toggleExpand = (key) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const expandAll = () => setExpanded(new Set(Object.keys(grouped)));
  const collapseAll = () => setExpanded(new Set());

  // ── Stats ─────────────────────────────────────────────────
  const totalModels = Object.keys(products.reduce((a, p) => { a[p.brand + "||" + p.name] = 1; return a; }, {})).length;
  const brandCounts = BRANDS.map(b => ({ brand: b, count: products.filter(p => p.brand === b).length })).filter(x => x.count > 0);

  const tabBtn = { background: "none", border: "none", padding: "14px 16px", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s" };
  const toastColor = toast?.type === "warn" ? "#ff8800" : "#00c851";

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif" }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 9999, background: "#1a1a1a", border: `1px solid ${toastColor}55`, borderRadius: "10px", padding: "12px 20px", fontSize: "13px", fontWeight: 600, color: toastColor, boxShadow: "0 8px 32px rgba(0,0,0,0.6)", display: "flex", alignItems: "center", gap: "8px" }}>
          {toast.type === "warn" ? "🗑️" : "✅"} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ background: "#111", borderBottom: "1px solid #222", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "60px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "32px", height: "32px", background: "linear-gradient(135deg,#00c851,#007e33)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>⚡</div>
          <span style={{ fontWeight: 700, fontSize: "16px" }}>Apex Admin</span>
          <span style={{ background: "#00c85122", color: "#00c851", border: "1px solid #00c85144", borderRadius: "6px", padding: "2px 8px", fontSize: "11px", fontWeight: 600 }}>LIVE</span>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ color: "#555", fontSize: "12px" }}>{products.length} variants · {totalModels} models</span>
          <Btn color="ghost" small onClick={() => { localStorage.removeItem(AUTH_KEY); navigate("/admin-apex-secret"); }}>Logout</Btn>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: "#111", borderBottom: "1px solid #1a1a1a", padding: "0 24px", display: "flex", gap: "4px" }}>
        {[["products", "📦 Products"], ["add", editId ? "✏️ Edit Variant" : "➕ Add Product"], ["stats", "📊 Stats"]].map(([t, label]) => (
          <button key={t} onClick={() => { setTab(t); if (t !== "add") { setEditId(null); setForm(EMPTY); } }} style={{ ...tabBtn, color: tab === t ? "#00c851" : "#666", borderBottom: tab === t ? "2px solid #00c851" : "2px solid transparent" }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>

        {/* ══════════════════════════════════════════════════
            PRODUCTS TAB
        ══════════════════════════════════════════════════ */}
        {tab === "products" && (
          <div>
            {/* Toolbar */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" }}>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="🔍 Search name, brand, colour, storage…"
                style={{ ...iStyle, flex: 1, minWidth: "220px" }}
              />
              <select value={filterBrand} onChange={e => setFilterBrand(e.target.value)} style={{ ...iStyle, width: "160px" }}>
                <option value="All">All Brands</option>
                {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <Btn onClick={() => setTab("add")}>+ Add Product</Btn>
            </div>

            {/* Expand/collapse controls */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              <button onClick={expandAll} style={{ background: "none", border: "1px solid #2a2a2a", borderRadius: "6px", color: "#555", cursor: "pointer", padding: "5px 12px", fontSize: "12px" }}>Expand All</button>
              <button onClick={collapseAll} style={{ background: "none", border: "1px solid #2a2a2a", borderRadius: "6px", color: "#555", cursor: "pointer", padding: "5px 12px", fontSize: "12px" }}>Collapse All</button>
              <span style={{ color: "#333", fontSize: "12px", alignSelf: "center", marginLeft: "4px" }}>{Object.keys(grouped).length} model{Object.keys(grouped).length !== 1 ? "s" : ""} shown</span>
            </div>

            {/* Model cards */}
            {Object.entries(grouped).map(([key, variants]) => {
              const [brand, name] = key.split("||");
              const isExpanded = expanded.has(key);
              const isRenamingThis = editingModel?.key === key;
              const thumbVariant = variants.find(v => v.image) || variants[0];

              return (
                <div key={key} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "14px", marginBottom: "10px", overflow: "hidden" }}>

                  {/* Model header row */}
                  <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
                    {/* Thumbnail */}
                    <div style={{ width: "48px", height: "48px", background: "#1a1a1a", borderRadius: "10px", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>
                      {thumbVariant?.image
                        ? <img src={resolveImg(thumbVariant.image)} alt={name} style={{ width: "100%", height: "100%", objectFit: "contain" }} onError={e => { e.target.style.display = "none"; }} />
                        : "📱"
                      }
                    </div>

                    {/* Name + rename */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {isRenamingThis ? (
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <input
                            autoFocus
                            value={editingModel.newName}
                            onChange={e => setEditingModel(m => ({ ...m, newName: e.target.value }))}
                            onKeyDown={e => { if (e.key === "Enter") saveModelRename(); if (e.key === "Escape") setEditingModel(null); }}
                            style={{ ...iStyle, flex: 1, padding: "6px 10px", fontSize: "14px" }}
                          />
                          <Btn small onClick={saveModelRename}>Save</Btn>
                          <Btn small color="ghost" onClick={() => setEditingModel(null)}>✕</Btn>
                        </div>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontWeight: 700, fontSize: "15px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
                          <button
                            title="Rename model"
                            onClick={() => setEditingModel({ key, brand, oldName: name, newName: name })}
                            style={{ background: "none", border: "none", color: "#444", cursor: "pointer", padding: "2px 4px", borderRadius: "4px", fontSize: "13px", flexShrink: 0, lineHeight: 1 }}
                          >✏️</button>
                        </div>
                      )}
                      <div style={{ color: "#555", fontSize: "12px", marginTop: "2px" }}>
                        {brand} · {variants.length} variant{variants.length !== 1 ? "s" : ""}
                        {variants.some(v => !v.inStock) && <span style={{ color: "#ff4444", marginLeft: "6px" }}>· {variants.filter(v => !v.inStock).length} out of stock</span>}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: "8px", flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      <Btn small onClick={() => { setForm({ ...EMPTY, brand, name }); setEditId(null); setTab("add"); }}>+ Variant</Btn>
                      <Btn small danger onClick={() => handleDeleteModel(brand, name)}>Delete All</Btn>
                      <button
                        onClick={() => toggleExpand(key)}
                        style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "8px", color: "#666", cursor: "pointer", padding: "6px 12px", fontSize: "12px", fontWeight: 600 }}
                      >
                        {isExpanded ? "▲" : "▼"}
                      </button>
                    </div>
                  </div>

                  {/* Variants table */}
                  {isExpanded && (
                    <div style={{ borderTop: "1px solid #1a1a1a", overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                        <thead>
                          <tr style={{ background: "#0d0d0d" }}>
                            {["Storage", "RAM", "Colour", "Price (₹)", "Orig. Price (₹)", "Badge", "Stock", "Image", "Actions"].map(h => (
                              <th key={h} style={{ padding: "9px 14px", color: "#555", fontWeight: 600, textAlign: "left", whiteSpace: "nowrap", borderBottom: "1px solid #1a1a1a" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {variants.map(v => (
                            <tr key={v.id} style={{ borderBottom: "1px solid #141414" }}>
                              <td style={{ padding: "10px 14px", color: "#e0e0e0", fontWeight: 600 }}>{v.storage || <span style={{ color: "#333" }}>—</span>}</td>
                              <td style={{ padding: "10px 14px", color: "#888" }}>{v.ram || <span style={{ color: "#333" }}>—</span>}</td>
                              <td style={{ padding: "10px 14px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                  <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: v.color?.toLowerCase() || "#888", border: "1px solid #333", flexShrink: 0 }} />
                                  <span style={{ color: "#ccc" }}>{v.color || "—"}</span>
                                </div>
                              </td>
                              <td style={{ padding: "10px 14px" }}>
                                <input
                                  type="number"
                                  defaultValue={v.price}
                                  onBlur={e => handlePriceBlur(v.id, e.target.value)}
                                  style={{ ...iStyle, width: "110px", padding: "6px 8px" }}
                                />
                              </td>
                              <td style={{ padding: "10px 14px", color: "#555", fontSize: "12px" }}>
                                {v.originalPrice ? `₹${v.originalPrice.toLocaleString("en-IN")}` : <span style={{ color: "#333" }}>—</span>}
                              </td>
                              <td style={{ padding: "10px 14px" }}>
                                {v.badge
                                  ? <span style={{ background: "#007aff22", color: "#007aff", border: "1px solid #007aff44", borderRadius: "6px", padding: "2px 8px", fontSize: "11px", fontWeight: 600 }}>{v.badge}</span>
                                  : <span style={{ color: "#333" }}>—</span>
                                }
                              </td>
                              <td style={{ padding: "10px 14px" }}>
                                <button
                                  onClick={() => handleToggleStock(v.id)}
                                  style={{ background: v.inStock ? "#00c85122" : "#ff444422", color: v.inStock ? "#00c851" : "#ff4444", border: `1px solid ${v.inStock ? "#00c85144" : "#ff444444"}`, borderRadius: "6px", padding: "4px 10px", fontSize: "11px", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
                                >
                                  {v.inStock ? "✓ In Stock" : "✗ Out"}
                                </button>
                              </td>
                              <td style={{ padding: "10px 14px" }}>
                                {v.image
                                  ? <img src={resolveImg(v.image)} alt="" style={{ width: "36px", height: "36px", objectFit: "contain", borderRadius: "6px", background: "#1a1a1a", border: "1px solid #2a2a2a" }} onError={e => { e.target.style.display = "none"; }} />
                                  : <span style={{ color: "#333", fontSize: "11px" }}>None</span>
                                }
                              </td>
                              <td style={{ padding: "10px 14px" }}>
                                <div style={{ display: "flex", gap: "6px" }}>
                                  <Btn small onClick={() => startEdit(v)}>Edit</Btn>
                                  <Btn small danger onClick={() => handleDelete(v.id)}>Del</Btn>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px", color: "#444" }}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>📭</div>
                <div style={{ fontSize: "15px" }}>No products found</div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            ADD / EDIT TAB
        ══════════════════════════════════════════════════ */}
        {tab === "add" && (
          <div style={{ maxWidth: "600px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "24px" }}>
              {editId ? "✏️ Edit Variant" : "➕ Add New Product"}
            </h2>

            <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "14px", padding: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>

                {/* Full-width row: model name */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <FInput label="Model Name" value={form.name} onChange={F("name")} placeholder="e.g. iPhone 16 Pro" required />
                </div>

                <FInput label="Brand" value={form.brand} onChange={F("brand")} options={BRANDS} required />
                <FInput label="Category" value={form.category} onChange={F("category")} options={CATEGORIES} />

                {/* Storage prominently first */}
                <FInput label="Storage" value={form.storage} onChange={F("storage")} placeholder="e.g. 256GB" />
                <FInput label="RAM" value={form.ram} onChange={F("ram")} placeholder="e.g. 8GB" />

                <FInput label="Colour" value={form.color} onChange={F("color")} placeholder="e.g. Titanium Black" required />
                <FInput label="Badge" value={form.badge} onChange={F("badge")} options={BADGES} />

                <FInput label="Price (₹)" type="number" value={form.price} onChange={F("price")} placeholder="e.g. 129900" required />
                <FInput label="Original Price (₹)" type="number" value={form.originalPrice} onChange={F("originalPrice")} placeholder="e.g. 139900" />

                {/* Full-width row: image */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <FInput label="Image (URL or local path)" value={form.image} onChange={F("image")} placeholder="https://... or apple/iphone-16/black.webp" />
                  {form.image && (
                    <div style={{ marginTop: "-6px", marginBottom: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
                      <img
                        src={resolveImg(form.image)}
                        alt="preview"
                        style={{ width: "52px", height: "52px", objectFit: "contain", background: "#1a1a1a", borderRadius: "8px", border: "1px solid #2a2a2a" }}
                        onError={e => { e.target.style.display = "none"; }}
                      />
                      <span style={{ color: "#555", fontSize: "11px" }}>Image preview</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stock toggle */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                <button
                  onClick={() => setForm(f => ({ ...f, inStock: !f.inStock }))}
                  style={{ width: "44px", height: "24px", borderRadius: "12px", background: form.inStock ? "#00c851" : "#333", border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}
                >
                  <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: "#fff", position: "absolute", top: "3px", transition: "left 0.2s", left: form.inStock ? "23px" : "3px" }} />
                </button>
                <span style={{ color: form.inStock ? "#00c851" : "#ff4444", fontSize: "13px", fontWeight: 600 }}>
                  {form.inStock ? "✓ In Stock" : "✗ Out of Stock"}
                </span>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <Btn onClick={handleSave} disabled={saving || !form.name || !form.price || !form.color} style={{ flex: 1 }}>
                  {saving ? "Saving…" : editId ? "Update Variant" : "Add Product"}
                </Btn>
                <Btn color="ghost" onClick={() => { setTab("products"); setEditId(null); setForm(EMPTY); }}>Cancel</Btn>
              </div>
            </div>

            {/* Image format hint */}
            <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "14px", padding: "16px 20px", marginTop: "14px" }}>
              <p style={{ color: "#555", fontSize: "12px", margin: "0 0 6px", fontWeight: 600 }}>📁 IMAGE OPTIONS</p>
              <code style={{ color: "#00c851", fontSize: "12px", background: "#0a1a0f", padding: "6px 10px", borderRadius: "6px", display: "block", marginBottom: "6px" }}>https://example.com/image.jpg</code>
              <code style={{ color: "#007aff", fontSize: "12px", background: "#00112a", padding: "6px 10px", borderRadius: "6px", display: "block" }}>apple/iphone-16-pro/black.webp</code>
              <p style={{ color: "#444", fontSize: "11px", margin: "8px 0 0" }}>Use a full URL for hosted images, or a local path under <code style={{ color: "#555" }}>src/assets/products/</code></p>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            STATS TAB
        ══════════════════════════════════════════════════ */}
        {tab === "stats" && (
          <div>
            {/* Summary cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "14px", marginBottom: "24px" }}>
              {[
                { label: "Total Variants", value: products.length, color: "#007aff" },
                { label: "Total Models", value: totalModels, color: "#00c851" },
                { label: "In Stock", value: products.filter(p => p.inStock).length, color: "#00c851" },
                { label: "Out of Stock", value: products.filter(p => !p.inStock).length, color: "#ff4444" },
              ].map(s => (
                <div key={s.label} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "14px", padding: "20px" }}>
                  <div style={{ color: "#666", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>{s.label}</div>
                  <div style={{ color: s.color, fontSize: "32px", fontWeight: 700 }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Brand breakdown */}
            <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "14px", padding: "20px", marginBottom: "16px" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: 700, color: "#888" }}>VARIANTS BY BRAND</h3>
              {brandCounts.map(({ brand, count }) => (
                <div key={brand} style={{ marginBottom: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontSize: "13px", color: "#ccc" }}>{brand}</span>
                    <span style={{ fontSize: "13px", color: "#666" }}>{count}</span>
                  </div>
                  <div style={{ background: "#1a1a1a", borderRadius: "4px", height: "4px", overflow: "hidden" }}>
                    <div style={{ background: "#00c851", height: "100%", width: ((count / products.length) * 100) + "%", borderRadius: "4px" }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Danger zone */}
            <div style={{ background: "#111", border: "1px solid #ff444433", borderRadius: "14px", padding: "20px" }}>
              <h3 style={{ margin: "0 0 6px", fontSize: "14px", fontWeight: 700, color: "#ff4444" }}>DANGER ZONE</h3>
              <p style={{ color: "#555", fontSize: "12px", margin: "0 0 16px" }}>
                Reset all products to the original default list. Every admin change will be erased.
              </p>
              <Btn danger onClick={() => {
                if (!window.confirm("Reset ALL products to defaults? This will erase all admin changes and cannot be undone.")) return;
                localStorage.removeItem(STORAGE_KEY);
                setProducts(defaultProducts);
                showToast("Reset to default products.", "warn");
              }}>
                Reset to Default Products
              </Btn>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
