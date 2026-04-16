import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const DEFAULT_PASSWORD = "Apex@2024#Secret";
const PW_KEY = "apex_admin_password";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const navigate = useNavigate();

  // Fetch current password from repo so it works on every browser/device
  useEffect(() => {
    fetch("/admin-password.json?v=" + Date.now())
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.password) localStorage.setItem(PW_KEY, d.password); })
      .catch(() => {});
  }, []);

  const getPassword = () => localStorage.getItem(PW_KEY) || DEFAULT_PASSWORD;

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (password === getPassword()) {
        localStorage.setItem("apex_admin_auth", "true");
        navigate("/admin/dashboard");
      } else {
        setError("Incorrect password. Try again.");
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div style={{minHeight:"100vh",background:"#0a0a0a",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'-apple-system, BlinkMacSystemFont, sans-serif'"}}>
      <div style={{background:"#111",border:"1px solid #222",borderRadius:"20px",padding:"48px",width:"100%",maxWidth:"400px",boxShadow:"0 40px 80px rgba(0,0,0,0.6)"}}>
        <div style={{textAlign:"center",marginBottom:"40px"}}>
          <div style={{width:"60px",height:"60px",background:"linear-gradient(135deg,#00c851,#007e33)",borderRadius:"16px",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:"28px"}}>⚡</div>
          <h1 style={{color:"#fff",fontSize:"22px",fontWeight:700,margin:0}}>Apex Admin</h1>
          <p style={{color:"#666",fontSize:"13px",marginTop:"6px"}}>Restricted Access Only</p>
        </div>
        <form onSubmit={handleLogin}>
          <div style={{marginBottom:"20px"}}>
            <label style={{color:"#888",fontSize:"12px",fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",display:"block",marginBottom:"8px"}}>Admin Password</label>
            <input type="password" value={password} onChange={e=>{setPassword(e.target.value);setError("");}} placeholder="Enter password" style={{width:"100%",padding:"14px 16px",background:"#1a1a1a",border:error?"1px solid #ff4444":"1px solid #2a2a2a",borderRadius:"10px",color:"#fff",fontSize:"15px",outline:"none",boxSizing:"border-box"}} autoFocus />
            {error && <p style={{color:"#ff4444",fontSize:"12px",marginTop:"8px"}}>{error}</p>}
          </div>
          <button type="submit" disabled={loading||!password} style={{width:"100%",padding:"14px",background:loading?"#333":"linear-gradient(135deg,#00c851,#007e33)",border:"none",borderRadius:"10px",color:"#fff",fontSize:"15px",fontWeight:600,cursor:loading?"not-allowed":"pointer"}}>
            {loading?"Verifying...":"Enter Admin Panel →"}
          </button>
        </form>
        <p style={{color:"#333",fontSize:"11px",textAlign:"center",marginTop:"32px"}}>This page is not linked anywhere on the website</p>
      </div>
    </div>
  );
}
