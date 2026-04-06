import { useEffect, useState, useCallback } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const getToken = () => localStorage.getItem("token");
const authHeaders = () => ({ Authorization: `Bearer ${getToken()}` });

function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type = "ok") => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);
  const remove = useCallback(id => setToasts(p => p.filter(t => t.id !== id)), []);
  return { toasts, add, remove };
}

function ToastContainer({ toasts, remove }) {
  return (
    <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 9999, display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
      {toasts.map(t => (
        <div key={t.id} onClick={() => remove(t.id)} style={{
          background: t.type === "error" ? "#ef4444" : t.type === "warn" ? "#f59e0b" : "#1a1a1a",
          color: "#fff", padding: "10px 20px", borderRadius: 100,
          fontSize: 13, fontFamily: "'Montserrat', sans-serif", fontWeight: 500,
          cursor: "pointer", boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
          whiteSpace: "nowrap", animation: "fadeUp .2s ease"
        }}>{t.msg}</div>
      ))}
    </div>
  );
}

function ConfirmDialog({ title, message, onConfirm, onCancel }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onCancel}>
      <div style={{ background: "#fff", borderRadius: 20, padding: "28px 24px", maxWidth: 360, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 20 }}>🗑</div>
        <h3 style={{ textAlign: "center", margin: "0 0 8px", fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: "#111" }}>{title}</h3>
        <p style={{ textAlign: "center", margin: "0 0 24px", fontSize: 13, color: "#6b7280", fontFamily: "'Montserrat', sans-serif", lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={lightBtn}>İptal</button>
          <button onClick={onConfirm} style={{ ...lightBtn, background: "#ef4444", color: "#fff", border: "none" }}>Evet, Sil</button>
        </div>
      </div>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 2000, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: "22px 22px 0 0", padding: "8px 20px 40px", width: "100%", maxWidth: 600, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 -10px 40px rgba(0,0,0,0.12)" }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 36, height: 4, background: "#e5e7eb", borderRadius: 2, margin: "12px auto 20px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h3 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: "#111", fontWeight: 500 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "#f3f4f6", border: "none", borderRadius: 10, width: 34, height: 34, cursor: "pointer", fontSize: 15, color: "#6b7280" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12,
  color: "#111", padding: "11px 14px", fontSize: 14, fontFamily: "'Montserrat', sans-serif",
  boxSizing: "border-box", outline: "none"
};
const labelStyle = {
  display: "block", color: "#6b7280", fontSize: 11, marginBottom: 6,
  fontFamily: "'Montserrat', sans-serif", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600
};
const primaryBtn = {
  background: "#111", color: "#fff", border: "none", borderRadius: 12,
  padding: "12px 20px", fontSize: 13, cursor: "pointer", fontFamily: "'Montserrat', sans-serif",
  fontWeight: 600, flex: 1, letterSpacing: "0.02em"
};
const lightBtn = {
  background: "#f9fafb", color: "#374151", border: "1px solid #e5e7eb", borderRadius: 12,
  padding: "12px 20px", fontSize: 13, cursor: "pointer", fontFamily: "'Montserrat', sans-serif",
  fontWeight: 500, flex: 1
};
const Field = ({ label, children }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={labelStyle}>{label}</label>
    {children}
  </div>
);
const Toggle = ({ label, value, onChange }) => (
  <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginBottom: 16 }}>
    <div onClick={() => onChange(!value)} style={{ width: 44, height: 24, borderRadius: 12, background: value ? "#111" : "#e5e7eb", position: "relative", transition: "background .2s", flexShrink: 0 }}>
      <div style={{ position: "absolute", top: 3, left: value ? 22 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
    </div>
    <span style={{ color: "#374151", fontSize: 13, fontFamily: "'Montserrat', sans-serif" }}>{label}</span>
  </label>
);
const EmptyState = ({ text }) => (
  <div style={{ textAlign: "center", padding: "48px 20px", color: "#9ca3af", fontFamily: "'Montserrat', sans-serif", fontSize: 13, border: "1.5px dashed #e5e7eb", borderRadius: 16 }}>{text}</div>
);
const rowCard = { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 };
const iconBtn = (color = "#6b7280", bg = "#f9fafb") => ({
  background: bg, border: "1px solid #e5e7eb", borderRadius: 10, color, cursor: "pointer",
  width: 36, height: 36, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
});
const badge = (bg, color, border) => ({
  background: bg, color, fontSize: 10, padding: "3px 9px", borderRadius: 100,
  fontFamily: "'Montserrat', sans-serif", fontWeight: 600, border: `1px solid ${border}`, whiteSpace: "nowrap"
});
const sectionTitle = { margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: 26, color: "#111", fontWeight: 500 };

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 20, padding: "20px 22px", display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: color + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ color: "#6b7280", fontSize: 11, fontFamily: "'Montserrat', sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
        <div style={{ color: "#111", fontSize: 28, fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, lineHeight: 1.2, marginTop: 2 }}>{value}</div>
      </div>
    </div>
  );
}

