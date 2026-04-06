import React, { useState, useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { Eye, EyeOff, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API = `${import.meta.env.VITE_API_URL}/api/auth`;
const C = {
  cream:  "#f5f2eb",
  paper:  "#faf8f3",
  ink:    "#1a1714",
  muted:  "#8a8480",
  rule:   "#d8d2c8",
  amber:  "#c8892a",
  amberL: "#e8a83a",
  white:  "#ffffff",
};

const MODES = {
  login:    { title: "Tekrar hoş geldiniz",    sub: "Koleksiyonunuza erişin"   },
  register: { title: "Üyelik oluşturun",        sub: "Atölyemize katılın"       },
  forgot:   { title: "Erişimi kurtarın",        sub: "Şifre sıfırlama bağlantısı" },
};

const only = (str, pattern) => !str || pattern.test(str);


function LedgerInput({ label, name, type = "text", value, onChange, autoFocus, suffix }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative", marginBottom: 28 }}>
      <label style={{
        position: "absolute", top: focused || value ? -14 : 12, left: 0,
        fontSize: focused || value ? 9 : 13,
        letterSpacing: focused || value ? "0.2em" : "0.06em",
        textTransform: "uppercase",
        color: focused ? C.amber : C.muted,
        fontFamily: "'DM Mono', monospace",
        fontWeight: 500,
        transition: "all .22s cubic-bezier(.4,0,.2,1)",
        pointerEvents: "none",
      }}>{label}</label>

      <input
        name={name} type={type} value={value} onChange={onChange}
        autoFocus={autoFocus} required autoComplete="off"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%", background: "transparent", border: "none",
          borderBottom: `1.5px solid ${focused ? C.amber : C.rule}`,
          paddingBottom: 10, paddingTop: 4,
          fontSize: 15, fontFamily: "'DM Mono', monospace",
          color: C.ink, outline: "none",
          transition: "border-color .22s",
          paddingRight: suffix ? 36 : 0,
          letterSpacing: type === "password" ? "0.25em" : "0.02em",
        }}
      />
      {suffix && (
        <div style={{ position: "absolute", right: 0, bottom: 8 }}>{suffix}</div>
      )}
    </div>
  );
}

function PendantLamp({ lit }) {
  return (
    <svg viewBox="0 0 160 520" style={{ width: "100%", height: "100%" }} fill="none">
      <defs>
        <linearGradient id="cableG" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={C.rule} />
          <stop offset="50%" stopColor={C.muted} />
          <stop offset="100%" stopColor={C.rule} />
        </linearGradient>
        <linearGradient id="shadeG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c8c2b8" />
          <stop offset="100%" stopColor="#8a8480" />
        </linearGradient>
        <radialGradient id="bulbG" cx="42%" cy="35%">
          <stop offset="0%" stopColor={lit ? "#fff9e6" : "#ddd8d0"} />
          <stop offset="60%" stopColor={lit ? "#fbbf24" : "#b0a898"} />
          <stop offset="100%" stopColor={lit ? "#d97706" : "#8a8480"} />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation={lit ? "8" : "0"} result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="beamBlur">
          <feGaussianBlur stdDeviation="18" />
        </filter>
      </defs>

      <rect x="78" y="0" width="4" height="160" rx="2" fill="url(#cableG)" />

      <ellipse cx="80" cy="4" rx="22" ry="7" fill="#c8c2b8" />
      <ellipse cx="80" cy="2" rx="22" ry="5" fill="#ddd8d0" />

      <path d="M 30 240 L 15 160 Q 15 155 20 155 L 140 155 Q 145 155 145 160 L 130 240 Q 128 246 80 246 Q 32 246 30 240 Z"
        fill="url(#shadeG)" />
      <line x1="18" y1="175" x2="142" y2="175" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
      <line x1="21" y1="192" x2="139" y2="192" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <line x1="25" y1="210" x2="135" y2="210" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      <path d="M 35 240 L 23 168 Q 40 180 80 180 Q 120 180 137 168 L 125 240 Q 123 244 80 244 Q 37 244 35 240 Z"
        fill="rgba(255,255,255,0.04)" />
      <ellipse cx="80" cy="243" rx="50" ry="7" fill="#6b6560" />
      <ellipse cx="80" cy="241" rx="50" ry="5" fill="#7a7470" />

      <ellipse cx="80" cy="248" rx="16" ry="10" fill="#3d3a36" />

      <ellipse cx="80" cy="260" rx="24" ry="18" fill="url(#bulbG)" filter="url(#glow)" />
      {lit && (
        <path d="M 72 260 Q 76 255 80 260 Q 84 265 88 260" stroke="#fff9e6" strokeWidth="1" fill="none" opacity="0.6" />
      )}
      <ellipse cx="74" cy="254" rx="6" ry="4" fill="rgba(255,255,255,0.3)" />

      {lit && (
        <ellipse cx="80" cy="440" rx="95" ry="80"
          fill={C.amberL} opacity="0.07" filter="url(#beamBlur)" />
      )}
      {lit && (
        <path d="M 30 246 L 0 440 Q 0 460 80 460 Q 160 460 160 440 L 130 246 Z"
          fill="url(#beamFill)" opacity="0.05" />
      )}
      {lit && (
        <defs>
          <linearGradient id="beamFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.amber} stopOpacity="0.3" />
            <stop offset="100%" stopColor={C.amber} stopOpacity="0" />
          </linearGradient>
        </defs>
      )}
    </svg>
  );
}

