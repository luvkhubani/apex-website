import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { products as defaultProducts } from "../data/products";

const STORAGE_KEY = "apex_products_override";
const AUTH_KEY = "apex_admin_auth";

function loadProducts() {
  try { const s = localStorage.getItem(STORAGE_KEY); if (s) return JSON.parse(s); } catch(_) {}
  return defaultProducts;
}
function saveProducts(p) { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); }

const BRANDS = ["Apple","Samsung","OnePlus","Nothing","Motorola","Xiaomi","Realme","Vivo","OPPO","Poco","Infinix","Tecno","AI Plus","Jio","Nokia"];
const CATEGORIES = ["Mobiles","Tablets","Laptops","Accessories"];
const BADGES = ["","5G","New","Hot","Sale","Flagship"];
const emptyProduct = { name:"", brand:"Apple", category:"Mobiles", ram:"", storage:"", color:"", price:"", originalPrice:"", badge:"5G", inStock:true, image:"" };

const iStyle = { width:"100%", padding:"10px 12px", background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:"8px", color:"#fff", fontSize:"13px", outline:"none", boxSizing:"border-box", fontFamily:"inherit" };

const Btn = ({children,onClick,color="#00c851",small,danger,disabled,style:s}) => (
  <button onClick={onClick} disabled={disabled} style={{background:danger?"#ff444422":color==="ghost"?"transparent":color+"22",color:danger?"#ff4444":color==="ghost"?"#888":color,border:`1px solid ${danger?"#ff444444":color==="ghost"?"#333":color+"44"}`,borderRadius:"8px",padding:small?"6px 12px":"10px 18px",fontSize:small?"12px":"13px",fontWeight:600,cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.5:1,transition:"all 0.15s",whiteSpace:"nowrap",...s}}>{children}</button>
);