function CategoryForm({ initial, onSave, onCancel }) {
  const [name, setName] = useState(initial?.categoryName || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [image, setImage] = useState(null);

  const submit = () => {
    const fd = new FormData();
    fd.append("CategoryName", name); fd.append("Slug", slug); fd.append("IsActive", isActive);
    if (image) fd.append("Image", image);
    onSave(fd);
  };

  return (
    <div>
      <Field label="Kategori Adı"><input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Örn: Tavan Armatürleri" /></Field>
      <Field label="Slug"><input style={inputStyle} value={slug} onChange={e => setSlug(e.target.value)} placeholder="tavan-armaturleri" /></Field>
      {initial?.imageUrl && (
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Mevcut Görsel</label>
          <img src={`${API}${initial.imageUrl}`} alt="" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 12, border: "1px solid #e5e7eb" }} />
        </div>
      )}
      <Field label="Görsel">
        <input type="file" accept="image/*" style={{ ...inputStyle, padding: "9px 14px", color: "#6b7280" }} onChange={e => setImage(e.target.files[0])} />
      </Field>
      <Toggle label={isActive ? "Aktif" : "Pasif"} value={isActive} onChange={setIsActive} />
      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        <button style={lightBtn} onClick={onCancel}>İptal</button>
        <button style={primaryBtn} onClick={submit}>Kaydet</button>
      </div>
    </div>
  );
}

function CategoriesSection({ toast, onStatsChange }) {
  const [cats, setCats] = useState([]);
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [productCounts, setProductCounts] = useState({});

  const load = useCallback(async () => {
    const [cr, pr] = await Promise.all([
      axios.get(`${API}/api/categories`),
      axios.get(`${API}/api/products`, { headers: authHeaders() })
    ]);
    setCats(cr.data);
    const counts = {};
    pr.data.forEach(p => { counts[p.categoryId] = (counts[p.categoryId] || 0) + 1; });
    setProductCounts(counts);
    onStatsChange?.({ categoryCount: cr.data.length, productCount: pr.data.length });
  }, []);
  useEffect(() => { load(); }, [load]);

  const create = async fd => {
    try { await axios.post(`${API}/api/categories`, fd, { headers: { ...authHeaders(), "Content-Type": "multipart/form-data" } }); toast.add("Kategori oluşturuldu ✓"); setModal(null); load(); }
    catch { toast.add("Hata oluştu", "error"); }
  };
  const update = async (id, fd) => {
    try { await axios.put(`${API}/api/categories/${id}`, fd, { headers: { ...authHeaders(), "Content-Type": "multipart/form-data" } }); toast.add("Kategori güncellendi ✓"); setModal(null); load(); }
    catch { toast.add("Hata oluştu", "error"); }
  };
  const tryDelete = cat => {
    if (productCounts[cat.categoryId] > 0) { toast.add(`Bu kategoride ${productCounts[cat.categoryId]} ürün var. Önce ürünleri siliniz.`, "error"); return; }
    setConfirm({ cat });
  };
  const confirmDelete = async () => {
    try { await axios.delete(`${API}/api/categories/${confirm.cat.categoryId}`, { headers: authHeaders() }); toast.add("Kategori silindi"); load(); }
    catch { toast.add("Silinemedi", "error"); }
    setConfirm(null);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={sectionTitle}>Kategoriler</h2>
        <button style={{ ...primaryBtn, flex: "none", padding: "10px 18px", fontSize: 13 }} onClick={() => setModal("create")}>+ Yeni</button>
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        {cats.map(c => (
          <div key={c.categoryId} style={rowCard}>
            {c.imageUrl ? <img src={`${API}${c.imageUrl}`} alt="" style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 10, flexShrink: 0 }} />
              : <div style={{ width: 48, height: 48, borderRadius: 10, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🗂</div>}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: "#111", fontWeight: 600, fontSize: 14, fontFamily: "'Montserrat', sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.categoryName}</div>
              <div style={{ color: "#9ca3af", fontSize: 11, fontFamily: "'Montserrat', sans-serif", marginTop: 2 }}>{c.slug} · {productCounts[c.categoryId] || 0} ürün</div>
            </div>
            <span style={c.isActive ? badge("#f0fdf4", "#16a34a", "#bbf7d0") : badge("#f9fafb", "#9ca3af", "#e5e7eb")}>{c.isActive ? "Aktif" : "Pasif"}</span>
            <button style={iconBtn()} onClick={() => setModal(c)}>✏️</button>
            <button style={iconBtn("#ef4444", "#fef2f2")} onClick={() => tryDelete(c)}>🗑</button>
          </div>
        ))}
        {cats.length === 0 && <EmptyState text="Henüz kategori eklenmemiş" />}
      </div>
      {modal === "create" && <Modal title="Yeni Kategori" onClose={() => setModal(null)}><CategoryForm onSave={create} onCancel={() => setModal(null)} /></Modal>}
      {modal && modal !== "create" && <Modal title="Kategori Düzenle" onClose={() => setModal(null)}><CategoryForm initial={modal} onSave={fd => update(modal.categoryId, fd)} onCancel={() => setModal(null)} /></Modal>}
      {confirm && <ConfirmDialog title="Kategoriyi Sil" message={`"${confirm.cat.categoryName}" kategorisini silmek istediğinize emin misiniz?`} onConfirm={confirmDelete} onCancel={() => setConfirm(null)} />}
    </div>
  );
}

