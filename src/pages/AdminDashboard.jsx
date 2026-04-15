import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import defaultProducts from "../data/products";
import { DS_DEFAULTS, saveDisplaySettings } from "../hooks/useDisplaySettings";
import { saveHeroConfig } from "../hooks/useHeroConfig";
import { saveBannerConfig, BANNER_EMPTY } from "../hooks/useBannerImage";

const STORAGE_KEY  = "apex_products_override";
const AUTH_KEY     = "apex_admin_auth";
const DS_KEY       = "apex_display_settings";
const HERO_KEY     = "apex_hero_config";

function loadProducts() {
  try { const s = localStorage.getItem(STORAGE_KEY); if (s) return JSON.parse(s); } catch (_) {}
  return defaultProducts;
}
function saveProducts(p) { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); }

function loadDS() {
  try { const s = localStorage.getItem(DS_KEY); if (s) return { ...DS_DEFAULTS, ...JSON.parse(s) }; } catch (_) {}
  return { ...DS_DEFAULTS };
}
function loadHero() {
  try { const s = localStorage.getItem(HERO_KEY); if (s) return JSON.parse(s); } catch (_) {}
  return [];
}

function resolveImg(path) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return "/src/assets/products/" + path;
}

function autoPath(brand, name, color) {
  const slug = s => (s || "").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  return `${slug(brand)}/${slug(name)}/${slug(color)}.webp`;
}

