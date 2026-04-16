import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import defaultProducts from "../data/products";
import { DS_DEFAULTS, saveDisplaySettings } from "../hooks/useDisplaySettings";
import { saveHeroConfig } from "../hooks/useHeroConfig";
import { saveBannerConfig, BANNER_EMPTY } from "../hooks/useBannerImage";
import { getProductImage } from "../utils/productImages";
import { STORE_DEFAULTS, loadStoreConfig, saveStoreConfig, getStoreImage } from "../hooks/useStoreConfig";

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

function ChangePasswordSection() {
  const [cur,    setCur]    = useState("");
  const [next,   setNext]   = useState("");
  const [conf,   setConf]   = useState("");
  const [msg,    setMsg]    = useState(null); // {text, ok}

  const DEFAULT_PW = "Apex@2024#Secret";
  const getStored  = () => localStorage.getItem("apex_admin_password") || DEFAULT_PW;

  const handleChange = () => {
    if (cur !== getStored()) { setMsg({ text: "Current password is incorrect.", ok: false }); return; }
    if (next.length < 8)     { setMsg({ text: "New password must be at least 8 characters.", ok: false }); return; }
    if (next !== conf)        { setMsg({ text: "Passwords don't match.", ok: false }); return; }
    localStorage.setItem("apex_admin_password", next);
    setCur(""); setNext(""); setConf("");
    setMsg({ text: "Password changed successfully!", ok: true });
  };

  const pw = s => ({ ...iStyle, marginBottom:"10px", WebkitTextSecurity:"disc" });

  return (
    <div style={{ background:"#111", border:"1px solid #1e1e1e", borderRadius:"14px", padding:"24px", marginBottom:"14px" }}>
      <h3 style={{ margin:"0 0 4px", fontSize:"15px", fontWeight:700 }}>🔐 Change Admin Password</h3>
      <p style={{ color:"#555", fontSize:"12px", margin:"0 0 20px" }}>Stored locally on this device. Affects login on this browser only.</p>
      <input type="password" value={cur}  onChange={e=>{setCur(e.target.value);setMsg(null);}}  placeholder="Current password"  style={pw()} />
      <input type="password" value={next} onChange={e=>{setNext(e.target.value);setMsg(null);}} placeholder="New password (min 8 chars)" style={pw()} />
      <input type="password" value={conf} onChange={e=>{setConf(e.target.value);setMsg(null);}} placeholder="Confirm new password" style={{ ...iStyle, marginBottom:"14px" }} />
      {msg && <p style={{ color: msg.ok ? "#00c851" : "#ff4444", fontSize:"12px", marginBottom:"12px" }}>{msg.text}</p>}
      <Btn onClick={handleChange}>Change Password</Btn>
    </div>
  );
}

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

  // ── Store config (logo, categories, about, maps, contact, social) ─────
  const [storeCfg, setStoreCfg] = useState(loadStoreConfig);
  const logoImgRef      = useRef(null);
  const storePhotoRef   = useRef(null);
  const catImgRefs      = useRef([null, null, null, null]);
  const Fs = k => v => setStoreCfg(c => ({ ...c, [k]: v }));
  // Push store config to GitHub so all browsers pick it up
  const syncStoreConfig = (cfg) => {
    fetch("/api/sync-store-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeConfig: cfg }),
    }).catch(() => {});
  };

  const saveStore = (next) => {
    saveStoreConfig(next);
    showToast("Saving…");
    fetch("/api/sync-store-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeConfig: next }),
    })
      .then(r => r.json())
      .then(d => showToast(d.success ? "Saved & synced to repo!" : "Saved locally (sync failed)"))
      .catch(() => showToast("Saved locally (offline)"));
  };

  useEffect(() => { if (!localStorage.getItem(AUTH_KEY)) navigate("/admin"); }, []);

  // On first load: push everything from localStorage to GitHub so all browsers stay in sync
  useEffect(() => {
    const currentProducts = loadProducts();
    // Sync products
    fetch("/api/sync-products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ products: currentProducts }),
    }).catch(() => {});
    // Sync hero + banner
    const currentHero   = loadHero();
    const currentBanner = (() => {
      try { const s = localStorage.getItem("apex_banner_config"); if (s) return JSON.parse(s); } catch (_) {}
      return BANNER_EMPTY;
    })();
    fetch("/api/sync-hero", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ heroConfig: currentHero, bannerConfig: currentBanner }),
    }).catch(() => {});
  }, []); // runs once on mount

  // Auto-save hero config whenever it changes and sync to GitHub
  useEffect(() => {
    saveHeroConfig(heroConfig);
    fetch("/api/sync-hero", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ heroConfig, bannerConfig: banner }),
    }).catch(() => {});
  }, [heroConfig]);

  const showToast = (msg, type="ok") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };
  const persist   = (p) => {
    setProducts(p);
    saveProducts(p);
    // Sync full catalog to GitHub so all browsers see the changes after redeploy
    fetch("/api/sync-products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ products: p }),
    }).catch(() => {});
  };
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
  const handleSave = async () => {
    setSaving(true);
    try {
      const priceNum = Number(form.price) || 0;
      const origNum  = Number(form.originalPrice) || priceNum;

      // Auto-import URL image before saving so it lands in the repo
      let imagePath = form.image;
      if (imagePath?.startsWith("http")) {
        const path = autoPath(form.brand, form.name, form.color);
        try {
          const res  = await fetch("/api/import-image", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ imageUrl:imagePath, imagePath:path }) });
          const data = await res.json();
          if (res.ok) { imagePath = path; showToast("Image auto-saved to repo!"); }
          else showToast("Image import failed: " + data.error, "warn");
        } catch (err) {
          showToast("Image import error: " + err.message, "warn");
        }
      }

      const finalForm = { ...form, image: imagePath };
      let updated;
      let savedId;
      if (editId) {
        savedId = editId;
        updated = products.map(p => {
          if (p.id === editId) return { ...finalForm, id:editId, price:priceNum, originalPrice:origNum };
          if (finalForm.description && p.brand === finalForm.brand && p.name === finalForm.name) return { ...p, description: finalForm.description };
          return p;
        });
      } else {
        savedId = Math.max(0, ...products.map(p => p.id || 0)) + 1;
        updated = [
          ...products.map(p => finalForm.description && p.brand === finalForm.brand && p.name === finalForm.name ? { ...p, description: finalForm.description } : p),
          { ...finalForm, id:savedId, price:priceNum, originalPrice:origNum },
        ];
      }
      persist(updated);

      // Persist image path to GitHub so all browsers see it after redeploy
      if (imagePath && !imagePath.startsWith("http")) {
        fetch("/api/update-product-images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ updates: [{ id: savedId, imagePath }] }),
        }).catch(() => {});
      }

      showToast(editId ? "Variant updated!" : "Product added!");
      setEditId(null); setForm(EMPTY); setTab("products");
    } finally {
      setSaving(false);
    }
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

  // ── Image import (manual button) ─────────────────────
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
      // Persist path to GitHub so all browsers see it
      if (editId) {
        fetch("/api/update-product-images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ updates: [{ id: editId, imagePath: path }] }),
        }).catch(() => {});
      }
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
    uploadFile(file, path, (result, isPreview) => {
      setForm(f => ({ ...f, image: result }));
      // Once committed (not preview), persist path to GitHub for all browsers
      if (!isPreview && editId) {
        fetch("/api/update-product-images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ updates: [{ id: editId, imagePath: result }] }),
        }).catch(() => {});
      }
    });
    e.target.value = "";
  };

  const handleBannerFileUpload = e => {
    const file = e.target.files[0]; if (!file) return;
    const ext  = file.name.split(".").pop() || "webp";
    uploadFile(file, `hero/banner.${ext}`, (result) => setBanner(b => ({ ...b, image: result })));
    e.target.value = "";
  };

  /**
   * Upload a store image (logo, store photo, category image) to public/store/
   * so it's served at /store/<filename> — a stable public URL that requires
   * no Vite rebuild. The blob preview URL is stored immediately so the image
   * shows right away in this tab; after Vercel redeploys (~60 s) the /store/
   * URL works in every browser.
   */
  const uploadStoreImage = async (file, filename, onCommitted) => {
    if (!file) return;
    // 1. Immediate blob preview in this tab
    const blobUrl = URL.createObjectURL(file);
    onCommitted(blobUrl);

    // 2. Read file as base64 and commit to public/store/ via the new API
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result.split(",")[1];
      try {
        const res  = await fetch("/api/upload-store-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ base64, filename }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
        // 3. Replace blob URL with the stable /store/ URL
        onCommitted(data.url);
        showToast("Image saved! Will show everywhere after ~60s redeploy.");
      } catch (err) {
        showToast("Upload failed: " + err.message, "warn");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogoFileUpload = e => {
    const file = e.target.files[0]; if (!file) return;
    const ext = file.name.split(".").pop() || "png";
    uploadStoreImage(file, `logo.${ext}`, (url) => {
      setStoreCfg(c => {
        const n = { ...c, logoImage: url };
        saveStoreConfig(n);
        if (!url.startsWith('blob:')) { showToast("Logo synced to repo!"); syncStoreConfig(n); }
        return n;
      });
    });
    e.target.value = "";
  };

  const handleStorePhotoUpload = e => {
    const file = e.target.files[0]; if (!file) return;
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `storefront-${Date.now()}.${ext}`;
    uploadStoreImage(file, filename, (url) => {
      setStoreCfg(c => {
        const existing = Array.isArray(c.storePhotos) ? c.storePhotos : (c.storePhoto ? [c.storePhoto] : []);
        const n = { ...c, storePhotos: [...existing, url], storePhoto: '' };
        saveStoreConfig(n);
        if (!url.startsWith('blob:')) { showToast("Store photo synced to repo!"); syncStoreConfig(n); }
        return n;
      });
    });
    e.target.value = "";
  };

  const handleCategoryImageUpload = (catIndex, e) => {
    const file = e.target.files[0]; if (!file) return;
    const ext = file.name.split(".").pop() || "jpg";
    // Use timestamp so multiple uploads don't overwrite each other
    const filename = `cat-${catIndex}-${Date.now()}.${ext}`;
    uploadStoreImage(file, filename, (url) => {
      setStoreCfg(c => {
        const cat = c.categories[catIndex];
        // Migrate legacy single image → array
        const existing = Array.isArray(cat.images) ? cat.images : (cat.image ? [cat.image] : []);
        const cats = c.categories.map((c2, i) => i === catIndex ? { ...c2, images: [...existing, url], image: '' } : c2);
        const n = { ...c, categories: cats };
        saveStoreConfig(n);
        if (!url.startsWith('blob:')) { showToast("Category image synced!"); syncStoreConfig(n); }
        return n;
      });
    });
    e.target.value = "";
  };

  // ── Banner config ──────────────────────────────────────
  const handleSaveBanner = () => {
    saveBannerConfig(banner);
    // Sync to GitHub so all browsers see the updated banner
    fetch("/api/sync-hero", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ heroConfig, bannerConfig: banner }),
    }).catch(() => {});
    showToast("Highlight of the Day saved!");
  };

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
          <Btn color="ghost" small onClick={() => { localStorage.removeItem(AUTH_KEY); navigate("/admin"); }}>Logout</Btn>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background:"#111", borderBottom:"1px solid #1a1a1a", padding:"0 16px", display:"flex", gap:"2px", overflowX:"auto" }}>
        {[["products","📦 Products"],["add",editId?"✏️ Edit":"➕ Add"],["hero","🌟 Hero"],["store","🏪 Store"],["about","📖 About"],["settings","⚙️ Settings"],["stats","📊 Stats"]].map(([t,label]) => (
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
                      ? <img src={getProductImage(banner.image) || banner.image} alt="preview" style={{ maxHeight:"140px", objectFit:"contain" }} onError={e=>{e.target.style.display="none";}} />
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

        {/* ═══════════════════════════════ STORE ═══════════════════════════════ */}
        {tab === "store" && (
          <div style={{ maxWidth:"680px" }}>
            <h2 style={{ fontSize:"20px", fontWeight:700, marginBottom:"6px" }}>🏪 Store Settings</h2>
            <p style={{ color:"#555", fontSize:"13px", margin:"0 0 28px" }}>Manage your logo, contact details, social links, category cards, and Maps info.</p>

            {/* ── Logo ── */}
            <div style={{ background:"#111", border:"1px solid #1e1e1e", borderRadius:"14px", padding:"24px", marginBottom:"14px" }}>
              <h3 style={{ margin:"0 0 4px", fontSize:"15px", fontWeight:700 }}>🖼️ Logo & Branding</h3>
              <p style={{ color:"#555", fontSize:"12px", margin:"0 0 20px" }}>Upload your store logo — appears in the navigation bar. If left blank, the fallback text is shown.</p>

              {storeCfg.logoImage && (
                <div style={{ marginBottom:"14px", display:"flex", alignItems:"center", gap:"12px" }}>
                  <div style={{ width:"120px", height:"48px", background:"#1a1a1a", borderRadius:"10px", border:"1px solid #2a2a2a", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", padding:"6px" }}>
                    <img src={getStoreImage(storeCfg.logoImage)} alt="Logo" style={{ maxWidth:"100%", maxHeight:"100%", objectFit:"contain" }} onError={e=>{e.target.style.display="none";}} />
                  </div>
                  <span style={{ color:"#555", fontSize:"11px" }}>Current logo</span>
                </div>
              )}

              <label style={{ color:"#888", fontSize:"11px", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:"6px" }}>Logo Image URL</label>
              <input value={storeCfg.logoImage} onChange={e => Fs("logoImage")(e.target.value)} placeholder="Paste image URL, or upload from device →" style={{ ...iStyle, marginBottom:"8px" }} />
              <button onClick={() => logoImgRef.current?.click()} style={{ width:"100%", padding:"10px", background:"#1a1a1a", border:"1px dashed #3a3a3a", borderRadius:"8px", color:"#888", cursor:"pointer", fontSize:"13px", marginBottom:"14px", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px" }}>
                📁 Upload Logo from Device
              </button>
              <input ref={logoImgRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleLogoFileUpload} />

              <label style={{ color:"#888", fontSize:"11px", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:"6px" }}>Fallback Text</label>
              <input value={storeCfg.logoText} onChange={e => Fs("logoText")(e.target.value)} placeholder="APEX" style={{ ...iStyle, marginBottom:"16px" }} />

              <Btn onClick={() => saveStore({...storeCfg})}>Save Branding</Btn>
            </div>

            {/* ── Contact Details ── */}
            <div style={{ background:"#111", border:"1px solid #1e1e1e", borderRadius:"14px", padding:"24px", marginBottom:"14px" }}>
              <h3 style={{ margin:"0 0 4px", fontSize:"15px", fontWeight:700 }}>📞 Contact Details</h3>
              <p style={{ color:"#555", fontSize:"12px", margin:"0 0 20px" }}>These values are used across all pages — WhatsApp buttons, footer, contact page, and product modals.</p>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
                <div style={{ gridColumn:"1 / -1" }}>
                  <label style={{ color:"#888", fontSize:"11px", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:"6px" }}>
                    WhatsApp Number <span style={{ color:"#444", fontWeight:400, textTransform:"none", letterSpacing:0 }}>(for wa.me links — include country code, no + or spaces)</span>
                  </label>
                  <input value={storeCfg.whatsappNumber} onChange={e => Fs("whatsappNumber")(e.target.value.replace(/\D/g,""))} placeholder="918349570000" style={{ ...iStyle, marginBottom:"14px" }} />
                </div>
                <div style={{ gridColumn:"1 / -1" }}>
                  <label style={{ color:"#888", fontSize:"11px", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:"6px" }}>
                    Phone Numbers <span style={{ color:"#444", fontWeight:400, textTransform:"none", letterSpacing:0 }}>(all numbers shown on contact page and footer)</span>
                  </label>
                  {(storeCfg.phoneNumbers || []).map((ph, i) => (
                    <div key={i} style={{ display:"flex", gap:"8px", marginBottom:"8px", alignItems:"center" }}>
                      <input value={ph.label||''} onChange={e => {
                        const arr = storeCfg.phoneNumbers.map((p,j) => j===i?{...p,label:e.target.value}:p);
                        setStoreCfg(s => ({...s, phoneNumbers:arr}));
                      }} placeholder="Label (e.g. Main, Sales)" style={{ ...iStyle, width:"130px", flexShrink:0 }} />
                      <input value={ph.number||''} onChange={e => {
                        const arr = storeCfg.phoneNumbers.map((p,j) => j===i?{...p,number:e.target.value}:p);
                        setStoreCfg(s => ({...s, phoneNumbers:arr}));
                      }} placeholder="+91 XXXXX XXXXX" style={{ ...iStyle, flex:1 }} />
                      <button onClick={() => {
                        const arr = storeCfg.phoneNumbers.filter((_,j) => j!==i);
                        const n = {...storeCfg, phoneNumbers:arr};
                        setStoreCfg(n); saveStoreConfig(n);
                      }} style={{ color:"#ff4444", background:"none", border:"none", fontSize:"18px", cursor:"pointer", lineHeight:1, padding:"0 4px", flexShrink:0 }}>✕</button>
                    </div>
                  ))}
                  <button onClick={() => {
                    const arr = [...(storeCfg.phoneNumbers||[]), {label:'',number:''}];
                    setStoreCfg(s => ({...s, phoneNumbers:arr}));
                  }} style={{ width:"100%", padding:"8px", background:"#0d0d0d", border:"1px dashed #2a2a2a", borderRadius:"8px", color:"#888", cursor:"pointer", fontSize:"12px", marginBottom:"14px" }}>
                    ＋ Add Phone Number
                  </button>
                </div>
                <div>
                  <label style={{ color:"#888", fontSize:"11px", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:"6px" }}>Address Line 1</label>
                  <input value={storeCfg.addressLine1} onChange={e => Fs("addressLine1")(e.target.value)} placeholder="Jail Road, Indore" style={{ ...iStyle, marginBottom:"14px" }} />
                </div>
                <div>
                  <label style={{ color:"#888", fontSize:"11px", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:"6px" }}>Address Line 2</label>
                  <input value={storeCfg.addressLine2} onChange={e => Fs("addressLine2")(e.target.value)} placeholder="Madhya Pradesh — 452 001" style={{ ...iStyle, marginBottom:"14px" }} />
                </div>
                <div>
                  <label style={{ color:"#888", fontSize:"11px", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:"6px" }}>Store Hours (full)</label>
                  <input value={storeCfg.storeHours} onChange={e => Fs("storeHours")(e.target.value)} placeholder="Monday – Sunday, 10:00 AM – 8:00 PM" style={{ ...iStyle, marginBottom:"14px" }} />
                </div>
                <div>
                  <label style={{ color:"#888", fontSize:"11px", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:"6px" }}>Store Hours (short)</label>
                  <input value={storeCfg.storeHoursShort} onChange={e => Fs("storeHoursShort")(e.target.value)} placeholder="10AM – 8PM" style={{ ...iStyle, marginBottom:"14px" }} />
                </div>
              </div>

              <Btn onClick={() => saveStore({...storeCfg})}>Save Contact Details</Btn>
            </div>

            {/* ── Social Media ── */}
            <div style={{ background:"#111", border:"1px solid #1e1e1e", borderRadius:"14px", padding:"24px", marginBottom:"14px" }}>
              <h3 style={{ margin:"0 0 4px", fontSize:"15px", fontWeight:700 }}>📸 Social Media</h3>
              <p style={{ color:"#555", fontSize:"12px", margin:"0 0 20px" }}>Shown in the Instagram section on the home page.</p>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
                <div>
                  <label style={{ color:"#888", fontSize:"11px", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:"6px" }}>Instagram Handle <span style={{ color:"#444", fontWeight:400, textTransform:"none", letterSpacing:0 }}>(without @)</span></label>
                  <input value={storeCfg.instagramHandle} onChange={e => Fs("instagramHandle")(e.target.value.replace(/^@/,""))} placeholder="apexmobileindia" style={{ ...iStyle, marginBottom:"14px" }} />
                </div>
                <div>
                  <label style={{ color:"#888", fontSize:"11px", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:"6px" }}>Instagram URL</label>
                  <input value={storeCfg.instagramUrl} onChange={e => Fs("instagramUrl")(e.target.value)} placeholder="https://instagram.com/..." style={{ ...iStyle, marginBottom:"14px" }} />
                </div>
              </div>

              <Btn onClick={() => saveStore({...storeCfg})}>Save Social</Btn>
            </div>

            {/* ── Store Photos ── */}
            <div style={{ background:"#111", border:"1px solid #1e1e1e", borderRadius:"14px", padding:"24px", marginBottom:"14px" }}>
              <h3 style={{ margin:"0 0 4px", fontSize:"15px", fontWeight:700 }}>🏪 Store Photos</h3>
              <p style={{ color:"#555", fontSize:"12px", margin:"0 0 20px" }}>Photos shown in the "Visit Us" section on the home page. Add multiple for a gallery layout.</p>

              {/* Existing photos with reorder */}
              {(() => {
                const photos = Array.isArray(storeCfg.storePhotos) && storeCfg.storePhotos.length
                  ? storeCfg.storePhotos
                  : (storeCfg.storePhoto ? [storeCfg.storePhoto] : []);
                const reorder = (from, to) => {
                  const arr = [...photos];
                  const [item] = arr.splice(from, 1);
                  arr.splice(to, 0, item);
                  const n = {...storeCfg, storePhotos: arr, storePhoto: ''};
                  setStoreCfg(n); saveStoreConfig(n); syncStoreConfig(n);
                };
                return photos.length > 0 ? (
                  <div style={{ marginBottom:"14px" }}>
                    <p style={{ color:"#555", fontSize:"11px", marginBottom:"10px" }}>Drag order: use arrows to reorder. First photo shows first in the slider.</p>
                    <div style={{ display:"flex", gap:"10px", flexWrap:"wrap" }}>
                      {photos.map((ph, idx) => (
                        <div key={idx} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"4px" }}>
                          <div style={{ position:"relative", width:"120px", height:"84px", borderRadius:"10px", overflow:"hidden", border:"1px solid #2a2a2a", flexShrink:0 }}>
                            <img src={getStoreImage(ph)} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>{e.target.style.display="none";}} />
                            <button onClick={() => {
                              const n = {...storeCfg, storePhotos: photos.filter((_,k)=>k!==idx), storePhoto:''};
                              setStoreCfg(n); saveStoreConfig(n); syncStoreConfig(n);
                            }} style={{ position:"absolute", top:"4px", right:"4px", width:"20px", height:"20px", borderRadius:"50%", background:"rgba(0,0,0,0.75)", border:"none", color:"#fff", fontSize:"11px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
                            <div style={{ position:"absolute", bottom:"3px", left:"5px", color:"#fff", fontSize:"10px", fontWeight:600, textShadow:"0 1px 2px rgba(0,0,0,0.8)" }}>{idx+1}</div>
                          </div>
                          {/* Reorder buttons */}
                          <div style={{ display:"flex", gap:"4px" }}>
                            <button disabled={idx === 0} onClick={() => reorder(idx, idx - 1)} style={{ background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:"5px", color: idx===0?"#333":"#888", cursor:idx===0?"not-allowed":"pointer", fontSize:"13px", padding:"2px 7px", lineHeight:1 }}>←</button>
                            <button disabled={idx === photos.length - 1} onClick={() => reorder(idx, idx + 1)} style={{ background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:"5px", color:idx===photos.length-1?"#333":"#888", cursor:idx===photos.length-1?"not-allowed":"pointer", fontSize:"13px", padding:"2px 7px", lineHeight:1 }}>→</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}

              <button onClick={() => storePhotoRef.current?.click()} style={{ width:"100%", padding:"10px", background:"#1a1a1a", border:"1px dashed #3a3a3a", borderRadius:"8px", color:"#888", cursor:"pointer", fontSize:"13px", marginBottom:"12px", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px" }}>
                📁 Add Store Photo
              </button>
              <input ref={storePhotoRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleStorePhotoUpload} />
              <Btn onClick={() => saveStore({...storeCfg})}>Save Store Photos</Btn>
            </div>

            {/* ── Trust Stats ── */}
            <div style={{ background:"#111", border:"1px solid #1e1e1e", borderRadius:"14px", padding:"24px", marginBottom:"14px" }}>
              <h3 style={{ margin:"0 0 4px", fontSize:"15px", fontWeight:700 }}>📊 Trust Stats</h3>
              <p style={{ color:"#555", fontSize:"12px", margin:"0 0 20px" }}>The four big numbers on the home page. Leave "Number" blank on any card to auto-count brands from your product list.</p>

              {storeCfg.trustStats.map((stat, i) => (
                <div key={i} style={{ background:"#0d0d0d", borderRadius:"10px", padding:"14px 16px", marginBottom:"10px", border:"1px solid #1a1a1a", display:"grid", gridTemplateColumns:"120px 1fr", gap:"0 12px", alignItems:"end" }}>
                  <div>
                    <label style={{ color:"#888", fontSize:"10px", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:"4px" }}>Number</label>
                    <input value={stat.num} onChange={e => {
                      const arr = storeCfg.trustStats.map((s,j) => j===i?{...s,num:e.target.value}:s);
                      setStoreCfg(c => ({...c, trustStats:arr}));
                    }} placeholder="e.g. 30+" style={{ ...iStyle }} />
                  </div>
                  <div>
                    <label style={{ color:"#888", fontSize:"10px", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:"4px" }}>Label</label>
                    <input value={stat.label} onChange={e => {
                      const arr = storeCfg.trustStats.map((s,j) => j===i?{...s,label:e.target.value}:s);
                      setStoreCfg(c => ({...c, trustStats:arr}));
                    }} placeholder="e.g. Years of trust" style={{ ...iStyle }} />
                  </div>
                </div>
              ))}

              <Btn onClick={() => saveStore({...storeCfg})}>Save Stats</Btn>
            </div>

            {/* ── Testimonials ── */}
            <div style={{ background:"#111", border:"1px solid #1e1e1e", borderRadius:"14px", padding:"24px", marginBottom:"14px" }}>
              <h3 style={{ margin:"0 0 4px", fontSize:"15px", fontWeight:700 }}>💬 Testimonials</h3>
              <p style={{ color:"#555", fontSize:"12px", margin:"0 0 20px" }}>Customer reviews shown in the "Loved in Indore" section on the home page.</p>

              {storeCfg.testimonials.map((t, i) => (
                <div key={i} style={{ background:"#0d0d0d", borderRadius:"10px", padding:"16px", marginBottom:"12px", border:"1px solid #1a1a1a" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"10px" }}>
                    <span style={{ color:"#888", fontSize:"10px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em" }}>Review {i + 1}</span>
                    <button onClick={() => setStoreCfg(c => ({...c, testimonials:c.testimonials.filter((_,j) => j!==i)}))} style={{ background:"none", border:"none", color:"#ff4444", fontSize:"11px", cursor:"pointer", padding:"2px 6px" }}>Remove</button>
                  </div>
                  <div style={{ marginBottom:"8px" }}>
                    <label style={{ color:"#888", fontSize:"10px", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:"4px" }}>Quote</label>
                    <textarea value={t.quote} onChange={e => {
                      const arr = storeCfg.testimonials.map((x,j) => j===i?{...x,quote:e.target.value}:x);
                      setStoreCfg(c => ({...c, testimonials:arr}));
                    }} rows={3} style={{ ...iStyle, resize:"vertical", lineHeight:"1.6" }} />
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 12px" }}>
                    <div>
                      <label style={{ color:"#888", fontSize:"10px", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:"4px" }}>Name</label>
                      <input value={t.name} onChange={e => {
                        const arr = storeCfg.testimonials.map((x,j) => j===i?{...x,name:e.target.value}:x);
                        setStoreCfg(c => ({...c, testimonials:arr}));
                      }} placeholder="e.g. Priya Sharma" style={{ ...iStyle }} />
                    </div>
                    <div>
                      <label style={{ color:"#888", fontSize:"10px", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:"4px" }}>Location</label>
                      <input value={t.location || ""} onChange={e => {
                        const arr = storeCfg.testimonials.map((x,j) => j===i?{...x,location:e.target.value}:x);
                        setStoreCfg(c => ({...c, testimonials:arr}));
                      }} placeholder="Indore" style={{ ...iStyle }} />
                    </div>
                  </div>
                </div>
              ))}

              <div style={{ display:"flex", gap:"10px" }}>
                <Btn small color="#007aff" onClick={() => setStoreCfg(c => ({...c, testimonials:[...c.testimonials, {quote:"",name:"",location:"Indore"}]}))}>+ Add Review</Btn>
                <Btn onClick={() => saveStore({...storeCfg})}>Save Testimonials</Btn>
              </div>
            </div>

            {/* ── Shop by Category ── */}
            <div style={{ background:"#111", border:"1px solid #1e1e1e", borderRadius:"14px", padding:"24px", marginBottom:"14px" }}>
              <h3 style={{ margin:"0 0 4px", fontSize:"15px", fontWeight:700 }}>🗂️ Shop by Category Cards</h3>
              <p style={{ color:"#555", fontSize:"12px", margin:"0 0 20px" }}>Edit the category browse cards shown on the home page.</p>

              {storeCfg.categories.map((cat, i) => (
                <div key={i} style={{ background:"#0d0d0d", borderRadius:"10px", padding:"16px", marginBottom:"12px", border:"1px solid #1a1a1a" }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"12px" }}>
                    <span style={{ color:"#888", fontSize:"11px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em" }}>Card {i + 1}</span>
                    <button onClick={() => {
                      const cats = storeCfg.categories.filter((_,j) => j !== i);
                      const n = {...storeCfg, categories:cats};
                      setStoreCfg(n); saveStoreConfig(n);
                    }} style={{ color:"#ff4444", background:"none", border:"none", fontSize:"12px", cursor:"pointer", padding:0 }}>✕ Remove</button>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"72px 1fr", gap:"0 12px" }}>
                    <div>
                      <label style={{ color:"#888", fontSize:"10px", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:"4px" }}>Emoji</label>
                      <input value={cat.emoji||''} onChange={e => {
                        const cats = storeCfg.categories.map((c,j) => j===i?{...c,emoji:e.target.value}:c);
                        setStoreCfg(s => ({...s, categories:cats}));
                      }} style={{ ...iStyle, textAlign:"center", fontSize:"22px", padding:"8px" }} />
                    </div>
                    <div>
                      <label style={{ color:"#888", fontSize:"10px", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:"4px" }}>Title</label>
                      <input value={cat.label||''} onChange={e => {
                        const cats = storeCfg.categories.map((c,j) => j===i?{...c,label:e.target.value}:c);
                        setStoreCfg(s => ({...s, categories:cats}));
                      }} placeholder="e.g. iPhones & iPads" style={{ ...iStyle, marginBottom:"8px" }} />
                    </div>
                    <div style={{ gridColumn:"1 / -1" }}>
                      <label style={{ color:"#888", fontSize:"10px", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:"4px" }}>Subtitle</label>
                      <input value={cat.sub||''} onChange={e => {
                        const cats = storeCfg.categories.map((c,j) => j===i?{...c,sub:e.target.value}:c);
                        setStoreCfg(s => ({...s, categories:cats}));
                      }} placeholder="e.g. Latest Apple lineup" style={{ ...iStyle, marginBottom:"10px" }} />
                    </div>
                    <div style={{ gridColumn:"1 / -1" }}>
                      <label style={{ color:"#888", fontSize:"10px", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:"4px" }}>
                        Link <span style={{ color:"#444", fontWeight:400, textTransform:"none", letterSpacing:0 }}>(leave blank to link to the filtered products page)</span>
                      </label>
                      <input value={cat.link||''} onChange={e => {
                        const cats = storeCfg.categories.map((c,j) => j===i?{...c,link:e.target.value}:c);
                        setStoreCfg(s => ({...s, categories:cats}));
                      }} placeholder="e.g. /products or https://..." style={{ ...iStyle, marginBottom:"10px" }} />
                    </div>
                    <div style={{ gridColumn:"1 / -1" }}>
                      <label style={{ color:"#888", fontSize:"10px", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:"6px" }}>
                        Card Images <span style={{ color:"#444", fontWeight:400, textTransform:"none", letterSpacing:0 }}>— 1 image: full cover · 2 images: side-by-side</span>
                      </label>
                      {/* Existing images */}
                      {(() => {
                        const imgs = Array.isArray(cat.images) && cat.images.length ? cat.images : (cat.image ? [cat.image] : []);
                        return imgs.length > 0 ? (
                          <div style={{ display:"flex", gap:"8px", marginBottom:"10px", flexWrap:"wrap" }}>
                            {imgs.map((img, imgIdx) => (
                              <div key={imgIdx} style={{ position:"relative", width:"88px", height:"62px", borderRadius:"8px", overflow:"hidden", border:"1px solid #2a2a2a", flexShrink:0 }}>
                                <img src={getStoreImage(img)} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>{e.target.style.display="none";}} />
                                <button onClick={() => {
                                  const allImgs = Array.isArray(cat.images) && cat.images.length ? cat.images : (cat.image ? [cat.image] : []);
                                  const newImgs = allImgs.filter((_,k) => k !== imgIdx);
                                  const cats = storeCfg.categories.map((c,j) => j===i ? {...c, images:newImgs, image:''} : c);
                                  const n = {...storeCfg, categories:cats};
                                  setStoreCfg(n); saveStoreConfig(n);
                                }} style={{ position:"absolute", top:"2px", right:"2px", width:"18px", height:"18px", borderRadius:"50%", background:"rgba(0,0,0,0.7)", border:"none", color:"#fff", fontSize:"10px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", lineHeight:1 }}>✕</button>
                                <div style={{ position:"absolute", bottom:"2px", left:"4px", color:"#fff", fontSize:"9px", opacity:0.7 }}>{imgIdx + 1}</div>
                              </div>
                            ))}
                          </div>
                        ) : null;
                      })()}
                      <button onClick={() => catImgRefs.current[i]?.click()} style={{ width:"100%", padding:"8px", background:"#1a1a1a", border:"1px dashed #3a3a3a", borderRadius:"8px", color:"#888", cursor:"pointer", fontSize:"12px", display:"flex", alignItems:"center", justifyContent:"center", gap:"6px" }}>
                        📁 Add Image
                      </button>
                      <input ref={el => catImgRefs.current[i] = el} type="file" accept="image/*" style={{ display:"none" }} onChange={e => { handleCategoryImageUpload(i, e); }} />
                    </div>
                  </div>
                </div>
              ))}
              <div style={{ display:"flex", gap:"10px", flexWrap:"wrap" }}>
                <button onClick={() => {
                  const newCat = { label:'', emoji:'📦', filter:'', sub:'', images:[], link:'' };
                  const n = {...storeCfg, categories:[...storeCfg.categories, newCat]};
                  setStoreCfg(n);
                }} style={{ flex:1, minWidth:"140px", padding:"10px", background:"#0d0d0d", border:"1px dashed #3a3a3a", borderRadius:"8px", color:"#888", cursor:"pointer", fontSize:"13px", display:"flex", alignItems:"center", justifyContent:"center", gap:"6px" }}>
                  ＋ Add Card
                </button>
                <Btn onClick={() => saveStore({...storeCfg})}>Save Category Cards</Btn>
              </div>
            </div>

            {/* ── Google Maps ── */}
            <div style={{ background:"#111", border:"1px solid #1e1e1e", borderRadius:"14px", padding:"24px", marginBottom:"14px" }}>
              <h3 style={{ margin:"0 0 4px", fontSize:"15px", fontWeight:700 }}>🗺️ Google Maps</h3>
              <p style={{ color:"#555", fontSize:"12px", margin:"0 0 20px" }}>Add your Google Business Maps embed so customers can find you on the Contact page.</p>

              <label style={{ color:"#888", fontSize:"11px", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:"6px" }}>Maps Embed URL <span style={{ color:"#444", fontWeight:400, textTransform:"none", letterSpacing:0 }}>(Google Maps → Share → Embed a map → copy the src URL)</span></label>
              <input value={storeCfg.googleMapsEmbed} onChange={e => Fs("googleMapsEmbed")(e.target.value)} placeholder="https://www.google.com/maps/embed?pb=..." style={{ ...iStyle, marginBottom:"14px" }} />

              <label style={{ color:"#888", fontSize:"11px", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:"6px" }}>Directions Link</label>
              <input value={storeCfg.googleMapsLink} onChange={e => Fs("googleMapsLink")(e.target.value)} placeholder="https://maps.google.com/?q=..." style={{ ...iStyle, marginBottom:"16px" }} />

              {storeCfg.googleMapsEmbed ? (
                <div style={{ marginBottom:"16px", borderRadius:"10px", overflow:"hidden", border:"1px solid #2a2a2a" }}>
                  <iframe src={storeCfg.googleMapsEmbed} width="100%" height="200" style={{ border:0, display:"block" }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Store location" />
                </div>
              ) : (
                <div style={{ background:"#0d0d0d", borderRadius:"10px", padding:"32px", textAlign:"center", marginBottom:"16px", border:"1px dashed #2a2a2a" }}>
                  <div style={{ fontSize:"32px", marginBottom:"8px" }}>🗺️</div>
                  <div style={{ color:"#555", fontSize:"13px" }}>Paste a Google Maps embed URL above to preview</div>
                  <div style={{ color:"#333", fontSize:"11px", marginTop:"6px" }}>maps.google.com → search your store → Share → Embed a map → copy the src</div>
                </div>
              )}

              <Btn onClick={() => saveStore({...storeCfg})}>Save Maps Info</Btn>
            </div>

            {/* ── Change Password ── */}
            <ChangePasswordSection />
          </div>
        )}

        {/* ═══════════════════════════════ ABOUT ═══════════════════════════════ */}
        {tab === "about" && (
          <div style={{ maxWidth:"680px" }}>
            <h2 style={{ fontSize:"20px", fontWeight:700, marginBottom:"6px" }}>📖 About Page</h2>
            <p style={{ color:"#555", fontSize:"13px", margin:"0 0 28px" }}>Edit your story, services, and values shown on the About page.</p>

            {/* ── Hero section ── */}
            <div style={{ background:"#111", border:"1px solid #1e1e1e", borderRadius:"14px", padding:"24px", marginBottom:"14px" }}>
              <h3 style={{ margin:"0 0 4px", fontSize:"15px", fontWeight:700 }}>🌟 Hero Section</h3>
              <p style={{ color:"#555", fontSize:"12px", margin:"0 0 20px" }}>The big headline and subtext at the top of the About page.</p>

              <label style={{ color:"#888", fontSize:"11px", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:"6px" }}>Headline <span style={{ color:"#444", fontWeight:400, textTransform:"none", letterSpacing:0 }}>(use \n for a line break)</span></label>
              <input value={storeCfg.aboutHeadline} onChange={e => Fs("aboutHeadline")(e.target.value)} placeholder="Three decades.\nOne promise." style={{ ...iStyle, marginBottom:"14px" }} />

              <label style={{ color:"#888", fontSize:"11px", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:"6px" }}>Subtext</label>
              <textarea value={storeCfg.aboutSub} onChange={e => Fs("aboutSub")(e.target.value)} placeholder="Honest advice, genuine products…" rows={2} style={{ ...iStyle, resize:"vertical", lineHeight:"1.6", marginBottom:"16px" }} />

              <Btn onClick={() => saveStore({...storeCfg})}>Save Hero</Btn>
            </div>

            {/* ── Our Story ── */}
            <div style={{ background:"#111", border:"1px solid #1e1e1e", borderRadius:"14px", padding:"24px", marginBottom:"14px" }}>
              <h3 style={{ margin:"0 0 4px", fontSize:"15px", fontWeight:700 }}>📝 Our Story</h3>
              <p style={{ color:"#555", fontSize:"12px", margin:"0 0 20px" }}>The body paragraphs in the story section. Each box is one paragraph.</p>

              {storeCfg.aboutStory.map((para, i) => (
                <div key={i} style={{ marginBottom:"12px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"4px" }}>
                    <label style={{ color:"#888", fontSize:"10px", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase" }}>Paragraph {i + 1}</label>
                    <button onClick={() => {
                      const arr = storeCfg.aboutStory.filter((_,j) => j!==i);
                      setStoreCfg(s => ({...s, aboutStory:arr}));
                    }} style={{ background:"none", border:"none", color:"#ff4444", fontSize:"11px", cursor:"pointer", padding:"2px 6px" }}>Remove</button>
                  </div>
                  <textarea value={para} onChange={e => {
                    const arr = storeCfg.aboutStory.map((p,j) => j===i?e.target.value:p);
                    setStoreCfg(s => ({...s, aboutStory:arr}));
                  }} rows={3} style={{ ...iStyle, resize:"vertical", lineHeight:"1.6" }} />
                </div>
              ))}
              <div style={{ display:"flex", gap:"10px", marginTop:"4px" }}>
                <Btn small color="#007aff" onClick={() => setStoreCfg(s => ({...s, aboutStory:[...s.aboutStory, ""]}) )}>+ Add Paragraph</Btn>
                <Btn onClick={() => saveStore({...storeCfg})}>Save Story</Btn>
              </div>
            </div>

            {/* ── Stats box ── */}
            <div style={{ background:"#111", border:"1px solid #1e1e1e", borderRadius:"14px", padding:"24px", marginBottom:"14px" }}>
              <h3 style={{ margin:"0 0 4px", fontSize:"15px", fontWeight:700 }}>📊 Stats Box</h3>
              <p style={{ color:"#555", fontSize:"12px", margin:"0 0 20px" }}>The card with your headline number and bullet facts.</p>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
                <div>
                  <label style={{ color:"#888", fontSize:"11px", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:"6px" }}>Main Stat</label>
                  <input value={storeCfg.aboutStat} onChange={e => Fs("aboutStat")(e.target.value)} placeholder="30+" style={{ ...iStyle, marginBottom:"14px" }} />
                </div>
                <div>
                  <label style={{ color:"#888", fontSize:"11px", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:"6px" }}>Stat Label</label>
                  <input value={storeCfg.aboutStatLabel} onChange={e => Fs("aboutStatLabel")(e.target.value)} placeholder="Years Serving Indore" style={{ ...iStyle, marginBottom:"14px" }} />
                </div>
              </div>

              <label style={{ color:"#888", fontSize:"11px", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:"8px" }}>Bullet Facts</label>
              {storeCfg.aboutStatItems.map((item, i) => (
                <div key={i} style={{ display:"flex", gap:"8px", marginBottom:"8px" }}>
                  <input value={item} onChange={e => {
                    const arr = storeCfg.aboutStatItems.map((x,j) => j===i?e.target.value:x);
                    setStoreCfg(s => ({...s, aboutStatItems:arr}));
                  }} placeholder="e.g. 📍 Jail Road, Indore — Since 1996" style={{ ...iStyle, flex:1 }} />
                  <button onClick={() => setStoreCfg(s => ({...s, aboutStatItems:s.aboutStatItems.filter((_,j) => j!==i)}))} style={{ background:"#ff444422", border:"1px solid #ff444444", borderRadius:"6px", color:"#ff4444", cursor:"pointer", padding:"6px 10px", fontSize:"12px", whiteSpace:"nowrap" }}>✕</button>
                </div>
              ))}
              <div style={{ display:"flex", gap:"10px", marginTop:"8px" }}>
                <Btn small color="#007aff" onClick={() => setStoreCfg(s => ({...s, aboutStatItems:[...s.aboutStatItems, ""]}))}>+ Add Fact</Btn>
                <Btn onClick={() => saveStore({...storeCfg})}>Save Stats</Btn>
              </div>
            </div>

            {/* ── Values ── */}
            <div style={{ background:"#111", border:"1px solid #1e1e1e", borderRadius:"14px", padding:"24px", marginBottom:"14px" }}>
              <h3 style={{ margin:"0 0 4px", fontSize:"15px", fontWeight:700 }}>💡 Our Values</h3>
              <p style={{ color:"#555", fontSize:"12px", margin:"0 0 20px" }}>The four principle cards.</p>

              {storeCfg.aboutValues.map((val, i) => (
                <div key={i} style={{ background:"#0d0d0d", borderRadius:"10px", padding:"16px", marginBottom:"12px", border:"1px solid #1a1a1a" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"10px" }}>
                    <span style={{ color:"#888", fontSize:"10px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em" }}>Value {i + 1}</span>
                    <button onClick={() => setStoreCfg(s => ({...s, aboutValues:s.aboutValues.filter((_,j) => j!==i)}))} style={{ background:"none", border:"none", color:"#ff4444", fontSize:"11px", cursor:"pointer", padding:"2px 6px" }}>Remove</button>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"72px 1fr", gap:"0 12px" }}>
                    <div>
                      <label style={{ color:"#888", fontSize:"10px", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:"4px" }}>Icon</label>
                      <input value={val.icon} onChange={e => {
                        const arr = storeCfg.aboutValues.map((v,j) => j===i?{...v,icon:e.target.value}:v);
                        setStoreCfg(s => ({...s, aboutValues:arr}));
                      }} style={{ ...iStyle, textAlign:"center", fontSize:"22px", padding:"8px" }} />
                    </div>
                    <div>
                      <label style={{ color:"#888", fontSize:"10px", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:"4px" }}>Title</label>
                      <input value={val.title} onChange={e => {
                        const arr = storeCfg.aboutValues.map((v,j) => j===i?{...v,title:e.target.value}:v);
                        setStoreCfg(s => ({...s, aboutValues:arr}));
                      }} placeholder="e.g. Honest Advice" style={{ ...iStyle, marginBottom:"8px" }} />
                    </div>
                    <div style={{ gridColumn:"1 / -1" }}>
                      <label style={{ color:"#888", fontSize:"10px", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:"4px" }}>Description</label>
                      <textarea value={val.desc} onChange={e => {
                        const arr = storeCfg.aboutValues.map((v,j) => j===i?{...v,desc:e.target.value}:v);
                        setStoreCfg(s => ({...s, aboutValues:arr}));
                      }} rows={2} style={{ ...iStyle, resize:"vertical", lineHeight:"1.5" }} />
                    </div>
                  </div>
                </div>
              ))}
              <div style={{ display:"flex", gap:"10px" }}>
                <Btn small color="#007aff" onClick={() => setStoreCfg(s => ({...s, aboutValues:[...s.aboutValues, {icon:"⭐",title:"",desc:""}]}))}>+ Add Value</Btn>
                <Btn onClick={() => saveStore({...storeCfg})}>Save Values</Btn>
              </div>
            </div>

            {/* ── Services ── */}
            <div style={{ background:"#111", border:"1px solid #1e1e1e", borderRadius:"14px", padding:"24px", marginBottom:"14px" }}>
              <h3 style={{ margin:"0 0 4px", fontSize:"15px", fontWeight:700 }}>🛠️ Service Offerings</h3>
              <p style={{ color:"#555", fontSize:"12px", margin:"0 0 20px" }}>List the services your store provides — repairs, trade-ins, EMI, etc.</p>

              {storeCfg.aboutServices.length === 0 && (
                <div style={{ background:"#0d0d0d", borderRadius:"10px", padding:"32px", textAlign:"center", marginBottom:"16px", border:"1px dashed #2a2a2a" }}>
                  <div style={{ fontSize:"32px", marginBottom:"8px" }}>🛠️</div>
                  <div style={{ color:"#555", fontSize:"13px" }}>No services added yet. Click "+ Add Service" to get started.</div>
                </div>
              )}

              {storeCfg.aboutServices.map((svc, i) => (
                <div key={i} style={{ background:"#0d0d0d", borderRadius:"10px", padding:"16px", marginBottom:"12px", border:"1px solid #1a1a1a" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"10px" }}>
                    <span style={{ color:"#888", fontSize:"10px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em" }}>Service {i + 1}</span>
                    <button onClick={() => setStoreCfg(s => ({...s, aboutServices:s.aboutServices.filter((_,j) => j!==i)}))} style={{ background:"none", border:"none", color:"#ff4444", fontSize:"11px", cursor:"pointer", padding:"2px 6px" }}>Remove</button>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"72px 1fr", gap:"0 12px" }}>
                    <div>
                      <label style={{ color:"#888", fontSize:"10px", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:"4px" }}>Icon</label>
                      <input value={svc.icon} onChange={e => {
                        const arr = storeCfg.aboutServices.map((v,j) => j===i?{...v,icon:e.target.value}:v);
                        setStoreCfg(s => ({...s, aboutServices:arr}));
                      }} style={{ ...iStyle, textAlign:"center", fontSize:"22px", padding:"8px" }} />
                    </div>
                    <div>
                      <label style={{ color:"#888", fontSize:"10px", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:"4px" }}>Service Name</label>
                      <input value={svc.title} onChange={e => {
                        const arr = storeCfg.aboutServices.map((v,j) => j===i?{...v,title:e.target.value}:v);
                        setStoreCfg(s => ({...s, aboutServices:arr}));
                      }} placeholder="e.g. Screen Repair, EMI Available" style={{ ...iStyle, marginBottom:"8px" }} />
                    </div>
                    <div style={{ gridColumn:"1 / -1" }}>
                      <label style={{ color:"#888", fontSize:"10px", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:"4px" }}>Details</label>
                      <textarea value={svc.desc} onChange={e => {
                        const arr = storeCfg.aboutServices.map((v,j) => j===i?{...v,desc:e.target.value}:v);
                        setStoreCfg(s => ({...s, aboutServices:arr}));
                      }} rows={2} style={{ ...iStyle, resize:"vertical", lineHeight:"1.5" }} />
                    </div>
                  </div>
                </div>
              ))}
              <div style={{ display:"flex", gap:"10px" }}>
                <Btn small color="#007aff" onClick={() => setStoreCfg(s => ({...s, aboutServices:[...s.aboutServices, {icon:"🛠️",title:"",desc:""}]}))}>+ Add Service</Btn>
                <Btn onClick={() => saveStore({...storeCfg})}>Save Services</Btn>
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