function ProductImageManager({ productId, toast }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDel, setConfirmDel] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await axios.get(`${API}/api/product-images/product/${productId}`, { headers: authHeaders() });
      setImages(r.data);
    } catch { toast.add("Görseller yüklenemedi", "error"); }
    setLoading(false);
  }, [productId]);
  useEffect(() => { load(); }, [load]);

  const setMain = async (imageId) => {
    try {
      await axios.put(`${API}/api/product-images/set-main/${imageId}`, null, { headers: authHeaders() });
      toast.add("Ana görsel güncellendi ✓");
      load();
    } catch { toast.add("Hata", "error"); }
  };

  const deleteImage = async () => {
    try {
      await axios.delete(`${API}/api/product-images/${confirmDel.imageId}`, { headers: authHeaders() });
      toast.add("Görsel silindi");
      load();
    } catch { toast.add("Silinemedi", "error"); }
    setConfirmDel(null);
  };

  if (loading) return <div style={{ color: "#9ca3af", fontSize: 12, fontFamily: "'Montserrat', sans-serif", padding: "12px 0" }}>Görseller yükleniyor...</div>;

  return (
    <div style={{ marginBottom: 16 }}>
      <label style={labelStyle}>Mevcut Görseller</label>
      {images.length === 0 ? (
        <div style={{ color: "#9ca3af", fontSize: 12, fontFamily: "'Montserrat', sans-serif", padding: "8px 0" }}>Henüz görsel yok</div>
      ) : (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {images.map(img => (
            <div key={img.imageId} style={{ position: "relative" }}>
              <img
                src={`${API}${img.imageUrl}`} alt=""
                style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 10, border: img.isMain ? "2.5px solid #111" : "1px solid #e5e7eb", display: "block" }}
              />
              {img.isMain && (
                <div style={{ position: "absolute", bottom: 4, left: "50%", transform: "translateX(-50%)", background: "#111", color: "#fff", fontSize: 9, padding: "2px 6px", borderRadius: 100, fontFamily: "'Montserrat', sans-serif", fontWeight: 700, whiteSpace: "nowrap" }}>ANA</div>
              )}
              <div style={{ position: "absolute", top: -6, right: -6, display: "flex", flexDirection: "column", gap: 3 }}>
                <button
                  onClick={() => setConfirmDel(img)}
                  style={{ width: 22, height: 22, borderRadius: "50%", background: "#ef4444", border: "none", color: "#fff", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }}
                >✕</button>
              </div>
              {!img.isMain && (
                <button
                  onClick={() => setMain(img.imageId)}
                  style={{ marginTop: 4, width: 72, background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 9, padding: "3px 0", cursor: "pointer", fontFamily: "'Montserrat', sans-serif", fontWeight: 600, color: "#374151" }}
                >Ana yap</button>
              )}
            </div>
          ))}
        </div>
      )}
      {confirmDel && (
        <ConfirmDialog
          title="Görseli Sil"
          message="Bu görseli kalıcı olarak silmek istediğinize emin misiniz?"
          onConfirm={deleteImage}
          onCancel={() => setConfirmDel(null)}
        />
      )}
    </div>
  );
}