function PullChain({ onPull }) {
  const ref = useRef(null);
  const pull = () => {
    gsap.timeline()
      .to(ref.current, { y: 16, duration: 0.1, ease: "power2.out" })
      .to(ref.current, { y: 0, duration: 0.55, ease: "elastic.out(1, 0.35)" });
    onPull();
  };
  return (
    <div ref={ref} onClick={pull}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", userSelect: "none", gap: 1.5 }}>
      {Array.from({ length: 16 }).map((_, i) => (
        <div key={i} style={{ width: 1.5, height: 7, background: C.rule, borderRadius: 1, opacity: 0.9 - i * 0.04 }} />
      ))}
      <div style={{ width: 18, height: 18, borderRadius: "50%", marginTop: 3, background: `linear-gradient(135deg, ${C.rule}, ${C.muted})`, boxShadow: "0 2px 6px rgba(0,0,0,0.12)" }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.55)", margin: "3px 0 0 3px" }} />
      </div>
    </div>
  );
}

export default function LuminaAuth() {
  const navigate = useNavigate();
  const [lit, setLit] = useState(false);
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "", fullName: "", phone: "", confirmPassword: "" });
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const panelRef = useRef(null);
  const pageRef = useRef(null);

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 900);
    fn(); window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  useEffect(() => {
    if (!panelRef.current) return;
    gsap.fromTo(panelRef.current,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.38, ease: "power3.out" }
    );
  }, [mode]);

  useEffect(() => {
    gsap.to(pageRef.current, {
      backgroundColor: lit ? C.paper : C.cream,
      duration: 0.7,
    });
  }, [lit]);

  const toggle = useCallback(() => { setLit(p => !p); setError(""); setSuccess(""); }, []);

  const set = useCallback((e) => {
    const { name, value } = e.target;
    if (name === "fullName" && !only(value, /^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]*$/)) return;
    if (name === "phone"    && !only(value, /^[0-9]*$/)) return;
    setForm(p => ({ ...p, [name]: value }));
    setError("");
  }, []);

  const submit = async () => {
    setError(""); setSuccess(""); setBusy(true);
    try {
      if (mode === "register") {
        if (form.password !== form.confirmPassword) throw new Error("Şifreler eşleşmiyor");
        if (form.password.length < 6) throw new Error("Şifre en az 6 karakter olmalı");
        const r = await fetch(`${API}/register`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName: form.fullName, email: form.email, phone: form.phone, password: form.password }),
        });
        if (!r.ok) throw new Error(await r.text() || "Kayıt başarısız");
        const lr = await fetch(`${API}/login`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, password: form.password }),
        });
        const ld = await lr.json();
        localStorage.setItem("token", ld.token);
        navigate("/", { replace: true });
      } else if (mode === "login") {
        const r = await fetch(`${API}/login`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, password: form.password }),
        });
        if (!r.ok) throw new Error("E-posta veya şifre hatalı");
        const d = await r.json();
        localStorage.setItem("token", d.token);
        navigate("/", { replace: true });
      } else {
        const r = await fetch(`${API}/forgot-password`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email }),
        });
        if (!r.ok) throw new Error("E-posta gönderilemedi");
        setSuccess("Sıfırlama bağlantısı gönderildi.");
        setTimeout(() => setMode("login"), 3200);
      }
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  const pwType = isMobile ? (showPw ? "text" : "password") : (lit ? "text" : "password");
  const cpwType = isMobile ? (showCPw ? "text" : "password") : (lit ? "text" : "password");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=DM+Mono:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${C.cream}; }

        body::before {
          content: '';
          position: fixed; inset: 0; z-index: 999; pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          opacity: 0.028;
        }

        @keyframes fadeUp { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: none; } }
        @keyframes spin { to { transform: rotate(360deg); } }

        .ornament { display: flex; align-items: center; gap: 14px; color: ${C.rule}; }
        .ornament::before, .ornament::after { content:''; flex:1; height:1px; background: ${C.rule}; }
      `}</style>

      <div ref={pageRef} style={{ minHeight: "100vh", background: C.cream, display: "flex", fontFamily: "'DM Mono', monospace" }}>

        {!isMobile && (
          <div style={{ width: 320, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", paddingTop: 0, position: "relative", borderRight: `1px solid ${C.rule}`, paddingLeft: 48 }}>

            <div style={{ width: 160, height: 460, position: "relative" }}>
              <PendantLamp lit={lit} />
              <div style={{ position: "absolute", top: 280, left: "58%" }}>
                <PullChain onPull={toggle} />
              </div>
            </div>

            <div style={{ marginTop: 8, textAlign: "center" }}>
              <div style={{ fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: lit ? C.amber : C.muted, fontFamily: "'DM Mono', monospace", fontWeight: 500, transition: "color .5s" }}>
                {lit ? "ışık açık" : "ışık kapalı"}
              </div>
              <div style={{ fontSize: 9, color: C.rule, marginTop: 6, letterSpacing: "0.1em" }}>
                {lit ? "şifre görünür" : "zinciri çek"}
              </div>
            </div>

            <div style={{
              position: "absolute", bottom: 32, textAlign: "center", padding: "0 24px",
              opacity: lit ? 1 : 0,
              transform: lit ? "translateY(0)" : "translateY(6px)",
              transition: "opacity .8s ease, transform .8s ease",
              pointerEvents: lit ? "auto" : "none",
            }}>
              <div style={{
                position: "absolute", inset: "-20px -30px",
                background: `radial-gradient(ellipse at 50% 60%, ${C.amber}18 0%, transparent 70%)`,
                pointerEvents: "none",
              }} />
              <div style={{ width: 30, height: 1, background: C.amber, margin: "0 auto 14px", boxShadow: `0 0 6px ${C.amber}88` }} />
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 12, fontStyle: "italic", color: C.muted, lineHeight: 1.9, position: "relative" }}>
                "Işık olmadan<br />hiçbir şey görülmez."
              </p>
            </div>
          </div>
        )}

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? "48px 24px" : "60px 64px" }}>
          <div ref={panelRef} style={{ width: "100%", maxWidth: 380 }}>

            {isMobile && (
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
                <PullChain onPull={toggle} />
              </div>
            )}

            <div style={{ marginBottom: 48 }}>
              <div style={{ fontSize: 9, letterSpacing: "0.35em", textTransform: "uppercase", color: C.muted, marginBottom: 10, fontWeight: 500 }}>
                — Lumina Atölyesi
              </div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 400, color: C.ink, lineHeight: 1, letterSpacing: "-0.01em" }}>
                {MODES[mode].title}
              </h1>
              <p style={{ marginTop: 10, fontSize: 11, color: C.muted, letterSpacing: "0.08em" }}>
                {MODES[mode].sub}
              </p>
            </div>

            {error && (
              <div style={{ marginBottom: 24, paddingBottom: 14, borderBottom: `1px solid #fca5a5`, color: "#dc2626", fontSize: 12, fontFamily: "'DM Mono', monospace", letterSpacing: "0.04em" }}>
                — {error}
              </div>
            )}
            {success && (
              <div style={{ marginBottom: 24, paddingBottom: 14, borderBottom: `1px solid #86efac`, color: "#16a34a", fontSize: 12, fontFamily: "'DM Mono', monospace", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: 8 }}>
                <Check size={13} /> {success}
              </div>
            )}

            <div>
              {mode === "register" && (
                <>
                  <LedgerInput label="Ad Soyad" name="fullName" value={form.fullName} onChange={set} autoFocus />
                  <LedgerInput label="Telefon" name="phone" type="tel" value={form.phone} onChange={set} />
                </>
              )}

              <LedgerInput label="E-posta" name="email" type="email" value={form.email} onChange={set} autoFocus={mode === "login"} />

              {mode !== "forgot" && (
                <>
                  <LedgerInput label="Şifre" name="password" type={pwType} value={form.password} onChange={set}
                    suffix={isMobile ? (
                      <button type="button" onClick={() => setShowPw(p => !p)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 0, display: "flex" }}>
                        {showPw ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                    ) : null}
                  />
                  {mode === "register" && (
                    <LedgerInput label="Şifre Tekrar" name="confirmPassword" type={cpwType} value={form.confirmPassword} onChange={set}
                      suffix={isMobile ? (
                        <button type="button" onClick={() => setShowCPw(p => !p)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 0, display: "flex" }}>
                          {showCPw ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                      ) : null}
                    />
                  )}
                </>
              )}
            </div>

            <div style={{ marginTop: 10 }}>
              <SubmitButton busy={busy} lit={lit} onClick={submit}>
                {mode === "login" && "Giriş Yap"}
                {mode === "register" && "Hesap Oluştur"}
                {mode === "forgot" && "Bağlantı Gönder"}
              </SubmitButton>
            </div>

            <div style={{ marginTop: 36, display: "flex", alignItems: "center", justifyContent: mode === "login" ? "space-between" : "center" }}>
              {mode === "login" && (
                <>
                  <NavLink onClick={() => { setMode("register"); setError(""); }}>Kayıt Ol</NavLink>
                  <span style={{ color: C.rule, fontSize: 10 }}>·</span>
                  <NavLink onClick={() => { setMode("forgot"); setError(""); }}>Şifremi Unuttum</NavLink>
                </>
              )}
              {(mode === "register" || mode === "forgot") && (
                <NavLink onClick={() => { setMode("login"); setError(""); }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <ArrowLeft size={10} /> Giriş Sayfasına Dön
                  </span>
                </NavLink>
              )}
            </div>

            <div style={{ marginTop: 48, height: 1, background: lit ? C.amber : C.rule, transition: "background .7s, width .7s", width: lit ? "100%" : "30%" }} />
          </div>
        </div>

        <div style={{
          position: "fixed", bottom: 0, left: isMobile ? "50%" : 130, transform: "translateX(-50%)",
          width: 400, height: 200, pointerEvents: "none",
          background: `radial-gradient(ellipse at 50% 100%, ${C.amber}22 0%, transparent 70%)`,
          opacity: lit ? 1 : 0, transition: "opacity .8s", zIndex: 0
        }} />
      </div>
    </>
  );
}

