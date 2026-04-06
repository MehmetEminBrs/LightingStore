import { useEffect, useState, useCallback } from "react";
import { User, Lock, MapPin, Plus, Pencil, Trash2, X, Check, Eye, EyeOff, ChevronDown, CheckCircle2 } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const API    = import.meta.env.VITE_API_URL;
const TR_API = "https://turkiyeapi.dev/api/v1";

const getToken = () => localStorage.getItem("token");

const apiFetch = async (url, options = {}) => {
  const res = await fetch(`${API}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text || "İstek başarısız");
  if (!text) return null;
  try { return JSON.parse(text); } catch { return text; }
};

function Toast({ message, onDone }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 10);
    const t2 = setTimeout(() => setVisible(false), 2500);
    const t3 = setTimeout(() => onDone(), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div
      className="fixed bottom-6 left-1/2 z-[9999] flex items-center gap-2.5 px-4 py-3 bg-gray-900 text-white text-sm rounded-xl shadow-2xl transition-all duration-500"
      style={{
        transform: `translateX(-50%) translateY(${visible ? "0" : "20px"})`,
        opacity: visible ? 1 : 0,
        pointerEvents: "none",
        whiteSpace: "nowrap",
      }}
    >
      <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />
      {message}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((message) => {
    const id = Date.now();
    setToasts(t => [...t, { id, message }]);
  }, []);
  const remove = useCallback((id) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);
  return { toasts, show, remove };
}

function Select({ value, onChange, options, placeholder, disabled, loading }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled || loading}
        className={`w-full px-3 py-2.5 pr-9 border border-gray-200 rounded-lg text-sm bg-gray-50
          focus:outline-none focus:border-gray-800 transition appearance-none
          ${disabled || loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${value ? "text-gray-800" : "text-gray-400"}`}
      >
        <option value="">{loading ? "Yükleniyor…" : placeholder}</option>
        {options.map(o => (
          <option key={o.id} value={o.id}>{o.name}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
        {loading
          ? <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          : <ChevronDown size={14} />}
      </div>
    </div>
  );
}

const EMPTY = {
  addressTitle: "", fullName: "", phone: "",
  city: "", district: "", neighborhood: "",
  addressLine: "", postalCode: "", isDefault: false,
};

function AddressModal({ editing, onClose, onSaved }) {
  const [form, setForm] = useState(editing ? { ...editing } : { ...EMPTY });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const [provinces, setProvinces]         = useState([]);
  const [districts, setDistricts]         = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);

  const [selectedProvince,     setSelectedProvince]     = useState("");
  const [selectedDistrict,     setSelectedDistrict]     = useState("");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("");

  const [loadingProvinces,     setLoadingProvinces]     = useState(false);
  const [loadingDistricts,     setLoadingDistricts]     = useState(false);
  const [loadingNeighborhoods, setLoadingNeighborhoods] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    const load = async () => {
      setLoadingProvinces(true);
      try {
        const res  = await fetch(`${TR_API}/provinces?fields=id,name&limit=100`);
        const json = await res.json();
        const list = (json.data || []).sort((a, b) => a.name.localeCompare(b.name, "tr"));
        setProvinces(list);
        if (editing?.city) {
          const found = list.find(p => p.name === editing.city);
          if (found) setSelectedProvince(String(found.id));
        }
      } catch { setError("İller yüklenemedi."); }
      finally  { setLoadingProvinces(false); }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedProvince) {
      setDistricts([]); setSelectedDistrict("");
      setNeighborhoods([]); setSelectedNeighborhood("");
      return;
    }
    const load = async () => {
      setLoadingDistricts(true);
      setDistricts([]); setSelectedDistrict("");
      setNeighborhoods([]); setSelectedNeighborhood("");
      try {
        const res  = await fetch(`${TR_API}/provinces/${selectedProvince}?fields=id,name,districts`);
        const json = await res.json();
        const list = (json.data?.districts || []).sort((a, b) => a.name.localeCompare(b.name, "tr"));
        setDistricts(list);
        if (editing?.district) {
          const found = list.find(d => d.name === editing.district);
          if (found) setSelectedDistrict(String(found.id));
        }
      } catch { setError("İlçeler yüklenemedi."); }
      finally  { setLoadingDistricts(false); }
    };
    load();
  }, [selectedProvince]);

  useEffect(() => {
    if (!selectedDistrict) {
      setNeighborhoods([]); setSelectedNeighborhood(""); return;
    }
    const load = async () => {
      setLoadingNeighborhoods(true);
      setNeighborhoods([]); setSelectedNeighborhood("");
      try {
        const res  = await fetch(`${TR_API}/districts/${selectedDistrict}?fields=id,name,neighborhoods`);
        const json = await res.json();
        const list = (json.data?.neighborhoods || []).sort((a, b) => a.name.localeCompare(b.name, "tr"));
        setNeighborhoods(list);
        if (editing?.neighborhood) {
          const found = list.find(n => n.name === editing.neighborhood);
          if (found) setSelectedNeighborhood(String(found.id));
        }
      } catch { setError("Mahalleler yüklenemedi."); }
      finally  { setLoadingNeighborhoods(false); }
    };
    load();
  }, [selectedDistrict]);

  useEffect(() => {
    const p = provinces.find(x => String(x.id) === selectedProvince);
    set("city", p?.name || "");
  }, [selectedProvince, provinces]);

  useEffect(() => {
    const d = districts.find(x => String(x.id) === selectedDistrict);
    set("district", d?.name || "");
  }, [selectedDistrict, districts]);

  useEffect(() => {
    const n = neighborhoods.find(x => String(x.id) === selectedNeighborhood);
    set("neighborhood", n?.name || "");
  }, [selectedNeighborhood, neighborhoods]);

  const save = async () => {
    setError("");
    if (!form.addressTitle || !form.fullName || !form.phone || !form.city || !form.addressLine) {
      setError("Lütfen * ile işaretli alanları doldurun."); return;
    }
    setLoading(true);
    try {
      if (editing) {
        await apiFetch(`/api/addresses/${editing.addressId}`, { method: "PUT", body: JSON.stringify(form) });
        onSaved("güncellendi");
      } else {
        await apiFetch("/api/addresses", { method: "POST", body: JSON.stringify(form) });
        onSaved("eklendi");
      }
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const lbl = "block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1";
  const inp = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 bg-gray-50 focus:outline-none focus:border-gray-800 transition";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full sm:max-w-xl sm:rounded-2xl rounded-t-2xl max-h-[92vh] flex flex-col shadow-2xl">
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-lg font-light text-gray-900" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {editing ? "Adresi Düzenle" : "Yeni Adres Ekle"}
          </h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-gray-500">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="col-span-2">
              <label className={lbl}>Adres Başlığı *</label>
              <input value={form.addressTitle} onChange={e => set("addressTitle", e.target.value)} placeholder="Ev, İş…" className={inp} />
            </div>
            <div>
              <label className={lbl}>Ad Soyad *</label>
              <input value={form.fullName} onChange={e => set("fullName", e.target.value)} placeholder="Alıcı adı" className={inp} />
            </div>
            <div>
              <label className={lbl}>Telefon *</label>
              <input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="05xx xxx xx xx" className={inp} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 mb-3">
            <div>
              <label className={lbl}>İl *</label>
              <Select value={selectedProvince} onChange={setSelectedProvince} options={provinces} placeholder="İl seçin" loading={loadingProvinces} />
            </div>
            <div>
              <label className={`${lbl} ${!selectedProvince ? "opacity-40" : ""}`}>İlçe</label>
              <Select value={selectedDistrict} onChange={setSelectedDistrict} options={districts}
                placeholder={selectedProvince ? "İlçe seçin" : "Önce il seçin"} disabled={!selectedProvince} loading={loadingDistricts} />
            </div>
            <div>
              <label className={`${lbl} ${!selectedDistrict ? "opacity-40" : ""}`}>Mahalle</label>
              <Select value={selectedNeighborhood} onChange={setSelectedNeighborhood} options={neighborhoods}
                placeholder={selectedDistrict ? "Mahalle seçin" : "Önce ilçe seçin"} disabled={!selectedDistrict} loading={loadingNeighborhoods} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="col-span-2">
              <label className={lbl}>Adres Satırı *</label>
              <input value={form.addressLine} onChange={e => set("addressLine", e.target.value)} placeholder="Sokak, bina no, daire…" className={inp} />
            </div>
            <div>
              <label className={lbl}>Posta Kodu</label>
              <input value={form.postalCode} onChange={e => set("postalCode", e.target.value)} placeholder="34710" className={inp} />
            </div>
          </div>

          <button className="flex items-center gap-3 cursor-pointer w-full text-left" onClick={() => set("isDefault", !form.isDefault)}>
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition ${form.isDefault ? "bg-gray-900 border-gray-900" : "border-gray-300"}`}>
              {form.isDefault && <Check size={10} className="text-white" strokeWidth={3} />}
            </div>
            <span className="text-sm text-gray-600">Varsayılan adres olarak ayarla</span>
          </button>

          {error && <div className="mt-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}
        </div>

        <div className="flex gap-3 px-5 py-4 border-t border-gray-100 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition">İptal</button>
          <button onClick={save} disabled={loading} className="flex-1 py-2.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition disabled:opacity-60">
            {loading ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [tab, setTab] = useState("profile");

  const [profile, setProfile]               = useState({ fullName: "", phone: "", email: "" });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg]         = useState(null);

  const [pw, setPw]           = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwShow, setPwShow]   = useState({ current: false, new: false, confirm: false });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg]     = useState(null);

  const [addresses, setAddresses]   = useState([]);
  const [addrModal, setAddrModal]   = useState(null);
  const [delConfirm, setDelConfirm] = useState(null);
  const [delLoading, setDelLoading] = useState(false);

  const { toasts, show: showToast, remove: removeToast } = useToast();

  const loadProfile = async () => {
    try {
      const data = await apiFetch("/api/auth/profile");
      setProfile({ fullName: data.fullName ?? "", phone: data.phone ?? "", email: data.email ?? "" });
    } catch {}
  };

  const loadAddresses = async () => {
    try {
      const data = await apiFetch("/api/addresses");
      setAddresses(Array.isArray(data) ? data : []);
    } catch {}
  };

  useEffect(() => { loadProfile(); loadAddresses(); }, []);

  const saveProfile = async () => {
    setProfileMsg(null);
    if (!profile.fullName.trim()) { setProfileMsg({ ok: false, text: "Ad Soyad boş bırakılamaz." }); return; }
    setProfileLoading(true);
    try {
      const updated = await apiFetch("/api/auth/profile", {
        method: "PUT",
        body: JSON.stringify({ fullName: profile.fullName, phone: profile.phone }),
      });
      setProfile({ fullName: updated.fullName, phone: updated.phone, email: updated.email });
      setProfileMsg({ ok: true, text: "Profil başarıyla güncellendi." });
    } catch (e) {
      setProfileMsg({ ok: false, text: e.message });
    } finally {
      setProfileLoading(false);
    }
  };

  const changePassword = async () => {
    setPwMsg(null);
    if (!pw.currentPassword)                       { setPwMsg({ ok: false, text: "Mevcut şifrenizi girin." }); return; }
    if (pw.newPassword.length < 6)                 { setPwMsg({ ok: false, text: "Yeni şifre en az 6 karakter olmalı." }); return; }
    if (pw.newPassword !== pw.confirmPassword)     { setPwMsg({ ok: false, text: "Yeni şifreler eşleşmiyor." }); return; }
    setPwLoading(true);
    try {
      await apiFetch("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword: pw.currentPassword, newPassword: pw.newPassword }),
      });
      setPwMsg({ ok: true, text: "Şifreniz başarıyla güncellendi." });
      setPw({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (e) {
      setPwMsg({ ok: false, text: e.message });
    } finally {
      setPwLoading(false);
    }
  };

  const deleteAddress = async (id) => {
    setDelLoading(true);
    try {
      await apiFetch(`/api/addresses/${id}`, { method: "DELETE" });
      setDelConfirm(null);
      setDelLoading(false);
      await loadAddresses();
      showToast("Adres silindi");
    } catch {
      setDelLoading(false);
    }
  };

  const handleAddrSaved = async (action) => {
    await loadAddresses();
    if (action === "eklendi") showToast("Adres eklendi");
    if (action === "güncellendi") showToast("Adres güncellendi");
  };

  const tabs = [
    { id: "profile",   label: "Profil Bilgileri", Icon: User },
    { id: "password",  label: "Şifre Değiştir",   Icon: Lock },
    { id: "addresses", label: "Adreslerim",        Icon: MapPin },
  ];

  const inputCls = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 bg-gray-50 focus:outline-none focus:border-gray-800 transition";
  const labelCls = "block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5";

  const Alert = ({ msg }) => msg ? (
    <div className={`mb-5 px-4 py-3 rounded-lg text-sm border ${msg.ok ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-600 border-red-200"}`}>
      {msg.text}
    </div>
  ) : null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f7f6f3" }}>
      <Header />

      <main className="max-w-[1100px] mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="mb-8 md:mb-10">
          <h1 className="text-3xl md:text-5xl font-light tracking-wide text-gray-900" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Hesabım
          </h1>
          <p className="text-sm text-gray-500 mt-1.5">Bilgilerinizi ve tercihlerinizi yönetin</p>
        </div>

        <div className="flex flex-col md:flex-row gap-5 md:gap-6 items-start">

          <aside className="w-full md:w-56 flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center text-base flex-shrink-0 uppercase"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {profile.fullName ? profile.fullName.charAt(0) : "?"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{profile.fullName || "—"}</p>
                <p className="text-xs text-gray-500 truncate">{profile.email || "—"}</p>
              </div>
            </div>

            <div className="flex md:hidden gap-2 overflow-x-auto pb-1">
              {tabs.map(({ id, label, Icon }) => (
                <button key={id} onClick={() => setTab(id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition flex-shrink-0
                    ${tab === id ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                  <Icon size={13} />{label}
                </button>
              ))}
            </div>

            <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden">
              {tabs.map(({ id, label, Icon }, i) => (
                <button key={id} onClick={() => setTab(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm text-left transition
                    ${i < tabs.length - 1 ? "border-b border-gray-100" : ""}
                    ${tab === id ? "bg-gray-900 text-white font-medium" : "text-gray-700 hover:bg-gray-50"}`}>
                  <Icon size={15} className={tab === id ? "text-white" : "text-gray-400"} />
                  {label}
                </button>
              ))}
            </div>
          </aside>

          <div className="flex-1 min-w-0">

            {tab === "profile" && (
              <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6">
                <div className="pb-4 mb-5 border-b border-gray-100">
                  <h2 className="text-xl font-light text-gray-900" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Profil Bilgileri</h2>
                  <p className="text-sm text-gray-500 mt-1">Ad soyad ve telefon numaranızı güncelleyebilirsiniz.</p>
                </div>
                <div className="flex flex-col gap-4 mb-6">
                  <div>
                    <label className={labelCls}>Ad Soyad</label>
                    <input value={profile.fullName} onChange={e => setProfile(p => ({ ...p, fullName: e.target.value }))} placeholder="Ad Soyad" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Telefon</label>
                    <input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="05xx xxx xx xx" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>E-posta <span className="normal-case font-normal text-gray-400">(değiştirilemez)</span></label>
                    <input value={profile.email} disabled className="w-full px-3 py-2.5 border border-gray-100 rounded-lg text-sm text-gray-400 bg-gray-100 cursor-not-allowed" />
                  </div>
                </div>
                <Alert msg={profileMsg} />
                <button onClick={saveProfile} disabled={profileLoading}
                  className="w-full sm:w-auto px-6 py-3 bg-gray-900 text-white text-sm tracking-wide hover:bg-gray-800 transition rounded-lg disabled:opacity-60">
                  {profileLoading ? "Kaydediliyor…" : "Değişiklikleri Kaydet"}
                </button>
              </div>
            )}

            {tab === "password" && (
              <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6">
                <div className="pb-4 mb-5 border-b border-gray-100">
                  <h2 className="text-xl font-light text-gray-900" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Şifre Değiştir</h2>
                  <p className="text-sm text-gray-500 mt-1">Güvenliğiniz için güçlü bir şifre seçin.</p>
                </div>
                <div className="flex flex-col gap-4 mb-6">
                  {[
                    { key: "currentPassword", label: "Mevcut Şifre",         show: "current", hint: "Şu anki şifrenizi girin" },
                    { key: "newPassword",      label: "Yeni Şifre",           show: "new",     hint: "En az 6 karakter" },
                    { key: "confirmPassword",  label: "Yeni Şifre (Tekrar)",  show: "confirm", hint: "Yeni şifrenizi tekrar girin" },
                  ].map(({ key, label, show, hint }) => (
                    <div key={key}>
                      <label className={labelCls}>{label}</label>
                      <div className="relative">
                        <input
                          type={pwShow[show] ? "text" : "password"}
                          value={pw[key]}
                          onChange={e => setPw(p => ({ ...p, [key]: e.target.value }))}
                          placeholder={hint}
                          className={inputCls + " pr-11"}
                        />
                        <button onClick={() => setPwShow(s => ({ ...s, [show]: !s[show] }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition" tabIndex={-1}>
                          {pwShow[show] ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <Alert msg={pwMsg} />
                <button onClick={changePassword} disabled={pwLoading}
                  className="w-full sm:w-auto px-6 py-3 bg-gray-900 text-white text-sm tracking-wide hover:bg-gray-800 transition rounded-lg disabled:opacity-60">
                  {pwLoading ? "Güncelleniyor…" : "Şifreyi Güncelle"}
                </button>
              </div>
            )}

            {tab === "addresses" && (
              <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6">
                <div className="flex items-start justify-between pb-4 mb-5 border-b border-gray-100">
                  <div>
                    <h2 className="text-xl font-light text-gray-900" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Adreslerim</h2>
                    <p className="text-sm text-gray-500 mt-1">Kayıtlı teslimat adresleriniz.</p>
                  </div>
                  <button onClick={() => setAddrModal("new")}
                    className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition flex-shrink-0 ml-3">
                    <Plus size={14} />
                    <span className="hidden sm:inline">Adres Ekle</span>
                    <span className="sm:hidden">Ekle</span>
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="text-center py-12 md:py-16">
                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MapPin size={22} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm mb-5">Henüz kayıtlı adresiniz yok.</p>
                    <button onClick={() => setAddrModal("new")}
                      className="px-6 py-3 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition">
                      İlk Adresinizi Ekleyin
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {addresses.map(a => (
                      <div key={a.addressId} className="group border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-gray-900">{a.addressTitle}</span>
                            {a.isDefault && (
                              <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full font-medium">
                                <Check size={9} strokeWidth={3} /> Varsayılan
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1.5 md:opacity-0 md:group-hover:opacity-100 transition flex-shrink-0">
                            <button onClick={() => setAddrModal(a)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition text-gray-500">
                              <Pencil size={13} />
                            </button>
                            <button onClick={() => setDelConfirm(a)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition text-gray-500">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">{a.fullName} · {a.phone}</p>
                        <p className="text-sm text-gray-800 mt-1">{a.addressLine}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {[a.neighborhood, a.district, a.city].filter(Boolean).join(" / ")}
                          {a.postalCode && ` · ${a.postalCode}`}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {addrModal && (
        <AddressModal
          editing={addrModal === "new" ? null : addrModal}
          onClose={() => setAddrModal(null)}
          onSaved={handleAddrSaved}
        />
      )}

      {delConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          onClick={e => e.target === e.currentTarget && !delLoading && setDelConfirm(null)}>
          <div className="bg-white w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl shadow-2xl">
            <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
              <h3 className="text-base font-light text-gray-900" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Adresi Sil</h3>
              <button onClick={() => !delLoading && setDelConfirm(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-gray-400">
                <X size={16} />
              </button>
            </div>
            <div className="px-5 py-4">
              <p className="text-sm text-gray-600 leading-relaxed">
                <span className="font-medium text-gray-900">"{delConfirm.addressTitle}"</span> adresini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
              </p>
            </div>
            <div className="flex gap-3 px-5 py-4 border-t border-gray-100">
              <button onClick={() => setDelConfirm(null)} disabled={delLoading}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition disabled:opacity-50">
                Vazgeç
              </button>
              <button onClick={() => deleteAddress(delConfirm.addressId)} disabled={delLoading}
                className="flex-1 py-2.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition disabled:opacity-60">
                {delLoading ? "Siliniyor…" : "Evet, Sil"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toasts.map(t => (
        <Toast key={t.id} message={t.message} onDone={() => removeToast(t.id)} />
      ))}

      <style jsx>{`
        * { font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        h1, h2, h3 { font-family: 'Cormorant Garamond', serif; }
      `}</style>
    </div>
  );
}