function ProductForm({ initial, categories, onSave, onCancel, toast }) {
  const [name, setName] = useState(initial?.productName || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [desc, setDesc] = useState(initial?.description || "");
  const [price, setPrice] = useState(initial?.price || "");
  const [discount, setDiscount] = useState(initial?.discountPrice || "");
  const [catId, setCatId] = useState(initial?.categoryId || "");
  const [isPopular, setIsPopular] = useState(initial?.isPopular || false);
  const [popularOrder, setPopularOrder] = useState(initial?.popularOrder || "");
  const [isNew, setIsNew] = useState(initial?.isNew || false);
  const [images, setImages] = useState([]);

  const submit = () => {
    const fd = new FormData();
    fd.append("ProductName", name); fd.append("Slug", slug); fd.append("Description", desc);
    fd.append("Price", price); if (discount) fd.append("DiscountPrice", discount);
    fd.append("CategoryId", catId); fd.append("IsPopular", isPopular);
    if (isPopular && popularOrder) fd.append("PopularOrder", popularOrder);
    fd.append("IsNew", isNew);
    images.forEach(img => fd.append(initial ? "NewImages" : "Images", img));
    onSave(fd);
  };

  return (
    <div>
      <Field label="Ürün Adı"><input style={inputStyle} value={name} onChange={e => setName(e.target.value)} /></Field>
      <Field label="Slug"><input style={inputStyle} value={slug} onChange={e => setSlug(e.target.value)} /></Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
        <Field label="Fiyat (₺)"><input style={inputStyle} type="number" value={price} onChange={e => setPrice(e.target.value)} /></Field>
        <Field label="İndirimli (₺)"><input style={inputStyle} type="number" value={discount} onChange={e => setDiscount(e.target.value)} /></Field>
      </div>
      <Field label="Kategori">
        <select style={inputStyle} value={catId} onChange={e => setCatId(e.target.value)}>
          <option value="">Seçiniz</option>
          {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}
        </select>
      </Field>
      <Field label="Açıklama"><textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={desc} onChange={e => setDesc(e.target.value)} /></Field>
      <Toggle label="Popüler Ürün" value={isPopular} onChange={setIsPopular} />
      {isPopular && <Field label="Popüler Sırası"><input style={inputStyle} type="number" value={popularOrder} onChange={e => setPopularOrder(e.target.value)} /></Field>}
      <Toggle label="Yeni Ürün" value={isNew} onChange={setIsNew} />

      {initial && <ProductImageManager productId={initial.productId} toast={toast} />}

      <Field label={initial ? "Yeni Görsel Ekle" : "Görseller"}>
        <input type="file" accept="image/*" multiple style={{ ...inputStyle, padding: "9px 14px", color: "#6b7280" }} onChange={e => setImages(Array.from(e.target.files))} />
      </Field>
      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        <button style={lightBtn} onClick={onCancel}>İptal</button>
        <button style={primaryBtn} onClick={submit}>Kaydet</button>
      </div>
    </div>
  );
}

function ProductsSection({ toast, onStatsChange }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    const [pr, cr] = await Promise.all([
      axios.get(`${API}/api/products`, { headers: authHeaders() }),
      axios.get(`${API}/api/categories`)
    ]);
    setProducts(pr.data); setCategories(cr.data);
    onStatsChange?.({ productCount: pr.data.length, categoryCount: cr.data.length });
  }, []);
  useEffect(() => { load(); }, [load]);

  const create = async fd => {
    try { await axios.post(`${API}/api/products`, fd, { headers: { ...authHeaders(), "Content-Type": "multipart/form-data" } }); toast.add("Ürün oluşturuldu ✓"); setModal(null); load(); }
    catch { toast.add("Hata oluştu", "error"); }
  };
  const update = async (id, fd) => {
    try { await axios.put(`${API}/api/products/${id}`, fd, { headers: { ...authHeaders(), "Content-Type": "multipart/form-data" } }); toast.add("Ürün güncellendi ✓"); setModal(null); load(); }
    catch { toast.add("Hata oluştu", "error"); }
  };
  const confirmDelete = async () => {
    try { await axios.delete(`${API}/api/products/${confirm.productId}`, { headers: authHeaders() }); toast.add("Ürün silindi"); load(); }
    catch { toast.add("Silinemedi", "error"); }
    setConfirm(null);
  };

  const filtered = products.filter(p =>
    p.productName?.toLowerCase().includes(search.toLowerCase()) ||
    p.categoryName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={sectionTitle}>Ürünler</h2>
        <button style={{ ...primaryBtn, flex: "none", padding: "10px 18px", fontSize: 13 }} onClick={() => setModal("create")}>+ Yeni</button>
      </div>
      <input style={{ ...inputStyle, marginBottom: 14, background: "#f9fafb" }} placeholder="🔍  Ürün veya kategori ara..." value={search} onChange={e => setSearch(e.target.value)} />
      <div style={{ display: "grid", gap: 10 }}>
        {filtered.map(p => (
          <div key={p.productId} style={rowCard}>
            {p.mainImageUrl ? <img src={`${API}${p.mainImageUrl}`} alt="" style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 10, flexShrink: 0 }} />
              : <div style={{ width: 48, height: 48, borderRadius: 10, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>💡</div>}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: "#111", fontWeight: 600, fontSize: 14, fontFamily: "'Montserrat', sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.productName}</div>
              <div style={{ color: "#9ca3af", fontSize: 11, fontFamily: "'Montserrat', sans-serif", marginTop: 2 }}>
                {p.categoryName} ·{" "}
                {p.discountPrice ? <><span style={{ color: "#16a34a", fontWeight: 600 }}>{p.discountPrice}₺</span> <span style={{ textDecoration: "line-through" }}>{p.price}₺</span></> : <span style={{ color: "#374151" }}>{p.price}₺</span>}
              </div>
            </div>
            <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
              {p.isNew && <span style={badge("#f5f3ff", "#7c3aed", "#ddd6fe")}>Yeni</span>}
              {p.isPopular && <span style={badge("#fffbeb", "#d97706", "#fde68a")}>Pop.</span>}
            </div>
            <button style={iconBtn()} onClick={() => setModal(p)}>✏️</button>
            <button style={iconBtn("#ef4444", "#fef2f2")} onClick={() => setConfirm(p)}>🗑</button>
          </div>
        ))}
        {filtered.length === 0 && <EmptyState text="Ürün bulunamadı" />}
      </div>
      {modal === "create" && <Modal title="Yeni Ürün" onClose={() => setModal(null)}><ProductForm categories={categories} onSave={create} onCancel={() => setModal(null)} toast={toast} /></Modal>}
      {modal && modal !== "create" && <Modal title="Ürün Düzenle" onClose={() => setModal(null)}><ProductForm initial={modal} categories={categories} onSave={fd => update(modal.productId, fd)} onCancel={() => setModal(null)} toast={toast} /></Modal>}
      {confirm && <ConfirmDialog title="Ürünü Sil" message={`"${confirm.productName}" ürününü silmek istediğinize emin misiniz?`} onConfirm={confirmDelete} onCancel={() => setConfirm(null)} />}
    </div>
  );
}