function SubmitButton({ children, busy, lit, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick} disabled={busy} type="button"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%", padding: "14px 20px",
        background: hovered || lit ? C.ink : "transparent",
        color: hovered || lit ? C.paper : C.ink,
        border: `1.5px solid ${C.ink}`,
        borderRadius: 2,
        fontFamily: "'DM Mono', monospace", fontSize: 11,
        fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase",
        cursor: busy ? "not-allowed" : "pointer",
        opacity: busy ? 0.55 : 1,
        transition: "background .3s, color .3s",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10
      }}
    >
      {busy ? (
        <div style={{ width: 13, height: 13, border: "1.5px solid currentColor", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
      ) : (
        <>
          {children}
          <ArrowRight size={13} style={{ opacity: hovered || lit ? 1 : 0.4, transition: "opacity .3s" }} />
        </>
      )}
    </button>
  );
}

function NavLink({ onClick, children }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button onClick={onClick} type="button"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        background: "none", border: "none", cursor: "pointer",
        fontFamily: "'DM Mono', monospace", fontSize: 10,
        letterSpacing: "0.14em", textTransform: "uppercase",
        color: hovered ? C.ink : C.muted,
        textDecoration: hovered ? "underline" : "none",
        textDecorationColor: C.amber,
        transition: "color .2s",
      }}>
      {children}
    </button>
  );
}