function productsToCSV(products) {
  const headers = ["id","brand","name","category","storage","ram","color","price","originalPrice","inStock","badge","image","description"];
  const rows = products.map(p =>
    headers.map(h => {
      const v = p[h] ?? "";
      const str = String(v);
      return str.includes(",") || str.includes("\n") ? `"${str.replace(/"/g, '""')}"` : str;
    }).join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}

function csvToUpdates(csvText) {
  const lines = csvText.trim().split("\n");
  const headers = lines[0].split(",").map(h => h.trim());
  return lines.slice(1).map(line => {
    const vals = line.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
    const obj = {};
    headers.forEach((h, i) => { obj[h] = vals[i] ?? ""; });
    return obj;
  });
}

const BRANDS     = ["Apple","Samsung","OnePlus","Nothing","Motorola","Xiaomi","Realme","Vivo","OPPO","Poco","Infinix","Tecno","AI Plus","Jio","Nokia"];
const CATEGORIES = ["Mobiles","Tablets","Laptops","Accessories","Earphones"];
const BADGES     = ["","5G","New","Hot","Sale","Flagship","Best Seller","WiFi"];
const EMPTY      = { name:"", brand:"Apple", category:"Mobiles", ram:"", storage:"", color:"", price:"", originalPrice:"", badge:"", inStock:true, image:"", description:"" };

const iStyle = { width:"100%", padding:"10px 12px", background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:"8px", color:"#fff", fontSize:"13px", outline:"none", boxSizing:"border-box", fontFamily:"inherit" };

const Btn = ({ children, onClick, color="#00c851", small, danger, disabled, style:s }) => (
  <button onClick={onClick} disabled={disabled} style={{ background:danger?"#ff444422":color==="ghost"?"transparent":color+"22", color:danger?"#ff4444":color==="ghost"?"#888":color, border:`1px solid ${danger?"#ff444444":color==="ghost"?"#333":color+"44"}`, borderRadius:"8px", padding:small?"6px 12px":"10px 18px", fontSize:small?"12px":"13px", fontWeight:600, cursor:disabled?"not-allowed":"pointer", opacity:disabled?0.5:1, transition:"all 0.15s", whiteSpace:"nowrap", ...s }}>
    {children}
  </button>
);

const FInput = ({ label, value, onChange, type="text", placeholder, options, required }) => (
  <div style={{ marginBottom:"14px" }}>
    <label style={{ color:"#888", fontSize:"11px", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:"6px" }}>
      {label}{required && <span style={{ color:"#ff4444" }}> *</span>}
    </label>
    {options
      ? <select value={value} onChange={e => onChange(e.target.value)} style={iStyle}>{options.map(o => <option key={o} value={o}>{o||"— none —"}</option>)}</select>
      : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={iStyle} />
    }
  </div>
);

const Toggle = ({ value, onChange, label, desc }) => (
  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 0", borderBottom:"1px solid #1a1a1a" }}>
    <div>
      <div style={{ color:"#e0e0e0", fontSize:"14px", fontWeight:500 }}>{label}</div>
      {desc && <div style={{ color:"#555", fontSize:"12px", marginTop:"2px" }}>{desc}</div>}
    </div>
    <button
      onClick={() => onChange(!value)}
      style={{ width:"44px", height:"24px", borderRadius:"12px", background:value?"#00c851":"#333", border:"none", cursor:"pointer", position:"relative", transition:"background 0.2s", flexShrink:0, marginLeft:"16px" }}
    >
      <div style={{ width:"18px", height:"18px", borderRadius:"50%", background:"#fff", position:"absolute", top:"3px", transition:"left 0.2s", left:value?"23px":"3px" }} />
    </button>
  </div>
);

export default function AdminDashboard() {
  const navigate    = useNavigate();
  const csvInputRef    = useRef(null);
  const productImgRef  = useRef(null);
  const bannerImgRef   = useRef(null);

  const [products,      setProducts]      = useState(loadProducts);
  const [search,        setSearch]        = useState("");
  const [filterBrand,   setFilterBrand]   = useState("All");
  const [tab,           setTab]           = useState("products");
  const [editId,        setEditId]        = useState(null);
  const [form,          setForm]          = useState(EMPTY);
  const [saving,        setSaving]        = useState(false);
  const [importing,     setImporting]     = useState(false);
  const [toast,         setToast]         = useState(null);
  const [editingModel,  setEditingModel]  = useState(null);
  const [expanded,      setExpanded]      = useState(new Set());
  const [csvPreview,    setCsvPreview]    = useState(null);
  const [ds,            setDs]            = useState(loadDS);   // display settings
  const [heroConfig,    setHeroConfig]    = useState(loadHero); // hero products
  const [heroSearch,    setHeroSearch]    = useState("");
  const [banner, setBanner] = useState(() => {
    try { const s = localStorage.getItem("apex_banner_config"); if (s) return { ...BANNER_EMPTY, ...JSON.parse(s) }; } catch (_) {}
    return { ...BANNER_EMPTY };
  });
  const [bannerImporting, setBannerImporting] = useState(false);
  const Fb = k => v => setBanner(b => ({ ...b, [k]: v }));

  useEffect(() => { if (!localStorage.getItem(AUTH_KEY)) navigate("/admin-apex-secret"); }, []);

  // Auto-save hero config whenever it changes
  useEffect(() => { saveHeroConfig(heroConfig); }, [heroConfig]);

  const showToast = (msg, type="ok") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };
  const persist   = (p) => { setProducts(p); saveProducts(p); };
  const F         = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  // ── Filter & group ────────────────────────────────────
  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    return (!q || p.name?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q) || p.color?.toLowerCase().includes(q) || p.storage?.toLowerCase().includes(q))
      && (filterBrand === "All" || p.brand === filterBrand);
  });

  const grouped = filtered.reduce((acc, p) => {
    const k = p.brand + "||" + p.name;
    if (!acc[k]) acc[k] = [];
    acc[k].push(p);
    return acc;
  }, {});

  // ── Product CRUD ──────────────────────────────────────
  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      const priceNum = Number(form.price) || 0;
      const origNum  = Number(form.originalPrice) || priceNum;
      let updated;
      if (editId) {
        updated = products.map(p => {
          if (p.id === editId) return { ...form, id:editId, price:priceNum, originalPrice:origNum };
          // Propagate description to all variants of same model
          if (form.description && p.brand === form.brand && p.name === form.name) return { ...p, description: form.description };
          return p;
        });
      } else {
        const newId = Math.max(0, ...products.map(p => p.id || 0)) + 1;
        updated = [
          ...products.map(p => form.description && p.brand === form.brand && p.name === form.name ? { ...p, description: form.description } : p),
          { ...form, id:newId, price:priceNum, originalPrice:origNum },
        ];
      }
      persist(updated);
      showToast(editId ? "Variant updated!" : "Product added!");
      setEditId(null); setForm(EMPTY); setTab("products"); setSaving(false);
    }, 400);
  };

  const handleDelete       = id         => { if (!window.confirm("Delete this variant?")) return; persist(products.filter(p => p.id !== id)); showToast("Deleted.", "warn"); };
  const handleDeleteModel  = (b, n)     => { if (!window.confirm(`Delete ALL variants of "${n}"?`)) return; persist(products.filter(p => !(p.brand===b && p.name===n))); showToast(`"${n}" deleted.`, "warn"); };
  const handleToggleStock  = id         => persist(products.map(p => p.id===id ? { ...p, inStock:!p.inStock } : p));
  const handlePriceBlur    = (id, val)  => { const n=Number(val); if (!isNaN(n)&&n>=0) persist(products.map(p => p.id===id?{...p,price:n}:p)); };
  const startEdit          = p          => { setEditId(p.id); setForm({ ...p, price:String(p.price||""), originalPrice:String(p.originalPrice||"") }); setTab("add"); };

  const saveModelRename = () => {
    if (!editingModel?.newName?.trim()) { setEditingModel(null); return; }
    const { brand, oldName, newName } = editingModel;
    persist(products.map(p => p.brand===brand && p.name===oldName ? { ...p, name:newName.trim() } : p));
    showToast("Renamed!"); setEditingModel(null);
  };

  const toggleExpand = key => setExpanded(prev => { const n=new Set(prev); n.has(key)?n.delete(key):n.add(key); return n; });
  const expandAll    = ()  => setExpanded(new Set(Object.keys(grouped)));
  const collapseAll  = ()  => setExpanded(new Set());

  // ── Image import ──────────────────────────────────────
  const handleImportImage = async () => {
    const url = form.image;
    if (!url?.startsWith("http")) { showToast("Paste a full https:// URL first.", "warn"); return; }
    const path = autoPath(form.brand, form.name, form.color);
    setImporting(true);
    try {
      const res  = await fetch("/api/import-image", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ imageUrl:url, imagePath:path }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");
      setForm(f => ({ ...f, image:path }));
      showToast("Image saved to repo! Redeploy in ~60s.");
    } catch (err) {
      showToast("Import failed: " + err.message, "warn");
    } finally {
      setImporting(false);
    }
  };

  // ── CSV export/import ─────────────────────────────────
  const handleExportCSV = () => {
    const blob = new Blob([productsToCSV(products)], { type:"text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `apex-products-${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    showToast("CSV downloaded!");
  };

  const handleCSVFile = e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const updates = csvToUpdates(ev.target.result);
      const matched = [], unmatched = [];
      updates.forEach(row => {
        const id   = Number(row.id);
        const prod = products.find(p => p.id === id);
        if (prod) matched.push({ id, name:prod.name, color:prod.color, storage:prod.storage, oldPrice:prod.price, newPrice:Number(row.price)||prod.price, oldOrig:prod.originalPrice, newOrig:Number(row.originalPrice)||prod.originalPrice, oldStock:prod.inStock, newStock:row.inStock==="false"?false:row.inStock==="true"?true:prod.inStock });
        else unmatched.push(row.id || "?");
      });
      setCsvPreview({ matched, unmatched });
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const applyCSVImport = () => {
    if (!csvPreview) return;
    const map = {}; csvPreview.matched.forEach(r => { map[r.id] = r; });
    persist(products.map(p => { const r=map[p.id]; if (!r) return p; return { ...p, price:r.newPrice, originalPrice:r.newOrig, inStock:r.newStock }; }));
    showToast(`Updated ${csvPreview.matched.length} products!`); setCsvPreview(null);
  };

  // ── Display settings ──────────────────────────────────
  const updateDS = (key, val) => {
    const next = { ...ds, [key]: val };
    setDs(next);
    saveDisplaySettings(next);
    showToast("Setting saved!");
  };

  // ── Upload from device ───────────────────────────────
  const uploadFile = async (file, imagePath, onSuccess) => {
    if (!file) return;
    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    onSuccess(localUrl, true); // true = isPreviewOnly

    const reader = new FileReader();
    reader.onload = async (e) => {
      // Strip the data:image/...;base64, prefix
      const base64 = e.target.result.split(",")[1];
      try {
        const res  = await fetch("/api/upload-image", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ base64, imagePath }) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
        onSuccess(imagePath, false); // false = committed path
        showToast("Image uploaded to repo! Redeploy in ~60s.");
      } catch (err) {
        showToast("Upload failed: " + err.message, "warn");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleProductFileUpload = e => {
    const file = e.target.files[0]; if (!file) return;
    const ext  = file.name.split(".").pop() || "webp";
    const path = autoPath(form.brand, form.name, form.color).replace(".webp", `.${ext}`);
    uploadFile(file, path, (result) => setForm(f => ({ ...f, image: result })));
    e.target.value = "";
  };

  const handleBannerFileUpload = e => {
    const file = e.target.files[0]; if (!file) return;
    const ext  = file.name.split(".").pop() || "webp";
    uploadFile(file, `hero/banner.${ext}`, (result) => setBanner(b => ({ ...b, image: result })));
    e.target.value = "";
  };

  // ── Banner config ──────────────────────────────────────
  const handleSaveBanner = () => { saveBannerConfig(banner); showToast("Highlight of the Day saved!"); };

  const handleImportBanner = async () => {
    if (!banner.image?.startsWith("http")) { showToast("Paste a full https:// URL in the image field.", "warn"); return; }
    setBannerImporting(true);
    try {
      const res  = await fetch("/api/import-image", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ imageUrl:banner.image, imagePath:"hero/banner.webp" }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");
      setBanner(b => ({ ...b, image:"hero/banner.webp" }));
      showToast("Banner image saved to repo! Redeploy in ~60s.");
    } catch (err) {
      showToast("Import failed: " + err.message, "warn");
    } finally {
      setBannerImporting(false);
    }
  };

  // ── Hero config ───────────────────────────────────────
  const addHeroItem    = (brand, name) => { setHeroConfig(c => [...c, { brand, name, description:"", layout:"left" }]); setHeroSearch(""); };
  const removeHeroItem = i             => setHeroConfig(c => c.filter((_,j) => j!==i));
  const updateHeroItem = (i, updates)  => setHeroConfig(c => c.map((item,j) => j===i?{...item,...updates}:item));
  const moveHeroItem   = (i, dir)      => setHeroConfig(c => { const n=[...c]; [n[i],n[i+dir]]=[n[i+dir],n[i]]; return n; });

  // Unique model keys from all products (for hero search)
  const allModels = Object.keys(products.reduce((acc, p) => { acc[p.brand+"||"+p.name] = true; return acc; }, {}));

  // ── Derived ───────────────────────────────────────────
  const totalModels = Object.keys(products.reduce((a,p) => { a[p.brand+"||"+p.name]=1; return a; }, {})).length;
  const brandCounts = BRANDS.map(b => ({ brand:b, count:products.filter(p=>p.brand===b).length })).filter(x => x.count>0);
  const toastColor  = toast?.type==="warn" ? "#ff8800" : "#00c851";
  const tabBtn      = { background:"none", border:"none", padding:"12px 14px", fontSize:"12px", fontWeight:600, cursor:"pointer", transition:"all 0.15s", whiteSpace:"nowrap" };

  return (
    <div style={{ minHeight:"100vh", background:"#0a0a0a", color:"#fff", fontFamily:"-apple-system,BlinkMacSystemFont,sans-serif" }}>

      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed", top:"20px", right:"20px", zIndex:9999, background:"#1a1a1a", border:`1px solid ${toastColor}55`, borderRadius:"10px", padding:"12px 20px", fontSize:"13px", fontWeight:600, color:toastColor, boxShadow:"0 8px 32px rgba(0,0,0,0.6)", maxWidth:"340px" }}>
          {toast.type==="warn"?"⚠️":"✅"} {toast.msg}
        </div>
      )}

      {/* CSV Preview Modal */}
      {csvPreview && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"24px" }}>
          <div style={{ background:"#111", border:"1px solid #2a2a2a", borderRadius:"16px", padding:"28px", maxWidth:"680px", width:"100%", maxHeight:"80vh", overflowY:"auto" }}>
            <h2 style={{ margin:"0 0 6px", fontSize:"18px", fontWeight:700 }}>📋 CSV Import Preview</h2>
            <p style={{ color:"#666", fontSize:"13px", margin:"0 0 20px" }}>Only price, original price and stock will be updated.</p>
            {csvPreview.matched.length > 0 && (
              <>
                <p style={{ color:"#00c851", fontSize:"12px", fontWeight:600, margin:"0 0 10px" }}>{csvPreview.matched.length} products matched</p>
                <div style={{ overflowX:"auto", marginBottom:"16px" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"12px" }}>
                    <thead><tr style={{ background:"#0d0d0d" }}>
                      {["ID","Name","Storage","Colour","Price","Orig. Price","Stock"].map(h => <th key={h} style={{ padding:"8px 12px", color:"#555", textAlign:"left", borderBottom:"1px solid #1a1a1a", whiteSpace:"nowrap" }}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {csvPreview.matched.map(r => (
                        <tr key={r.id} style={{ borderBottom:"1px solid #141414" }}>
                          <td style={{ padding:"8px 12px", color:"#555" }}>{r.id}</td>
                          <td style={{ padding:"8px 12px", color:"#ccc" }}>{r.name}</td>
                          <td style={{ padding:"8px 12px", color:"#888" }}>{r.storage||"—"}</td>
                          <td style={{ padding:"8px 12px", color:"#888" }}>{r.color||"—"}</td>
                          <td style={{ padding:"8px 12px" }}>{r.oldPrice!==r.newPrice?<><span style={{color:"#ff4444",textDecoration:"line-through"}}>₹{r.oldPrice?.toLocaleString("en-IN")}</span>{" → "}<span style={{color:"#00c851"}}>₹{r.newPrice?.toLocaleString("en-IN")}</span></>:<span style={{color:"#555"}}>₹{r.newPrice?.toLocaleString("en-IN")}</span>}</td>
                          <td style={{ padding:"8px 12px" }}>{r.oldOrig!==r.newOrig?<><span style={{color:"#ff4444",textDecoration:"line-through"}}>₹{r.oldOrig?.toLocaleString("en-IN")}</span>{" → "}<span style={{color:"#00c851"}}>₹{r.newOrig?.toLocaleString("en-IN")}</span></>:<span style={{color:"#555"}}>₹{r.newOrig?.toLocaleString("en-IN")}</span>}</td>
                          <td style={{ padding:"8px 12px" }}>{r.oldStock!==r.newStock?<><span style={{color:"#ff4444"}}>{r.oldStock?"In":"Out"}</span>{" → "}<span style={{color:"#00c851"}}>{r.newStock?"In":"Out"}</span></>:<span style={{color:"#555"}}>{r.newStock?"In":"Out"}</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
            {csvPreview.unmatched.length > 0 && <p style={{ color:"#ff8800", fontSize:"12px", margin:"0 0 20px" }}>⚠️ {csvPreview.unmatched.length} row(s) skipped (no matching ID)</p>}
            <div style={{ display:"flex", gap:"10px" }}>
              <Btn onClick={applyCSVImport} style={{ flex:1 }}>Apply {csvPreview.matched.length} Updates</Btn>
              <Btn color="ghost" onClick={() => setCsvPreview(null)}>Cancel</Btn>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ background:"#111", borderBottom:"1px solid #222", padding:"0 24px", display:"flex", alignItems:"center", justifyContent:"space-between", height:"60px", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
          <div style={{ width:"32px", height:"32px", background:"linear-gradient(135deg,#00c851,#007e33)", borderRadius:"8px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px" }}>⚡</div>
          <span style={{ fontWeight:700, fontSize:"16px" }}>Apex Admin</span>
          <span style={{ background:"#00c85122", color:"#00c851", border:"1px solid #00c85144", borderRadius:"6px", padding:"2px 8px", fontSize:"11px", fontWeight:600 }}>LIVE</span>
        </div>
        <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
          <span style={{ color:"#555", fontSize:"12px" }}>{products.length} variants · {totalModels} models</span>
          <Btn color="ghost" small onClick={() => { localStorage.removeItem(AUTH_KEY); navigate("/admin-apex-secret"); }}>Logout</Btn>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background:"#111", borderBottom:"1px solid #1a1a1a", padding:"0 16px", display:"flex", gap:"2px", overflowX:"auto" }}>
        {[["products","📦 Products"],["add",editId?"✏️ Edit":"➕ Add"],["hero","🌟 Hero"],["settings","⚙️ Settings"],["stats","📊 Stats"]].map(([t,label]) => (
          <button key={t} onClick={() => { setTab(t); if (t!=="add") { setEditId(null); setForm(EMPTY); } }} style={{ ...tabBtn, color:tab===t?"#00c851":"#666", borderBottom:tab===t?"2px solid #00c851":"2px solid transparent" }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ padding:"24px", maxWidth:"1200px", margin:"0 auto" }}>

        {/* ═══════════════════════════════ PRODUCTS ═══════════════════════════════ */}
        {tab === "products" && (
          <div>
            <div style={{ display:"flex", gap:"12px", marginBottom:"10px", flexWrap:"wrap", alignItems:"center" }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search name, brand, colour, storage…" style={{ ...iStyle, flex:1, minWidth:"200px" }} />
              <select value={filterBrand} onChange={e => setFilterBrand(e.target.value)} style={{ ...iStyle, width:"160px" }}>
                <option value="All">All Brands</option>
                {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <Btn onClick={() => setTab("add")}>+ Add Product</Btn>
            </div>

            <div style={{ display:"flex", gap:"8px", marginBottom:"16px", flexWrap:"wrap", alignItems:"center" }}>
              <button onClick={expandAll}  style={{ background:"none", border:"1px solid #2a2a2a", borderRadius:"6px", color:"#555", cursor:"pointer", padding:"5px 12px", fontSize:"12px" }}>Expand All</button>
              <button onClick={collapseAll} style={{ background:"none", border:"1px solid #2a2a2a", borderRadius:"6px", color:"#555", cursor:"pointer", padding:"5px 12px", fontSize:"12px" }}>Collapse All</button>
              <span style={{ flex:1 }} />
              <Btn small color="#007aff" onClick={handleExportCSV}>⬇ Download Prices</Btn>
              <Btn small color="#007aff" onClick={() => csvInputRef.current?.click()}>⬆ Upload Prices</Btn>
              <input ref={csvInputRef} type="file" accept=".csv" style={{ display:"none" }} onChange={handleCSVFile} />
            </div>

            {Object.entries(grouped).map(([key, variants]) => {
              const [brand, name]  = key.split("||");
              const isExpanded     = expanded.has(key);
              const isRenamingThis = editingModel?.key === key;
              const thumb          = variants.find(v => v.image) || variants[0];

              return (
                <div key={key} style={{ background:"#111", border:"1px solid #1e1e1e", borderRadius:"14px", marginBottom:"10px", overflow:"hidden" }}>
                  <div style={{ padding:"12px 16px", display:"flex", alignItems:"center", gap:"12px" }}>
                    <div style={{ width:"48px", height:"48px", background:"#1a1a1a", borderRadius:"10px", overflow:"hidden", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"22px" }}>
                      {thumb?.image ? <img src={resolveImg(thumb.image)} alt={name} style={{ width:"100%",height:"100%",objectFit:"contain" }} onError={e=>{e.target.style.display="none";}} /> : "📱"}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      {isRenamingThis ? (
                        <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
                          <input autoFocus value={editingModel.newName} onChange={e => setEditingModel(m=>({...m,newName:e.target.value}))} onKeyDown={e=>{if(e.key==="Enter")saveModelRename();if(e.key==="Escape")setEditingModel(null);}} style={{ ...iStyle, flex:1, padding:"6px 10px", fontSize:"14px" }} />
                          <Btn small onClick={saveModelRename}>Save</Btn>
                          <Btn small color="ghost" onClick={() => setEditingModel(null)}>✕</Btn>
                        </div>
                      ) : (
                        <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                          <span style={{ fontWeight:700, fontSize:"15px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{name}</span>
                          <button title="Rename" onClick={() => setEditingModel({ key, brand, oldName:name, newName:name })} style={{ background:"none", border:"none", color:"#444", cursor:"pointer", padding:"2px 4px", fontSize:"13px", flexShrink:0 }}>✏️</button>
                        </div>
                      )}
                      <div style={{ color:"#555", fontSize:"12px", marginTop:"2px" }}>
                        {brand} · {variants.length} variant{variants.length!==1?"s":""}
                        {variants.some(v=>!v.inStock) && <span style={{ color:"#ff4444", marginLeft:"6px" }}>· {variants.filter(v=>!v.inStock).length} out of stock</span>}
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:"8px", flexShrink:0 }}>
                      <Btn small onClick={() => { setForm({...EMPTY,brand,name}); setEditId(null); setTab("add"); }}>+ Variant</Btn>
                      <Btn small danger onClick={() => handleDeleteModel(brand,name)}>Delete All</Btn>
                      <button onClick={() => toggleExpand(key)} style={{ background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:"8px", color:"#666", cursor:"pointer", padding:"6px 12px", fontSize:"12px", fontWeight:600 }}>{isExpanded?"▲":"▼"}</button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ borderTop:"1px solid #1a1a1a", overflowX:"auto" }}>
                      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"13px" }}>
                        <thead><tr style={{ background:"#0d0d0d" }}>
                          {["Storage","RAM","Colour","Price (₹)","Orig. Price","Badge","Stock","Image","Actions"].map(h => (
                            <th key={h} style={{ padding:"9px 14px", color:"#555", fontWeight:600, textAlign:"left", whiteSpace:"nowrap", borderBottom:"1px solid #1a1a1a" }}>{h}</th>
                          ))}
                        </tr></thead>
                        <tbody>
                          {variants.map(v => (
                            <tr key={v.id} style={{ borderBottom:"1px solid #141414" }}>
                              <td style={{ padding:"10px 14px", color:"#e0e0e0", fontWeight:600 }}>{v.storage||<span style={{color:"#333"}}>—</span>}</td>
                              <td style={{ padding:"10px 14px", color:"#888" }}>{v.ram||<span style={{color:"#333"}}>—</span>}</td>
                              <td style={{ padding:"10px 14px" }}>
                                <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                                  <div style={{ width:"14px", height:"14px", borderRadius:"50%", background:v.color?.toLowerCase()||"#888", border:"1px solid #333", flexShrink:0 }} />
                                  <span style={{ color:"#ccc" }}>{v.color||"—"}</span>
                                </div>
                              </td>
                              <td style={{ padding:"10px 14px" }}>
                                <input type="number" defaultValue={v.price} onBlur={e=>handlePriceBlur(v.id,e.target.value)} style={{ ...iStyle, width:"110px", padding:"6px 8px" }} />
                              </td>
                              <td style={{ padding:"10px 14px", color:"#555", fontSize:"12px" }}>{v.originalPrice?`₹${v.originalPrice.toLocaleString("en-IN")}`:<span style={{color:"#333"}}>—</span>}</td>
                              <td style={{ padding:"10px 14px" }}>{v.badge?<span style={{ background:"#007aff22", color:"#007aff", border:"1px solid #007aff44", borderRadius:"6px", padding:"2px 8px", fontSize:"11px", fontWeight:600 }}>{v.badge}</span>:<span style={{color:"#333"}}>—</span>}</td>
                              <td style={{ padding:"10px 14px" }}>
                                <button onClick={() => handleToggleStock(v.id)} style={{ background:v.inStock?"#00c85122":"#ff444422", color:v.inStock?"#00c851":"#ff4444", border:`1px solid ${v.inStock?"#00c85144":"#ff444444"}`, borderRadius:"6px", padding:"4px 10px", fontSize:"11px", fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>
                                  {v.inStock?"✓ In Stock":"✗ Out"}
                                </button>
                              </td>
                              <td style={{ padding:"10px 14px" }}>{v.image?<img src={resolveImg(v.image)} alt="" style={{ width:"36px",height:"36px",objectFit:"contain",borderRadius:"6px",background:"#1a1a1a",border:"1px solid #2a2a2a" }} onError={e=>{e.target.style.display="none";}} />:<span style={{color:"#333",fontSize:"11px"}}>None</span>}</td>
                              <td style={{ padding:"10px 14px" }}>
                                <div style={{ display:"flex", gap:"6px" }}>
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
              <div style={{ textAlign:"center", padding:"60px", color:"#444" }}>
                <div style={{ fontSize:"40px", marginBottom:"12px" }}>📭</div>
                <div style={{ fontSize:"15px" }}>No products found</div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════ ADD / EDIT ═══════════════════════════════ */}
        {tab === "add" && (
          <div style={{ maxWidth:"600px" }}>
            <h2 style={{ fontSize:"20px", fontWeight:700, marginBottom:"24px" }}>{editId?"✏️ Edit Variant":"➕ Add New Product"}</h2>
            <div style={{ background:"#111", border:"1px solid #1e1e1e", borderRadius:"14px", padding:"24px" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
                <div style={{ gridColumn:"1 / -1" }}><FInput label="Model Name" value={form.name} onChange={F("name")} placeholder="e.g. iPhone 16 Pro" required /></div>
                <FInput label="Brand"    value={form.brand}    onChange={F("brand")}    options={BRANDS}     required />
                <FInput label="Category" value={form.category} onChange={F("category")} options={CATEGORIES} />
                <FInput label="Storage"  value={form.storage}  onChange={F("storage")}  placeholder="e.g. 256GB" />
                <FInput label="RAM"      value={form.ram}      onChange={F("ram")}       placeholder="e.g. 8GB" />
                <FInput label="Colour"   value={form.color}    onChange={F("color")}     placeholder="e.g. Titanium Black" required />
                <FInput label="Badge"    value={form.badge}    onChange={F("badge")}     options={BADGES} />
                <FInput label="Price (₹)"          type="number" value={form.price}         onChange={F("price")}         placeholder="e.g. 129900" required />
                <FInput label="Original Price (₹)" type="number" value={form.originalPrice} onChange={F("originalPrice")} placeholder="e.g. 139900" />

                {/* Image */}
                <div style={{ gridColumn:"1 / -1" }}>
                  <label style={{ color:"#888", fontSize:"11px", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:"6px" }}>Image</label>
                  <div style={{ display:"flex", gap:"8px", marginBottom:"8px" }}>
                    <input type="text" value={form.image} onChange={e=>F("image")(e.target.value)} placeholder="Paste URL, or upload from device →" style={{ ...iStyle, flex:1 }} />
                    <Btn small color="#007aff" disabled={importing||!form.image?.startsWith("http")} onClick={handleImportImage} style={{ flexShrink:0 }}>
                      {importing?"Saving…":"📥 URL → Repo"}
                    </Btn>
                  </div>
                  {/* Upload from device */}
                  <button
                    onClick={() => productImgRef.current?.click()}
                    style={{ width:"100%", padding:"10px", background:"#1a1a1a", border:"1px dashed #3a3a3a", borderRadius:"8px", color:"#888", cursor:"pointer", fontSize:"13px", marginBottom: form.image?"10px":"14px", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px" }}
                  >
                    📁 Upload from Device
                  </button>
                  <input ref={productImgRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleProductFileUpload} />
                  {form.image && (
                    <div style={{ marginBottom:"14px", display:"flex", alignItems:"center", gap:"10px" }}>
                      <img src={resolveImg(form.image)} alt="preview" style={{ width:"52px", height:"52px", objectFit:"contain", background:"#1a1a1a", borderRadius:"8px", border:"1px solid #2a2a2a" }} onError={e=>{e.target.style.display="none";}} />
                      <span style={{ color:"#555", fontSize:"11px" }}>Preview</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div style={{ gridColumn:"1 / -1", marginBottom:"14px" }}>
                  <label style={{ color:"#888", fontSize:"11px", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:"6px" }}>Model Description <span style={{ color:"#444", fontWeight:400, textTransform:"none", letterSpacing:0 }}>(shown in modal & hero page)</span></label>
                  <textarea
                    value={form.description||""}
                    onChange={e => F("description")(e.target.value)}
                    placeholder="e.g. Powered by A18 Pro chip. The most advanced iPhone ever made, now at Apex."
                    rows={3}
                    style={{ ...iStyle, resize:"vertical", lineHeight:"1.6" }}
                  />
                </div>
              </div>

              {/* Stock toggle */}
              <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"24px" }}>
                <button onClick={() => setForm(f=>({...f,inStock:!f.inStock}))} style={{ width:"44px", height:"24px", borderRadius:"12px", background:form.inStock?"#00c851":"#333", border:"none", cursor:"pointer", position:"relative", transition:"background 0.2s", flexShrink:0 }}>
                  <div style={{ width:"18px", height:"18px", borderRadius:"50%", background:"#fff", position:"absolute", top:"3px", transition:"left 0.2s", left:form.inStock?"23px":"3px" }} />
                </button>
                <span style={{ color:form.inStock?"#00c851":"#ff4444", fontSize:"13px", fontWeight:600 }}>{form.inStock?"✓ In Stock":"✗ Out of Stock"}</span>
              </div>

              <div style={{ display:"flex", gap:"10px" }}>
                <Btn onClick={handleSave} disabled={saving||!form.name||!form.price||!form.color} style={{ flex:1 }}>
                  {saving?"Saving…":editId?"Update Variant":"Add Product"}
                </Btn>
                <Btn color="ghost" onClick={() => { setTab("products"); setEditId(null); setForm(EMPTY); }}>Cancel</Btn>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════ HERO ═══════════════════════════════ */}
        {tab === "hero" && (
          <div style={{ maxWidth:"720px" }}>
            <h2 style={{ fontSize:"20px", fontWeight:700, marginBottom:"6px" }}>🌟 Featured Products</h2>
            <p style={{ color:"#555", fontSize:"13px", margin:"0 0 24px" }}>Choose up to 3 products to showcase on the home page. They appear as full product sections with image, description and price.</p>

            {/* Selected items */}
            {heroConfig.map((item, i) => {
              const variants    = products.filter(p => p.brand===item.brand && p.name===item.name);
              const thumbV      = variants.find(v=>v.image) || variants[0];
              const prices      = variants.map(v=>v.price).filter(Boolean);
              const minPrice    = prices.length ? Math.min(...prices) : 0;
              return (
                <div key={i} style={{ background:"#111", border:"1px solid #1e1e1e", borderRadius:"14px", padding:"20px", marginBottom:"12px" }}>
                  {/* Header */}
                  <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"16px" }}>
                    <div style={{ width:"48px", height:"48px", background:"#1a1a1a", borderRadius:"10px", overflow:"hidden", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px" }}>
                      {thumbV?.image ? <img src={resolveImg(thumbV.image)} alt={item.name} style={{ width:"100%",height:"100%",objectFit:"contain" }} onError={e=>{e.target.style.display="none";}} /> : "📱"}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:"15px" }}>{item.name}</div>
                      <div style={{ color:"#555", fontSize:"12px" }}>{item.brand}{minPrice>0?` · From ₹${minPrice.toLocaleString("en-IN")}`:""}</div>
                    </div>
                    <div style={{ display:"flex", gap:"6px" }}>
                      {i > 0 && <button onClick={() => moveHeroItem(i,-1)} style={{ background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:"6px", color:"#888", cursor:"pointer", padding:"6px 10px", fontSize:"13px" }}>↑</button>}
                      {i < heroConfig.length-1 && <button onClick={() => moveHeroItem(i,1)} style={{ background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:"6px", color:"#888", cursor:"pointer", padding:"6px 10px", fontSize:"13px" }}>↓</button>}
                      <Btn small danger onClick={() => removeHeroItem(i)}>Remove</Btn>
                    </div>
                  </div>

                  {/* Description */}
                  <div style={{ marginBottom:"12px" }}>
                    <label style={{ color:"#888", fontSize:"11px", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:"6px" }}>Description (shown on home page)</label>
                    <textarea value={item.description||""} onChange={e => updateHeroItem(i,{description:e.target.value})} placeholder="e.g. Powered by A18 Pro chip. The most advanced iPhone ever made." rows={2} style={{ ...iStyle, resize:"vertical", lineHeight:"1.5" }} />
                  </div>

                  {/* Layout */}
                  <div>
                    <label style={{ color:"#888", fontSize:"11px", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:"8px" }}>Section Layout</label>
                    <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                      {[["left","⬅ Image Left"],["right","Image Right ➡"],["center","⬇ Centered"]].map(([l,label]) => (
                        <button key={l} onClick={() => updateHeroItem(i,{layout:l})} style={{ background:item.layout===l?"#00c85122":"#1a1a1a", color:item.layout===l?"#00c851":"#666", border:`1px solid ${item.layout===l?"#00c85144":"#2a2a2a"}`, borderRadius:"8px", padding:"7px 14px", cursor:"pointer", fontSize:"12px", fontWeight:600 }}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add product search */}
            {heroConfig.length < 3 && (
              <div style={{ background:"#111", border:"1px dashed #2a2a2a", borderRadius:"14px", padding:"20px" }}>
                <p style={{ color:"#555", fontSize:"13px", margin:"0 0 12px", fontWeight:600 }}>+ Add Featured Product ({heroConfig.length}/3)</p>
                <input
                  value={heroSearch}
                  onChange={e => setHeroSearch(e.target.value)}
                  placeholder="Search model name…"
                  style={{ ...iStyle, marginBottom: heroSearch?"0":"0" }}
                />
                {heroSearch && (
                  <div style={{ background:"#0d0d0d", borderRadius:"0 0 8px 8px", overflow:"hidden", maxHeight:"220px", overflowY:"auto", border:"1px solid #1a1a1a", borderTop:"none" }}>
                    {allModels
                      .filter(k => k.toLowerCase().includes(heroSearch.toLowerCase()))
                      .slice(0, 12)
                      .map(k => {
                        const [b, n] = k.split("||");
                        const already = heroConfig.some(h => h.brand===b && h.name===n);
                        return (
                          <button key={k} disabled={already} onClick={() => addHeroItem(b,n)} style={{ width:"100%", textAlign:"left", background:"none", border:"none", borderBottom:"1px solid #1a1a1a", padding:"10px 16px", cursor:already?"not-allowed":"pointer", opacity:already?0.4:1, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                            <span><span style={{ color:"#fff", fontSize:"13px" }}>{n}</span><span style={{ color:"#555", fontSize:"12px", marginLeft:"8px" }}>{b}</span></span>
                            {already ? <span style={{ color:"#555", fontSize:"11px" }}>added</span> : <span style={{ color:"#00c851", fontSize:"11px" }}>+ Add</span>}
                          </button>
                        );
                      })
                    }
                    {allModels.filter(k => k.toLowerCase().includes(heroSearch.toLowerCase())).length === 0 && (
                      <div style={{ padding:"16px", color:"#444", fontSize:"13px", textAlign:"center" }}>No models found</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {heroConfig.length === 0 && (
              <p style={{ color:"#444", fontSize:"13px", marginTop:"16px", textAlign:"center" }}>No featured products yet. Search and add up to 3 above.</p>
            )}

            {/* ── Highlight of the Day ── */}
            <div style={{ marginTop:"32px", background:"#111", border:"1px solid #1e1e1e", borderRadius:"14px", padding:"24px" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"4px" }}>
                <h3 style={{ margin:0, fontSize:"15px", fontWeight:700 }}>🌟 Highlight of the Day</h3>
                <div style={{ display:"flex", gap:"8px" }}>
                  <Btn small color="#007aff" disabled={bannerImporting || !banner.image?.startsWith("http")} onClick={handleImportBanner}>
                    {bannerImporting ? "Saving…" : "📥 Save Image to Repo"}
                  </Btn>
                  <Btn small onClick={handleSaveBanner}>Publish</Btn>
                </div>
              </div>
              <p style={{ color:"#555", fontSize:"12px", margin:"0 0 20px" }}>Shown as a featured card on the home page below the main headline.</p>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
                {/* Badge label */}
                <div style={{ gridColumn:"1 / -1" }}>
                  <label style={{ color:"#888", fontSize:"11px", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:"6px" }}>Badge Label</label>
                  <input value={banner.label} onChange={e => Fb("label")(e.target.value)} placeholder="e.g. Highlight of the Day / Deal of the Week" style={{ ...iStyle, marginBottom:"14px" }} />
                </div>

                {/* Title */}
                <div style={{ gridColumn:"1 / -1" }}>
                  <label style={{ color:"#888", fontSize:"11px", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:"6px" }}>Product / Title *</label>
                  <input value={banner.title} onChange={e => Fb("title")(e.target.value)} placeholder="e.g. iPhone 16 Pro Max" style={{ ...iStyle, marginBottom:"14px" }} />
                </div>

                {/* Description */}
                <div style={{ gridColumn:"1 / -1" }}>
                  <label style={{ color:"#888", fontSize:"11px", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:"6px" }}>Description</label>
                  <textarea value={banner.subtitle} onChange={e => Fb("subtitle")(e.target.value)} placeholder="e.g. Powered by A18 Pro chip. 5× Optical zoom. Available now at Apex." rows={2} style={{ ...iStyle, resize:"vertical", lineHeight:"1.6", marginBottom:"14px" }} />
                </div>

                {/* Price */}
                <div>
                  <label style={{ color:"#888", fontSize:"11px", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:"6px" }}>Price</label>
                  <input value={banner.price} onChange={e => Fb("price")(e.target.value)} placeholder="e.g. 134900 or From ₹99,900" style={{ ...iStyle, marginBottom:"14px" }} />
                </div>

                {/* CTA Text */}
                <div>
                  <label style={{ color:"#888", fontSize:"11px", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:"6px" }}>Button Text</label>
                  <input value={banner.ctaText} onChange={e => Fb("ctaText")(e.target.value)} placeholder="e.g. Enquire on WhatsApp" style={{ ...iStyle, marginBottom:"14px" }} />
                </div>

                {/* CTA Link */}
                <div style={{ gridColumn:"1 / -1" }}>
                  <label style={{ color:"#888", fontSize:"11px", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:"6px" }}>Button Link <span style={{ color:"#444", fontWeight:400, textTransform:"none", letterSpacing:0 }}>(leave blank to auto-generate WhatsApp link)</span></label>
                  <input value={banner.ctaLink} onChange={e => Fb("ctaLink")(e.target.value)} placeholder="https://wa.me/91..." style={{ ...iStyle, marginBottom:"14px" }} />
                </div>

                {/* Image */}
                <div style={{ gridColumn:"1 / -1" }}>
                  <label style={{ color:"#888", fontSize:"11px", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:"6px" }}>Product Image</label>
                  <div style={{ display:"flex", gap:"8px", marginBottom:"8px" }}>
                    <input value={banner.image} onChange={e => Fb("image")(e.target.value)} placeholder="Paste URL, or upload from device →" style={{ ...iStyle, flex:1 }} />
                    <Btn small color="#007aff" disabled={bannerImporting||!banner.image?.startsWith("http")} onClick={handleImportBanner} style={{ flexShrink:0 }}>
                      {bannerImporting?"Saving…":"📥 URL → Repo"}
                    </Btn>
                  </div>
                  <button
                    onClick={() => bannerImgRef.current?.click()}
                    style={{ width:"100%", padding:"10px", background:"#1a1a1a", border:"1px dashed #3a3a3a", borderRadius:"8px", color:"#888", cursor:"pointer", fontSize:"13px", marginBottom:"10px", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px" }}
                  >
                    📁 Upload from Device
                  </button>
                  <input ref={bannerImgRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleBannerFileUpload} />
                </div>
              </div>

              {/* Live preview */}
              {(banner.title || banner.image) && (
                <div style={{ background:"#0d0d0d", borderRadius:"12px", overflow:"hidden", display:"grid", gridTemplateColumns:"1fr 1fr", marginBottom:"16px", minHeight:"180px" }}>
                  <div style={{ background:"#1a1a1a", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}>
                    {banner.image
                      ? <img src={banner.image.startsWith("http") ? banner.image : "/src/assets/products/"+banner.image} alt="preview" style={{ maxHeight:"140px", objectFit:"contain" }} onError={e=>{e.target.style.display="none";}} />
                      : <span style={{ fontSize:"48px" }}>📱</span>
                    }
                  </div>
                  <div style={{ padding:"20px", display:"flex", flexDirection:"column", justifyContent:"center" }}>
                    <span style={{ background:"#fffbe6", color:"#b45309", border:"1px solid #fde68a", borderRadius:"20px", padding:"2px 10px", fontSize:"10px", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", width:"fit-content", marginBottom:"8px" }}>
                      {banner.label || "Highlight of the Day"}
                    </span>
                    <div style={{ color:"#fff", fontWeight:700, fontSize:"16px", marginBottom:"4px" }}>{banner.title || "Product Name"}</div>
                    {banner.subtitle && <div style={{ color:"#888", fontSize:"11px", marginBottom:"6px", lineHeight:1.4 }}>{banner.subtitle}</div>}
                    {banner.price && <div style={{ color:"#fff", fontWeight:700, fontSize:"18px", marginBottom:"8px" }}>{isNaN(Number(banner.price)) ? banner.price : `₹${Number(banner.price).toLocaleString("en-IN")}`}</div>}
                    <div style={{ background:"#222", color:"#aaa", borderRadius:"20px", padding:"5px 14px", fontSize:"11px", width:"fit-content" }}>{banner.ctaText || "Enquire on WhatsApp"} →</div>
                  </div>
                </div>
              )}

              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <button onClick={() => { setBanner({...BANNER_EMPTY}); saveBannerConfig({...BANNER_EMPTY}); showToast("Highlight cleared.", "warn"); }} style={{ background:"none", border:"none", color:"#ff4444", fontSize:"12px", cursor:"pointer", padding:0 }}>
                  Clear highlight
                </button>
                <Btn onClick={handleSaveBanner}>Publish to Home Page</Btn>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════ SETTINGS ═══════════════════════════════ */}
        {tab === "settings" && (
          <div style={{ maxWidth:"520px" }}>
            <h2 style={{ fontSize:"20px", fontWeight:700, marginBottom:"8px" }}>⚙️ Display Settings</h2>
            <p style={{ color:"#555", fontSize:"13px", margin:"0 0 24px" }}>Control what information is shown on product cards across the site.</p>
            <div style={{ background:"#111", border:"1px solid #1e1e1e", borderRadius:"14px", padding:"8px 24px" }}>
              <Toggle value={ds.showStorage}      onChange={v=>updateDS("showStorage",v)}      label="Show Storage Options" desc="Storage chips on cards — e.g. 128GB · 256GB · 512GB" />
              <Toggle value={ds.showRAM}          onChange={v=>updateDS("showRAM",v)}          label="Show RAM"             desc="RAM chips on cards — e.g. 8GB (shown when no storage)" />
              <Toggle value={ds.showColours}      onChange={v=>updateDS("showColours",v)}      label="Show Colour Swatches" desc="Colour dot indicators on product cards" />
              <Toggle value={ds.showVariantCount} onChange={v=>updateDS("showVariantCount",v)} label="Show Variant Count"   desc='"X variants" badge shown on product card images' />
            </div>
            <div style={{ background:"#111", border:"1px solid #1e1e1e", borderRadius:"14px", padding:"16px 24px", marginTop:"14px" }}>
              <p style={{ color:"#555", fontSize:"12px", margin:"0" }}>Changes apply instantly across the site. Refresh the products page to see the effect.</p>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════ STATS ═══════════════════════════════ */}
        {tab === "stats" && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:"14px", marginBottom:"24px" }}>
              {[{label:"Total Variants",value:products.length,color:"#007aff"},{label:"Total Models",value:totalModels,color:"#00c851"},{label:"In Stock",value:products.filter(p=>p.inStock).length,color:"#00c851"},{label:"Out of Stock",value:products.filter(p=>!p.inStock).length,color:"#ff4444"}].map(s => (
                <div key={s.label} style={{ background:"#111", border:"1px solid #1e1e1e", borderRadius:"14px", padding:"20px" }}>
                  <div style={{ color:"#666", fontSize:"11px", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"8px" }}>{s.label}</div>
                  <div style={{ color:s.color, fontSize:"32px", fontWeight:700 }}>{s.value}</div>
                </div>
              ))}
            </div>
            <div style={{ background:"#111", border:"1px solid #1e1e1e", borderRadius:"14px", padding:"20px", marginBottom:"16px" }}>
              <h3 style={{ margin:"0 0 16px", fontSize:"14px", fontWeight:700, color:"#888" }}>VARIANTS BY BRAND</h3>
              {brandCounts.map(({ brand, count }) => (
                <div key={brand} style={{ marginBottom:"12px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"4px" }}>
                    <span style={{ fontSize:"13px", color:"#ccc" }}>{brand}</span>
                    <span style={{ fontSize:"13px", color:"#666" }}>{count}</span>
                  </div>
                  <div style={{ background:"#1a1a1a", borderRadius:"4px", height:"4px", overflow:"hidden" }}>
                    <div style={{ background:"#00c851", height:"100%", width:((count/products.length)*100)+"%", borderRadius:"4px" }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background:"#111", border:"1px solid #ff444433", borderRadius:"14px", padding:"20px" }}>
              <h3 style={{ margin:"0 0 6px", fontSize:"14px", fontWeight:700, color:"#ff4444" }}>DANGER ZONE</h3>
              <p style={{ color:"#555", fontSize:"12px", margin:"0 0 16px" }}>Reset all products to the original default list.</p>
              <Btn danger onClick={() => { if (!window.confirm("Reset ALL products to defaults?")) return; localStorage.removeItem(STORAGE_KEY); setProducts(defaultProducts); showToast("Reset to defaults.", "warn"); }}>
                Reset to Default Products
              </Btn>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