function StocksSection({ toast }) {
  const [rows, setRows] = useState([]);
  const [modal, setModal] = useState(null);
  const [qty, setQty] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    try {
      const [sr, pr] = await Promise.all([
        axios.get(`${API}/api/stocks`, { headers: authHeaders() }),
        axios.get(`${API}/api/products`, { headers: authHeaders() })
      ]);
      const stockMap = {};
      sr.data.forEach(s => { stockMap[s.productId] = s; });

      const merged = pr.data.map(p => ({
        productId: p.productId,
        productName: p.productName,
        mainImageUrl: p.mainImageUrl || null,
        quantity: stockMap[p.productId] != null ? stockMap[p.productId].quantity : -1,
        hasRecord: stockMap[p.productId] != null,
      }));
      setRows(merged);
    } catch { toast.add("Stok yüklenemedi", "error"); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    const { stock, mode } = modal;
    try {
      if (mode === "add" || !stock.hasRecord) {
        await axios.post(`${API}/api/stocks/${stock.productId}/add?quantity=${qty}`, null, { headers: authHeaders() });
        toast.add("Stok eklendi ✓");
      } else {
        await axios.put(`${API}/api/stocks/${stock.productId}?quantity=${qty}`, null, { headers: authHeaders() });
        toast.add("Stok güncellendi ✓");
      }
      setModal(null); load();
    } catch { toast.add("Hata", "error"); }
  };

  const confirmDelete = async () => {
    try { await axios.delete(`${API}/api/stocks/${confirm.productId}`, { headers: authHeaders() }); toast.add("Stok silindi"); load(); }
    catch { toast.add("Silinemedi", "error"); }
    setConfirm(null);
  };

  const filtered = rows.filter(r => r.productName?.toLowerCase().includes(search.toLowerCase()));

  const noRecord = filtered.filter(r => !r.hasRecord);
  const outOfStock = filtered.filter(r => r.hasRecord && r.quantity === 0);
  const lowStock = filtered.filter(r => r.hasRecord && r.quantity > 0 && r.quantity < 5);
  const okStock = filtered.filter(r => r.hasRecord && r.quantity >= 5);

  const StockRow = ({ s }) => (
    <div style={rowCard}>
      {s.mainImageUrl ? <img src={`${API}${s.mainImageUrl}`} alt="" style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 10, flexShrink: 0 }} />
        : <div style={{ width: 48, height: 48, borderRadius: 10, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>📦</div>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: "#111", fontWeight: 600, fontSize: 14, fontFamily: "'Montserrat', sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.productName}</div>
        <div style={{ marginTop: 4 }}>
          {!s.hasRecord
            ? <span style={badge("#fafafa", "#9ca3af", "#e5e7eb")}>Kayıt yok</span>
            : s.quantity === 0
              ? <span style={badge("#fef2f2", "#ef4444", "#fecaca")}>Tükendi</span>
              : s.quantity < 5
                ? <span style={badge("#fffbeb", "#d97706", "#fde68a")}>Kritik: {s.quantity} ad</span>
                : <span style={badge("#f0fdf4", "#16a34a", "#bbf7d0")}>{s.quantity} adet</span>}
        </div>
      </div>
      <button style={iconBtn("#6366f1", "#f5f3ff")} title="Stok Ekle" onClick={() => { setModal({ stock: s, mode: "add" }); setQty(""); }}>➕</button>
      {s.hasRecord && <>
        <button style={iconBtn("#f59e0b", "#fffbeb")} title="Stok Güncelle" onClick={() => { setModal({ stock: s, mode: "update" }); setQty(""); }}>🔄</button>
        <button style={iconBtn("#ef4444", "#fef2f2")} title="Stok Sil" onClick={() => setConfirm(s)}>🗑</button>
      </>}
    </div>
  );

  const Group = ({ label, color, items }) => items.length === 0 ? null : (
    <>
      <div style={{ color, fontSize: 11, fontFamily: "'Montserrat', sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>{label}</div>
      <div style={{ display: "grid", gap: 10, marginBottom: 20 }}>{items.map(s => <StockRow key={s.productId} s={s} />)}</div>
    </>
  );

  return (
    <div>
      <h2 style={{ ...sectionTitle, marginBottom: 16 }}>Stok Yönetimi</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ ...badge("#fef2f2", "#ef4444", "#fecaca"), fontSize: 12, padding: "6px 14px" }}>❌ Tükendi: {outOfStock.length}</div>
        <div style={{ ...badge("#fafafa", "#9ca3af", "#e5e7eb"), fontSize: 12, padding: "6px 14px" }}>⬜ Kayıtsız: {noRecord.length}</div>
        <div style={{ ...badge("#fffbeb", "#d97706", "#fde68a"), fontSize: 12, padding: "6px 14px" }}>⚠️ Kritik: {lowStock.length}</div>
        <div style={{ ...badge("#f0fdf4", "#16a34a", "#bbf7d0"), fontSize: 12, padding: "6px 14px" }}>✅ Normal: {okStock.length}</div>
      </div>

      <input style={{ ...inputStyle, marginBottom: 20, background: "#f9fafb" }} placeholder="🔍  Ürün ara..." value={search} onChange={e => setSearch(e.target.value)} />

      <Group label="Tükenmiş Ürünler" color="#ef4444" items={outOfStock} />
      <Group label="Stok Kaydı Olmayan Ürünler" color="#9ca3af" items={noRecord} />
      <Group label="Kritik Stok" color="#d97706" items={lowStock} />
      <Group label="Normal Stok" color="#16a34a" items={okStock} />
      {rows.length === 0 && <EmptyState text="Ürün bulunamadı" />}

      {modal && (
        <Modal title={modal.mode === "add" || !modal.stock.hasRecord ? "Stok Ekle" : "Stok Güncelle"} onClose={() => setModal(null)}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: "#f9fafb", borderRadius: 14, border: "1px solid #e5e7eb", marginBottom: 20 }}>
            {modal.stock.mainImageUrl
              ? <img src={`${API}${modal.stock.mainImageUrl}`} alt="" style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 10, flexShrink: 0 }} />
              : <div style={{ width: 52, height: 52, borderRadius: 10, background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>📦</div>}
            <div>
              <div style={{ color: "#111", fontWeight: 600, fontFamily: "'Montserrat', sans-serif", fontSize: 14 }}>{modal.stock.productName}</div>
              <div style={{ color: "#9ca3af", fontSize: 12, fontFamily: "'Montserrat', sans-serif", marginTop: 3 }}>
                {!modal.stock.hasRecord ? "Henüz stok kaydı yok" : <>Mevcut stok: <strong style={{ color: modal.stock.quantity === 0 ? "#ef4444" : "#111" }}>{modal.stock.quantity} adet</strong></>}
              </div>
            </div>
          </div>
          <Field label={modal.mode === "add" || !modal.stock.hasRecord ? "Eklenecek Miktar" : "Yeni Miktar"}>
            <input style={inputStyle} type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="Adet giriniz" autoFocus />
          </Field>
          {(modal.mode === "add" || !modal.stock.hasRecord) && qty && (
            <div style={{ padding: "10px 14px", background: "#f0fdf4", borderRadius: 10, marginBottom: 16, fontSize: 13, color: "#16a34a", fontFamily: "'Montserrat', sans-serif", fontWeight: 500 }}>
              İşlem sonrası: {(modal.stock.quantity < 0 ? 0 : modal.stock.quantity) + parseInt(qty || 0)} adet
            </div>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <button style={lightBtn} onClick={() => setModal(null)}>İptal</button>
            <button style={primaryBtn} onClick={handleSave}>Kaydet</button>
          </div>
        </Modal>
      )}
      {confirm && <ConfirmDialog title="Stok Sil" message={`"${confirm.productName}" ürününün stok kaydını silmek istediğinize emin misiniz?`} onConfirm={confirmDelete} onCancel={() => setConfirm(null)} />}
    </div>
  );
}

function CommentsSection({ toast }) {
  const [productId, setProductId] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [products, setProducts] = useState([]);
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    axios.get(`${API}/api/products`, { headers: authHeaders() }).then(r => setProducts(r.data)).catch(() => {});
  }, []);

  const handleProductChange = e => {
    setProductId(e.target.value);
    setComments([]);
    setSearched(false);
  };

  const load = async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const r = await axios.get(`${API}/api/products/${productId}/comments`, { headers: authHeaders() });
      setComments(r.data);
      setSearched(true);
    } catch { toast.add("Yorumlar yüklenemedi", "error"); }
    setLoading(false);
  };

  const confirmDelete = async () => {
    try { await axios.delete(`${API}/api/products/${productId}/comments/admin/${confirm.commentId}`, { headers: authHeaders() }); toast.add("Yorum silindi"); setComments(p => p.filter(c => c.commentId !== confirm.commentId)); }
    catch { toast.add("Silinemedi", "error"); }
    setConfirm(null);
  };

  return (
    <div>
      <h2 style={{ ...sectionTitle, marginBottom: 20 }}>Yorum Yönetimi</h2>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <select style={{ ...inputStyle, flex: 1, background: "#f9fafb" }} value={productId} onChange={handleProductChange}>
          <option value="">Ürün seçiniz...</option>
          {products.map(p => <option key={p.productId} value={p.productId}>{p.productName}</option>)}
        </select>
        <button style={{ ...primaryBtn, flex: "none", padding: "11px 20px" }} onClick={load}>Getir</button>
      </div>

      {loading && <div style={{ textAlign: "center", padding: 40, color: "#9ca3af", fontFamily: "'Montserrat', sans-serif", fontSize: 13 }}>Yükleniyor...</div>}

      {!loading && searched && comments.length === 0 && (
        <EmptyState text="Bu ürüne ait yorum bulunamadı" />
      )}

      {!loading && !searched && productId && (
        <div style={{ textAlign: "center", padding: "32px 20px", color: "#d1d5db", fontFamily: "'Montserrat', sans-serif", fontSize: 13 }}>
          Yorumları görmek için "Getir" butonuna tıklayın
        </div>
      )}

      <div style={{ display: "grid", gap: 12 }}>
        {comments.map(c => (
          <div key={c.commentId} style={{ ...rowCard, flexDirection: "column", alignItems: "stretch", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ color: "#111", fontWeight: 600, fontSize: 14, fontFamily: "'Montserrat', sans-serif" }}>
                  {c.userName || c.userFullName || `Kullanıcı #${c.userId}`}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                  {c.rating && <span style={{ color: "#f59e0b", fontSize: 14 }}>{"★".repeat(c.rating)}{"☆".repeat(5 - c.rating)}</span>}
                  {c.createdAt && <span style={{ color: "#9ca3af", fontSize: 11, fontFamily: "'Montserrat', sans-serif" }}>{new Date(c.createdAt).toLocaleDateString("tr-TR")}</span>}
                </div>
              </div>
              <button style={iconBtn("#ef4444", "#fef2f2")} onClick={() => setConfirm(c)}>🗑</button>
            </div>
            <p style={{ margin: 0, color: "#6b7280", fontSize: 13, lineHeight: 1.7, fontFamily: "'Montserrat', sans-serif", padding: "12px 14px", background: "#f9fafb", borderRadius: 10, border: "1px solid #f3f4f6" }}>
              {c.content || c.text || c.comment}
            </p>
          </div>
        ))}
      </div>
      {confirm && <ConfirmDialog title="Yorumu Sil" message="Bu yorumu kalıcı olarak silmek istediğinize emin misiniz?" onConfirm={confirmDelete} onCancel={() => setConfirm(null)} />}
    </div>
  );
}