const FInput = ({label,value,onChange,type="text",placeholder,options,required}) => (
  <div style={{marginBottom:"14px"}}>
    <label style={{color:"#888",fontSize:"11px",fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",display:"block",marginBottom:"6px"}}>{label}{required&&<span style={{color:"#ff4444"}}> *</span>}</label>
    {options
      ? <select value={value} onChange={e=>onChange(e.target.value)} style={iStyle}>{options.map(o=><option key={o} value={o}>{o||"— none —"}</option>)}</select>
      : <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={iStyle} />}
  </div>
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [products, setProducts] = useState(loadProducts);
  const [search, setSearch] = useState("");
  const [filterBrand, setFilterBrand] = useState("All");
  const [tab, setTab] = useState("products");
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => { if (!localStorage.getItem(AUTH_KEY)) navigate("/admin-apex-secret"); }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(""),3000); };
  const persist = (p) => { setProducts(p); saveProducts(p); };
  const F = (k) => (v) => setForm(f=>({...f,[k]:v}));

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    return (!q || p.name?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q) || p.color?.toLowerCase().includes(q))
      && (filterBrand==="All" || p.brand===filterBrand);
  });

  const grouped = filtered.reduce((acc,p) => {
    const k = p.brand+"||"+p.name;
    if(!acc[k]) acc[k]=[];
    acc[k].push(p);
    return acc;
  },{});

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      if (editId) {
        persist(products.map(p=>p.id===editId?{...form,id:editId,price:Number(form.price),originalPrice:Number(form.originalPrice)||Number(form.price)}:p));
        showToast("✅ Product updated!");
      } else {
        const newId = Math.max(0,...products.map(p=>p.id||0))+1;
        persist([...products,{...form,id:newId,price:Number(form.price),originalPrice:Number(form.originalPrice)||Number(form.price)}]);
        showToast("✅ Product added!");
      }
      setEditId(null); setForm(emptyProduct); setTab("products"); setSaving(false);
    },500);
  };

  const handleDelete = (id) => { if(!window.confirm("Delete this variant?")) return; persist(products.filter(p=>p.id!==id)); showToast("🗑️ Deleted."); };
  const handleDeleteModel = (brand,name) => { if(!window.confirm("Delete ALL variants of "+name+"?")) return; persist(products.filter(p=>!(p.brand===brand&&p.name===name))); showToast("🗑️ All "+name+" deleted."); };
  const handleToggleStock = (id) => persist(products.map(p=>p.id===id?{...p,inStock:!p.inStock}:p));
  const handlePriceBlur = (id,val) => persist(products.map(p=>p.id===id?{...p,price:Number(val)}:p));
  const startEdit = (p) => { setEditId(p.id); setForm({...p}); setTab("add"); };

  const totalModels = Object.keys(grouped).length;
  const brandCounts = BRANDS.map(b=>({brand:b,count:products.filter(p=>p.brand===b).length})).filter(x=>x.count>0);

  const hStyle = {background:"none",border:"none",padding:"14px 16px",fontSize:"13px",fontWeight:600,cursor:"pointer",transition:"all 0.15s"};

  return (
    <div style={{minHeight:"100vh",background:"#0a0a0a",color:"#fff",fontFamily:"-apple-system,BlinkMacSystemFont,sans-serif"}}>
      {toast && <div style={{position:"fixed",top:"20px",right:"20px",zIndex:9999,background:"#1a1a1a",border:"1px solid #2a2a2a",borderRadius:"10px",padding:"12px 20px",fontSize:"13px",fontWeight:600,color:"#fff",boxShadow:"0 8px 32px rgba(0,0,0,0.5)"}}>{toast}</div>}

      <div style={{background:"#111",borderBottom:"1px solid #222",padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",height:"60px",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"32px",height:"32px",background:"linear-gradient(135deg,#00c851,#007e33)",borderRadius:"8px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px"}}>⚡</div>
          <span style={{fontWeight:700,fontSize:"16px"}}>Apex Admin</span>
          <span style={{background:"#00c85122",color:"#00c851",border:"1px solid #00c85144",borderRadius:"6px",padding:"2px 8px",fontSize:"11px",fontWeight:600}}>LIVE</span>
        </div>
        <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
          <span style={{color:"#555",fontSize:"12px"}}>{products.length} variants · {Object.keys(products.reduce((a,p)=>{a[p.brand+"||"+p.name]=1;return a},{})).length} models</span>
          <Btn color="ghost" small onClick={()=>{localStorage.removeItem(AUTH_KEY);navigate("/admin-apex-secret");}}>Logout</Btn>
        </div>
      </div>

      <div style={{background:"#111",borderBottom:"1px solid #1a1a1a",padding:"0 24px",display:"flex",gap:"4px"}}>
        {[["products","📦 Products"],["add",editId?"✏️ Edit":"➕ Add Product"],["stats","📊 Stats"]].map(([t,label])=>(
          <button key={t} onClick={()=>{setTab(t);if(t!=="add"){setEditId(null);setForm(emptyProduct);}}} style={{...hStyle,color:tab===t?"#00c851":"#666",borderBottom:tab===t?"2px solid #00c851":"2px solid transparent"}}>{label}</button>
        ))}
      </div>

      <div style={{padding:"24px",maxWidth:"1200px",margin:"0 auto"}}>

        {tab==="products" && (
          <div>
            <div style={{display:"flex",gap:"12px",marginBottom:"20px",flexWrap:"wrap"}}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search name, brand, colour..." style={{...iStyle,flex:1,minWidth:"200px"}} />
              <select value={filterBrand} onChange={e=>setFilterBrand(e.target.value)} style={{...iStyle,width:"160px"}}>
                <option value="All">All Brands</option>
                {BRANDS.map(b=><option key={b} value={b}>{b}</option>)}
              </select>
              <Btn onClick={()=>setTab("add")}>+ Add Product</Btn>
            </div>

            {Object.entries(grouped).map(([key,variants])=>{
              const [brand,name]=key.split("||");
              const fi=variants.find(v=>v.image)||variants[0];
              return (
                <div key={key} style={{background:"#111",border:"1px solid #1e1e1e",borderRadius:"14px",marginBottom:"12px",overflow:"hidden"}}>
                  <div style={{padding:"14px 18px",display:"flex",alignItems:"center",gap:"14px",borderBottom:"1px solid #1a1a1a"}}>
                    <div style={{width:"44px",height:"44px",background:"#1a1a1a",borderRadius:"10px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"20px",flexShrink:0}}>
                      {fi?.image?<img src={"/src/assets/products/"+fi.image} alt={name} style={{width:"100%",height:"100%",objectFit:"contain"}} onError={e=>{e.target.style.display="none";}} />:"📱"}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:"15px"}}>{name}</div>
                      <div style={{color:"#666",fontSize:"12px"}}>{brand} · {variants.length} variant{variants.length>1?"s":""}</div>
                    </div>
                    <Btn small onClick={()=>{setForm({...emptyProduct,brand,name});setTab("add");}}>+ Variant</Btn>
                    <Btn small danger onClick={()=>handleDeleteModel(brand,name)}>Delete All</Btn>
                  </div>
                  <div style={{overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:"13px"}}>
                      <thead><tr style={{borderBottom:"1px solid #1a1a1a"}}>
                        {["RAM","Storage","Colour","Price (₹)","Badge","Stock","Actions"].map(h=>(
                          <th key={h} style={{padding:"10px 14px",color:"#555",fontWeight:600,textAlign:"left",whiteSpace:"nowrap"}}>{h}</th>
                        ))}
                      </tr></thead>
                      <tbody>
                        {variants.map(v=>(
                          <tr key={v.id} style={{borderBottom:"1px solid #141414"}}>
                            <td style={{padding:"10px 14px",color:"#ccc"}}>{v.ram||"—"}</td>
                            <td style={{padding:"10px 14px",color:"#ccc"}}>{v.storage||"—"}</td>
                            <td style={{padding:"10px 14px"}}>
                              <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                                <div style={{width:"12px",height:"12px",borderRadius:"50%",background:v.color?.toLowerCase()||"#888",border:"1px solid #333"}}/>
                                <span style={{color:"#ccc"}}>{v.color||"—"}</span>
                              </div>
                            </td>
                            <td style={{padding:"10px 14px"}}>
                              <input type="number" defaultValue={v.price} onBlur={e=>handlePriceBlur(v.id,e.target.value)} style={{...iStyle,width:"110px",padding:"6px 8px"}} />
                            </td>
                            <td style={{padding:"10px 14px"}}>
                              {v.badge?<span style={{background:"#007aff22",color:"#007aff",border:"1px solid #007aff44",borderRadius:"6px",padding:"2px 8px",fontSize:"11px",fontWeight:600}}>{v.badge}</span>:<span style={{color:"#444"}}>—</span>}
                            </td>
                            <td style={{padding:"10px 14px"}}>
                              <button onClick={()=>handleToggleStock(v.id)} style={{background:v.inStock?"#00c85122":"#ff444422",color:v.inStock?"#00c851":"#ff4444",border:`1px solid ${v.inStock?"#00c85144":"#ff444444"}`,borderRadius:"6px",padding:"4px 10px",fontSize:"11px",fontWeight:700,cursor:"pointer"}}>
                                {v.inStock?"In Stock":"Out"}
                              </button>
                            </td>
                            <td style={{padding:"10px 14px"}}>
                              <div style={{display:"flex",gap:"6px"}}>
                                <Btn small onClick={()=>startEdit(v)}>Edit</Btn>
                                <Btn small danger onClick={()=>handleDelete(v.id)}>Del</Btn>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
            {filtered.length===0&&<div style={{textAlign:"center",padding:"60px",color:"#444"}}><div style={{fontSize:"40px",marginBottom:"12px"}}>📭</div>No products found</div>}
          </div>
        )}

        {tab==="add" && (
          <div style={{maxWidth:"600px"}}>
            <h2 style={{fontSize:"20px",fontWeight:700,marginBottom:"24px"}}>{editId?"✏️ Edit Product":"➕ Add New Product"}</h2>
            <div style={{background:"#111",border:"1px solid #1e1e1e",borderRadius:"14px",padding:"24px"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
                <div style={{gridColumn:"1 / -1"}}><FInput label="Product Name" value={form.name} onChange={F("name")} placeholder="e.g. iPhone 16 Pro" required /></div>
                <FInput label="Brand" value={form.brand} onChange={F("brand")} options={BRANDS} required />
                <FInput label="Category" value={form.category} onChange={F("category")} options={CATEGORIES} />
                <FInput label="RAM" value={form.ram} onChange={F("ram")} placeholder="e.g. 8GB" />
                <FInput label="Storage" value={form.storage} onChange={F("storage")} placeholder="e.g. 256GB" />
                <FInput label="Colour" value={form.color} onChange={F("color")} placeholder="e.g. Titanium Black" required />
                <FInput label="Badge" value={form.badge} onChange={F("badge")} options={BADGES} />
                <FInput label="Price (₹)" type="number" value={form.price} onChange={F("price")} placeholder="e.g. 129900" required />
                <FInput label="Original Price (₹)" type="number" value={form.originalPrice} onChange={F("originalPrice")} placeholder="e.g. 139900" />
                <div style={{gridColumn:"1 / -1"}}><FInput label="Image Path" value={form.image} onChange={F("image")} placeholder="e.g. apple/iphone-16-pro/black.webp" /></div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"20px"}}>
                <button onClick={()=>setForm(f=>({...f,inStock:!f.inStock}))} style={{width:"44px",height:"24px",borderRadius:"12px",background:form.inStock?"#00c851":"#333",border:"none",cursor:"pointer",position:"relative",transition:"background 0.2s"}}>
                  <div style={{width:"18px",height:"18px",borderRadius:"50%",background:"#fff",position:"absolute",top:"3px",transition:"left 0.2s",left:form.inStock?"23px":"3px"}}/>
                </button>
                <span style={{color:"#ccc",fontSize:"13px"}}>{form.inStock?"In Stock":"Out of Stock"}</span>
              </div>
              <div style={{display:"flex",gap:"10px"}}>
                <Btn onClick={handleSave} disabled={saving||!form.name||!form.price||!form.color} style={{flex:1}}>{saving?"Saving...":editId?"Update Product":"Add Product"}</Btn>
                <Btn color="ghost" onClick={()=>{setTab("products");setEditId(null);setForm(emptyProduct);}}>Cancel</Btn>
              </div>
            </div>
            <div style={{background:"#111",border:"1px solid #1e1e1e",borderRadius:"14px",padding:"18px",marginTop:"16px"}}>
              <p style={{color:"#666",fontSize:"12px",margin:"0 0 8px",fontWeight:600}}>📁 IMAGE PATH FORMAT</p>
              <code style={{color:"#00c851",fontSize:"12px",background:"#0a1a0f",padding:"8px 12px",borderRadius:"6px",display:"block"}}>brand/model-folder/filename.webp</code>
              <p style={{color:"#555",fontSize:"11px",margin:"8px 0 0"}}>e.g. apple/iphone-16-pro/black.webp</p>
            </div>
          </div>
        )}

        {tab==="stats" && (
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:"14px",marginBottom:"24px"}}>
              {[{label:"Total Variants",value:products.length,color:"#007aff"},{label:"Total Models",value:Object.keys(products.reduce((a,p)=>{a[p.brand+"||"+p.name]=1;return a},{})).length,color:"#00c851"},{label:"In Stock",value:products.filter(p=>p.inStock).length,color:"#00c851"},{label:"Out of Stock",value:products.filter(p=>!p.inStock).length,color:"#ff4444"}].map(s=>(
                <div key={s.label} style={{background:"#111",border:"1px solid #1e1e1e",borderRadius:"14px",padding:"20px"}}>
                  <div style={{color:"#666",fontSize:"11px",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"8px"}}>{s.label}</div>
                  <div style={{color:s.color,fontSize:"32px",fontWeight:700}}>{s.value}</div>
                </div>
              ))}
            </div>
            <div style={{background:"#111",border:"1px solid #1e1e1e",borderRadius:"14px",padding:"20px"}}>
              <h3 style={{margin:"0 0 16px",fontSize:"14px",fontWeight:700,color:"#888"}}>VARIANTS BY BRAND</h3>
              {brandCounts.map(({brand,count})=>(
                <div key={brand} style={{marginBottom:"12px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}>
                    <span style={{fontSize:"13px",color:"#ccc"}}>{brand}</span>
                    <span style={{fontSize:"13px",color:"#666"}}>{count}</span>
                  </div>
                  <div style={{background:"#1a1a1a",borderRadius:"4px",height:"4px",overflow:"hidden"}}>
                    <div style={{background:"#00c851",height:"100%",width:((count/products.length)*100)+"%",borderRadius:"4px"}}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