const TABS = [
  { id: "categories", label: "Kategoriler", icon: "🗂", sub: "Ekle · Düzenle · Sil" },
  { id: "products",   label: "Ürünler",     icon: "💡", sub: "Fiyat · Görsel · İçerik" },
  { id: "stocks",     label: "Stoklar",     icon: "📊", sub: "Miktar · Takip · Güncelle" },
  { id: "comments",   label: "Yorumlar",    icon: "💬", sub: "Moderasyon · Sil" },
];

export default function AdminPage() {
  const [tab, setTab] = useState(null);
  const [stats, setStats] = useState({ productCount: 0, categoryCount: 0 });
  const toast = useToast();
  const activeTab = TABS.find(t => t.id === tab);

  useEffect(() => {
    if (tab !== null) return;
    Promise.all([
      axios.get(`${API}/api/products`, { headers: authHeaders() }),
      axios.get(`${API}/api/categories`)
    ]).then(([pr, cr]) => setStats({ productCount: pr.data.length, categoryCount: cr.data.length })).catch(() => {});
  }, [tab]);

  const handleStatsChange = useCallback(s => setStats(prev => ({ ...prev, ...s })), []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Montserrat:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: #f7f6f3; }
        @keyframes fadeUp { from { transform: translateY(12px); opacity: 0; } to { transform: none; opacity: 1; } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 2px; }
        select option { background: #fff; color: #111; }
        input::placeholder { color: #9ca3af; }
        textarea::placeholder { color: #9ca3af; }
      `}</style>

      <div style={{ background: "#f7f6f3", minHeight: "100vh", maxWidth: 640, margin: "0 auto" }}>

        <div style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(247,246,243,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #e5e7eb", padding: "14px 20px", display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={() => setTab(null)} style={{ background: tab ? "#fff" : "transparent", border: tab ? "1px solid #e5e7eb" : "none", borderRadius: 10, width: 40, height: 40, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: tab ? 18 : 24, flexShrink: 0, color: tab ? "#374151" : "#111", transition: "all .2s", boxShadow: tab ? "0 1px 4px rgba(0,0,0,0.06)" : "none" }}>
            {tab ? "←" : "⚡"}
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, fontSize: 20, color: "#111", lineHeight: 1.1 }}>{tab ? activeTab?.label : "Admin Panel"}</div>
            <div style={{ color: "#9ca3af", fontSize: 11, fontFamily: "'Montserrat', sans-serif", marginTop: 1 }}>LightingStore</div>
          </div>
        </div>

        {!tab && (
          <div style={{ padding: "24px 20px 56px", animation: "fadeUp .25s ease" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
              <StatCard icon="💡" label="Toplam Ürün" value={stats.productCount} color="#6366f1" />
              <StatCard icon="🗂" label="Kategoriler" value={stats.categoryCount} color="#f59e0b" />
            </div>
            <p style={{ color: "#9ca3af", fontSize: 11, fontFamily: "'Montserrat', sans-serif", marginBottom: 16, letterSpacing: "0.07em", textTransform: "uppercase", fontWeight: 600 }}>Bölümler</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {TABS.map((t, i) => (
                <button key={t.id} onClick={() => setTab(t.id)} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 20, padding: "22px 18px", textAlign: "left", cursor: "pointer", display: "flex", flexDirection: "column", gap: 12, animation: `fadeUp .3s ease ${i * 0.06}s both`, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                  <span style={{ fontSize: 28 }}>{t.icon}</span>
                  <div>
                    <div style={{ color: "#111", fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, fontSize: 18, marginBottom: 4 }}>{t.label}</div>
                    <div style={{ color: "#9ca3af", fontSize: 11, fontFamily: "'Montserrat', sans-serif" }}>{t.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {tab && (
          <div style={{ padding: "20px 20px 60px", animation: "fadeUp .2s ease" }}>
            {tab === "categories" && <CategoriesSection toast={toast} onStatsChange={handleStatsChange} />}
            {tab === "products"   && <ProductsSection toast={toast} onStatsChange={handleStatsChange} />}
            {tab === "stocks"     && <StocksSection toast={toast} />}
            {tab === "comments"   && <CommentsSection toast={toast} />}
          </div>
        )}
      </div>

      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
    </>
  );
}