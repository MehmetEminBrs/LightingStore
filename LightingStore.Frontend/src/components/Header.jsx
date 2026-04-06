import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  ShoppingCart, User, Search, Heart, ChevronRight,
  ChevronDown, Menu, X, Settings, LogOut, ArrowRight, Clock,
} from "lucide-react";

function AuthPopup({ type, onClose, onLogin }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-[300] flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
          <X size={16} className="text-gray-400" />
        </button>
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
          {type === "cart" ? <ShoppingCart size={26} className="text-gray-500" /> : <Heart size={26} className="text-gray-500" />}
        </div>
        <h3 className="text-base font-medium text-gray-900 mb-2">
          {type === "cart" ? "Sepetinizi görebilmek için" : "Favorilerinizi görebilmek için"}
        </h3>
        <p className="text-sm text-gray-400 mb-6">giriş yapmanız gerekmektedir</p>
        <button onClick={onLogin} className="w-full py-3 bg-gray-900 text-white text-sm tracking-wide rounded-xl hover:bg-gray-800 transition">Giriş Yap</button>
        <button onClick={onClose} className="mt-3 text-xs text-gray-400 hover:text-gray-600 transition block w-full">Vazgeç</button>
      </div>
    </div>
  );
}

const getUsernameFromToken = (tkn) => {
  if (!tkn) return "";
  try {
    const p = JSON.parse(atob(tkn.split(".")[1]));
    return p["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || p.name || p.username || p.email || p.sub || "";
  } catch { return ""; }
};

const getRoleFromToken = (tkn) => {
  if (!tkn) return null;
  try {
    const p = JSON.parse(atob(tkn.split(".")[1]));
    return (
      p["role"] ||
      p["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      p["roleId"] ||
      null
    );
  } catch {
    return null;
  }
};

function HighlightText({ text, query }) {
  if (!query.trim()) return <span>{text}</span>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part)
          ? <mark key={i} className="bg-amber-100 text-amber-800 rounded-sm px-0.5 not-italic">{part}</mark>
          : <span key={i}>{part}</span>
      )}
    </span>
  );
}

function useSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ products: [], categories: [] });
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  const doSearch = useCallback(async (q) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const API_URL =import.meta.env.VITE_API_URL;

      const [prodRes, catRes] = await Promise.allSettled([
        fetch(`${API_URL}/api/products?search=${encodeURIComponent(q)}&limit=6`, { signal: controller.signal }),
        fetch(`${API_URL}/api/categories`, { signal: controller.signal }),
      ]);

      if (controller.signal.aborted) return;

      let products = [];
      if (prodRes.status === "fulfilled" && prodRes.value.ok) {
        const data = await prodRes.value.json();
        const all = Array.isArray(data) ? data : (data.items || []);
        products = all
          .filter(p => p.productName.toLowerCase().includes(q.toLowerCase()))
          .slice(0, 6);
      }

      let categories = [];
      if (catRes.status === "fulfilled" && catRes.value.ok) {
        const data = await catRes.value.json();
        categories = (Array.isArray(data) ? data : [])
          .filter(c => c.isActive && c.categoryName.toLowerCase().includes(q.toLowerCase()))
          .slice(0, 3);
      }

      setResults({ products, categories });
    } catch (err) {
      if (err.name !== "AbortError") setResults({ products: [], categories: [] });
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setResults({ products: [], categories: [] });
    if (query.trim()) {
      setLoading(true);
      debounceRef.current = setTimeout(() => doSearch(query), 280);
    } else {
      setLoading(false);
      if (abortRef.current) abortRef.current.abort();
    }
    return () => clearTimeout(debounceRef.current);
  }, [query, doSearch]);

  return { query, setQuery, results, loading };
}

function MobileSearchOverlay({ onClose }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const { query, setQuery, results, loading } = useSearch();
  const [recentSearches, setRecentSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem("recentSearches") || "[]"); } catch { return []; }
  });

  const API_URL = import.meta.env.VITE_API_URL;


  useEffect(() => {
    inputRef.current?.focus();
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const saveRecent = (term) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 6);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const goProduct = (product) => { saveRecent(query || product.productName); onClose(); navigate(`/urun/${product.slug}`); };
  const goCategory = (cat) => { saveRecent(cat.categoryName); onClose(); navigate(`/kategori/${cat.slug}`); };
  const handleSubmit = (e) => { e.preventDefault(); if (!query.trim()) return; saveRecent(query); onClose(); navigate(`/search?q=${encodeURIComponent(query)}`); };

  const hasResults = results.products.length > 0 || results.categories.length > 0;
  const showEmpty = query.trim() && !loading && !hasResults;

  return (
    <div className="fixed inset-0 z-[200]" style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div className="w-full bg-white shadow-2xl" style={{ maxHeight: "90vh" }} onClick={e => e.stopPropagation()}>
        <div className="max-w-[1400px] mx-auto px-4">
          <form onSubmit={handleSubmit} className="flex items-center gap-3 py-4 border-b border-gray-100">
            <Search size={19} className="text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Ürün veya kategori ara..."
              className="flex-1 text-base text-gray-900 placeholder-gray-300 outline-none bg-transparent"
            />
            {loading && <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin flex-shrink-0" />}
            {query && !loading && (
              <button type="button" onClick={() => setQuery("")} className="p-1.5 hover:bg-gray-100 rounded-full transition">
                <X size={15} className="text-gray-400" />
              </button>
            )}
            <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
              <X size={19} className="text-gray-500" />
            </button>
          </form>
        </div>

        <div className="max-w-[1400px] mx-auto px-4 py-4 overflow-y-auto" style={{ maxHeight: "calc(90vh - 72px)" }}>

          {!query && recentSearches.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Son Aramalar</span>
                <button onClick={() => { setRecentSearches([]); localStorage.removeItem("recentSearches"); }} className="text-[10px] text-gray-400 hover:text-gray-600 transition">Temizle</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term, i) => (
                  <button key={i} onClick={() => setQuery(term)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full text-sm text-gray-600 transition">
                    <Clock size={11} className="text-gray-400" />{term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.categories.length > 0 && (
            <div className="mb-4">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block mb-2">Kategoriler</span>
              {results.categories.map(cat => (
                <button key={cat.categoryId} onClick={() => goCategory(cat)}
                  className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-gray-50 transition group text-left">
                  <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {cat.imageUrl && <img src={`${API_URL}${cat.imageUrl}`} alt={cat.categoryName} className="w-full h-full object-cover" />}
                  </div>
                  <span className="flex-1 text-sm text-gray-700 font-medium"><HighlightText text={cat.categoryName} query={query} /></span>
                  <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500 transition" />
                </button>
              ))}
            </div>
          )}

          {results.products.length > 0 && (
            <div className="mb-4">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block mb-2">Ürünler</span>
              {results.products.map(product => {
                const displayPrice = product.discountPrice && product.discountPrice < product.price ? product.discountPrice : product.price;
                const hasDiscount = product.discountPrice && product.discountPrice < product.price;
                return (
                  <button key={product.productId} onClick={() => goProduct(product)}
                    className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-gray-50 transition group text-left">
                    <div className="w-11 h-11 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                      {product.mainImageUrl
                        ? <img src={`${API_URL}${product.mainImageUrl}`} alt={product.productName} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-lg">💡</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">{product.categoryName}</p>
                      <p className="text-sm text-gray-800 font-medium line-clamp-1"><HighlightText text={product.productName} query={query} /></p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-sm font-medium text-gray-900">₺{displayPrice?.toLocaleString("tr-TR")}</p>
                      {hasDiscount && <p className="text-[10px] text-gray-400 line-through">₺{product.price?.toLocaleString("tr-TR")}</p>}
                    </div>
                  </button>
                );
              })}

              {query.trim() && (
                <button onClick={() => { saveRecent(query); onClose(); navigate(`/search?q=${encodeURIComponent(query)}`); }}
                  className="w-full mt-2 py-3 border border-dashed border-gray-200 rounded-xl text-xs text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition flex items-center justify-center gap-1.5">
                  <Search size={12} />
                  "<span className="font-semibold text-gray-700">{query}</span>" için tüm sonuçları gör
                </button>
              )}
            </div>
          )}

          {showEmpty && (
            <div className="py-12 text-center">
              <Search size={24} className="text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-500 font-medium">Sonuç bulunamadı</p>
              <p className="text-xs text-gray-400 mt-1">"{query}" için eşleşen sonuç yok</p>
            </div>
          )}

          {!query && recentSearches.length === 0 && (
            <div className="text-center py-10 text-gray-400 text-sm">
              <Search size={26} className="mx-auto mb-3 text-gray-200" />
              Ürün adı veya kategori yazın
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DesktopSearchBar() {
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const { query, setQuery, results, loading } = useSearch();
  const [open, setOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem("recentSearches") || "[]"); } catch { return []; }
  });

  const API_URL = import.meta.env.VITE_API_URL;


  useEffect(() => {
    const handler = (e) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const saveRecent = (term) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 6);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const goProduct = (product) => { saveRecent(query || product.productName); setOpen(false); setQuery(""); navigate(`/urun/${product.slug}`); };
  const goCategory = (cat) => { saveRecent(cat.categoryName); setOpen(false); setQuery(""); navigate(`/kategori/${cat.slug}`); };
  const handleSubmit = (e) => { e.preventDefault(); if (!query.trim()) return; saveRecent(query); setOpen(false); navigate(`/search?q=${encodeURIComponent(query)}`); setQuery(""); };

  const hasResults = results.products.length > 0 || results.categories.length > 0;
  const showEmpty = query.trim() && !loading && !hasResults;
  const showDropdown = open && (query.trim() || recentSearches.length > 0);

  return (
    <div ref={wrapperRef} className="relative w-full max-w-xl">
      <form onSubmit={handleSubmit} className={`flex items-center bg-gray-50 border transition-all duration-200 rounded-2xl overflow-hidden ${open ? "border-gray-400 shadow-md bg-white" : "border-gray-200 hover:border-gray-300"}`}>
        <Search size={16} className="ml-4 text-gray-400 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Ürün veya kategori ara..."
          className="flex-1 px-3 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
        />
        {loading && <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin mr-3 flex-shrink-0" />}
        {query && !loading && (
          <button type="button" onClick={() => { setQuery(""); inputRef.current?.focus(); }} className="mr-1 p-1.5 hover:bg-gray-100 rounded-full transition">
            <X size={13} className="text-gray-400" />
          </button>
        )}
        <button type="submit" className="mr-2 px-3 py-1.5 bg-gray-900 text-white text-xs tracking-wide rounded-xl hover:bg-gray-700 transition flex-shrink-0">Ara</button>
      </form>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl z-[200] overflow-hidden" style={{ maxHeight: "480px", overflowY: "auto" }}>

          {!query && recentSearches.length > 0 && (
            <div className="p-3 border-b border-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Son Aramalar</span>
                <button onClick={() => { setRecentSearches([]); localStorage.removeItem("recentSearches"); }} className="text-[10px] text-gray-400 hover:text-gray-600 transition">Temizle</button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recentSearches.map((term, i) => (
                  <button key={i} onClick={() => { setQuery(term); inputRef.current?.focus(); }}
                    className="flex items-center gap-1 px-2.5 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full text-xs text-gray-600 transition">
                    <Clock size={10} className="text-gray-400" />{term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.categories.length > 0 && (
            <div className="p-3 border-b border-gray-50">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block mb-2">Kategoriler</span>
              {results.categories.map(cat => (
                <button key={cat.categoryId} onClick={() => goCategory(cat)}
                  className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 transition group text-left">
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {cat.imageUrl && <img src={`${API_URL}${cat.imageUrl}`} alt={cat.categoryName} className="w-full h-full object-cover" />}
                  </div>
                  <span className="flex-1 text-sm text-gray-700 font-medium"><HighlightText text={cat.categoryName} query={query} /></span>
                  <ChevronRight size={13} className="text-gray-300 group-hover:text-gray-500 transition" />
                </button>
              ))}
            </div>
          )}

          {results.products.length > 0 && (
            <div className="p-3">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block mb-2">Ürünler</span>
              {results.products.map(product => {
                const displayPrice = product.discountPrice && product.discountPrice < product.price ? product.discountPrice : product.price;
                const hasDiscount = product.discountPrice && product.discountPrice < product.price;
                return (
                  <button key={product.productId} onClick={() => goProduct(product)}
                    className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 transition group text-left">
                    <div className="w-10 h-10 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                      {product.mainImageUrl
                        ? <img src={`${API_URL}${product.mainImageUrl}`} alt={product.productName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        : <div className="w-full h-full flex items-center justify-center text-lg">💡</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">{product.categoryName}</p>
                      <p className="text-sm text-gray-800 font-medium line-clamp-1"><HighlightText text={product.productName} query={query} /></p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-sm font-medium text-gray-900">₺{displayPrice?.toLocaleString("tr-TR")}</p>
                      {hasDiscount && <p className="text-[10px] text-gray-400 line-through">₺{product.price?.toLocaleString("tr-TR")}</p>}
                    </div>
                    <ArrowRight size={13} className="text-gray-300 group-hover:text-gray-600 transition flex-shrink-0" />
                  </button>
                );
              })}

              {query.trim() && (
                <button onClick={() => { saveRecent(query); setOpen(false); navigate(`/search?q=${encodeURIComponent(query)}`); setQuery(""); }}
                  className="w-full mt-2 py-2.5 border border-dashed border-gray-200 rounded-xl text-xs text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition flex items-center justify-center gap-1.5">
                  <Search size={12} />
                  "<span className="font-semibold text-gray-700">{query}</span>" için tüm sonuçları gör
                </button>
              )}
            </div>
          )}

          {showEmpty && (
            <div className="py-10 text-center">
              <Search size={22} className="text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-500 font-medium">Sonuç bulunamadı</p>
              <p className="text-xs text-gray-400 mt-1">"{query}" için eşleşen sonuç yok</p>
            </div>
          )}

          {!query && recentSearches.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">
              <Search size={24} className="mx-auto mb-2 text-gray-200" />
              Ürün adı veya kategori yazın
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const username = getUsernameFromToken(token);
  const role = getRoleFromToken(token);
  const [categories, setCategories] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const dropdownTimeoutRef = useRef(null);

  const cartDropdownRef = useRef(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);

  const [favoriteCount, setFavoriteCount] = useState(0);
  const [authPopup, setAuthPopup] = useState(null);

  const userDropdownRef = useRef(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then(r => r.json())
      .then(data => setCategories(data.filter(c => c.isActive)))
      .catch(() => {});
  }, []);

  useEffect(() => { if (token) fetchCartPreview(); }, []);
  useEffect(() => { if (token) fetchFavoriteCount(); }, []);

  useEffect(() => {
    const handler = () => { if (token) fetchCartPreview(); };
    window.addEventListener("cartUpdated", handler);
    return () => window.removeEventListener("cartUpdated", handler);
  }, [token]);

  useEffect(() => {
    const handler = (e) => { if (cartDropdownRef.current && !cartDropdownRef.current.contains(e.target)) setCartOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) setUserDropdownOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchCartPreview = async () => {
    setCartLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/cart`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setCartItems(Array.isArray(data) ? data : []);
    } catch { setCartItems([]); }
    finally { setCartLoading(false); }
  };

  const fetchFavoriteCount = async () => {
    try {
      const res = await fetch(`${API_URL}/api/favorites`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setFavoriteCount(Array.isArray(data) ? data.length : 0);
    } catch { setFavoriteCount(0); }
  };

  const logout = () => { localStorage.removeItem("token"); navigate("/"); };
  const handleMouseEnterDropdown = () => { if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current); setCategoriesDropdownOpen(true); };
  const handleMouseLeaveDropdown = () => { dropdownTimeoutRef.current = setTimeout(() => setCategoriesDropdownOpen(false), 200); };
  const totalCartQuantity = cartItems.reduce((s, i) => s + i.quantity, 0);

  return (
    <>
      {authPopup && <AuthPopup type={authPopup} onClose={() => setAuthPopup(null)} onLogin={() => { setAuthPopup(null); navigate("/login"); }} />}
      {mobileSearchOpen && <MobileSearchOverlay onClose={() => setMobileSearchOpen(false)} />}

      <div className="bg-gray-200 text-black">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-between py-2 text-xs tracking-wide">
            <span>500₺ ÜZERİ ÜCRETSİZ KARGO</span>
            <div className="hidden md:flex items-center gap-6">
              <a href="#" className="hover:text-gray-600 transition">Destek</a>
              <span className="text-gray-600">|</span>
              <a href="#" className="hover:text-gray-600 transition">Sipariş Takibi</a>
            </div>
          </div>
        </div>
      </div>

      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center gap-5 py-4">

            <div onClick={() => navigate("/")} className="cursor-pointer flex-shrink-0">
              <h1 className="text-2xl font-light tracking-widest text-gray-900">LUMINA<sup className="text-[10px]">®</sup></h1>
            </div>

            <nav className="hidden lg:flex items-center gap-8 flex-shrink-0">
  <button 
    onClick={() => navigate("/")} 
    className="text-sm tracking-wide text-gray-700 hover:text-gray-900 transition font-medium whitespace-nowrap"
  >
    Anasayfa
  </button>

  {(role === "Admin" || role === "admin" || role === 1) && (
    <button
      onClick={() => navigate("/admin")}
      className="text-sm tracking-wide text-gray-700 hover:text-gray-900 transition font-medium whitespace-nowrap"
    >
      Admin Panel
    </button>
  )}
              <div className="relative" onMouseEnter={handleMouseEnterDropdown} onMouseLeave={handleMouseLeaveDropdown}>
                <button className="text-sm tracking-wide text-gray-600 hover:text-gray-900 transition flex items-center gap-1 whitespace-nowrap">
                  Kategoriler
                  <ChevronDown size={13} className={`transition-transform duration-200 ${categoriesDropdownOpen ? "rotate-180" : ""}`} />
                </button>
                {categoriesDropdownOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-white shadow-2xl border border-gray-100 rounded-2xl overflow-hidden p-3 z-50" style={{ width: "340px" }}>
                    <div className="grid grid-cols-3 gap-2">
                      {categories.map(category => (
                        <button key={category.categoryId} onClick={() => { navigate(`/kategori/${category.slug}`); setCategoriesDropdownOpen(false); }}
                          className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-gray-50 transition group/item">
                          <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 mb-2 flex-shrink-0">
                            <img src={`${API_URL}${category.imageUrl}`} alt={category.categoryName} className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-300" />
                          </div>
                          <span className="text-xs text-gray-700 text-center leading-tight line-clamp-2">{category.categoryName}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button className="text-sm tracking-wide text-gray-600 hover:text-gray-900 transition whitespace-nowrap">Ürünler</button>
            </nav>

            <div className="hidden md:flex flex-1 justify-center">
              <DesktopSearchBar />
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 ml-auto lg:ml-0">

              <button onClick={() => setMobileSearchOpen(true)} className="md:hidden p-2 hover:bg-gray-50 rounded-full transition">
                <Search size={20} className="text-gray-700" />
              </button>

              {!token ? (
                <button onClick={() => navigate("/login")} className="hidden md:block p-2 hover:bg-gray-50 rounded-full transition">
                  <User size={20} className="text-gray-700" />
                </button>
              ) : (
                <div className="relative hidden md:block" ref={userDropdownRef}>
                  <button onClick={() => setUserDropdownOpen(p => !p)} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-full transition">
                    <User size={20} className="text-gray-700" />
                    {username && <span className="text-sm text-gray-700 font-medium">{username}</span>}
                    <ChevronDown size={13} className={`text-gray-500 transition-transform duration-200 ${userDropdownOpen ? "rotate-180" : ""}`} />
                  </button>
                  {userDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden">
                      <button onClick={() => { setUserDropdownOpen(false); navigate("/profil"); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition">
                        <Settings size={16} className="text-gray-500" /> Kullanıcı Ayarlarım
                      </button>
                      <div className="border-t border-gray-50" />
                      <button onClick={() => { setUserDropdownOpen(false); logout(); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition">
                        <LogOut size={16} className="text-gray-500" /> Çıkış Yap
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button onClick={() => { if (!token) { setAuthPopup("favorites"); return; } navigate("/favorites"); }}
                className="hidden md:block p-2 hover:bg-gray-50 rounded-full transition relative">
                <Heart size={20} className="text-gray-700" />
                {token && favoriteCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-gray-900 text-white text-[10px] rounded-full flex items-center justify-center">{favoriteCount}</span>
                )}
              </button>

              <div className="relative" ref={cartDropdownRef}>
                <button onClick={() => { if (!token) { setAuthPopup("cart"); return; } setCartOpen(p => !p); if (!cartOpen) fetchCartPreview(); }}
                  className="p-2 hover:bg-gray-50 rounded-full transition relative">
                  <ShoppingCart size={20} className="text-gray-700" />
                  {token && totalCartQuantity > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-gray-900 text-white text-[10px] rounded-full flex items-center justify-center">{totalCartQuantity}</span>
                  )}
                </button>

                {cartOpen && token && (
                  <div className="absolute right-0 top-full mt-3 w-80 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">Sepetim</span>
                      <button onClick={() => setCartOpen(false)}><X size={16} className="text-gray-400 hover:text-gray-700 transition" /></button>
                    </div>
                    {cartLoading ? (
                      <div className="flex items-center justify-center py-10">
                        <div className="w-7 h-7 border-2 border-gray-200 border-t-gray-700 rounded-full animate-spin" />
                      </div>
                    ) : cartItems.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center px-5">
                        <ShoppingCart size={28} className="text-gray-300 mb-3" />
                        <p className="text-sm text-gray-500">Sepetiniz boş</p>
                      </div>
                    ) : (
                      <>
                        <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                          {cartItems.map(item => {
                            const unitPrice = item.discountPrice ?? item.price;
                            return (
                              <div key={item.productId} className="flex gap-3 px-5 py-3 hover:bg-gray-50 transition">
                                <div className="w-14 h-14 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                  {item.mainImageUrl
                                    ? <img src={`${API_URL}${item.mainImageUrl}`} alt={item.productName} className="w-full h-full object-cover" />
                                    : <div className="w-full h-full flex items-center justify-center text-xl">💡</div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-gray-800 line-clamp-1">{item.productName}</p>
                                  <p className="text-xs text-gray-400 mt-0.5">{item.quantity} adet</p>
                                  <p className="text-xs font-medium text-gray-900 mt-1">₺{(unitPrice * item.quantity).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="px-5 py-4 border-t border-gray-100 bg-gray-50">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-gray-600">Toplam</span>
                            <span className="text-sm font-medium text-gray-900">
                              ₺{cartItems.reduce((s, i) => s + (i.total ?? 0), 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <button onClick={() => { setCartOpen(false); navigate("/cart"); }} className="w-full py-2.5 bg-gray-900 text-white text-xs tracking-wide rounded-xl hover:bg-gray-800 transition">
                            Sepete Git
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 hover:bg-gray-50 rounded-full transition">
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/30 z-50 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="w-80 h-full bg-white overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-light tracking-widest">MENÜ</h2>
                <button onClick={() => setMobileMenuOpen(false)}><X size={20} /></button>
              </div>

              <nav className="space-y-4">
                <button onClick={() => { navigate("/"); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-gray-900 font-medium">Anasayfa</button>
                <div>
                  <button onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)} className="flex items-center justify-between w-full py-2 text-gray-900 font-medium">
                    <span>Kategoriler</span>
                    <ChevronDown size={16} className={`transition-transform duration-200 ${mobileCategoriesOpen ? "rotate-180" : ""}`} />
                  </button>
                  {mobileCategoriesOpen && (
                    <div className="ml-4 mt-2 space-y-2">
                      {categories.map(category => (
                        <button key={category.categoryId}
                          onClick={() => { navigate(`/kategori/${category.slug}`); setMobileMenuOpen(false); setMobileCategoriesOpen(false); }}
                          className="block w-full text-left py-2 text-sm text-gray-700 hover:text-gray-900">
                          {category.categoryName}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button className="block w-full text-left py-2 text-gray-700 hover:text-gray-900">Ürünler</button>
              </nav>

              {!token ? (
                <button onClick={() => { navigate("/login"); setMobileMenuOpen(false); }} className="w-full mt-8 py-3 bg-gray-900 text-white text-sm tracking-wide hover:bg-gray-800 transition rounded-xl">Giriş Yap</button>
              ) : (
                <div className="mt-8 space-y-3">
                  <button onClick={() => { navigate("/favorites"); setMobileMenuOpen(false); }} className="w-full py-3 border border-gray-200 text-gray-700 text-sm tracking-wide hover:bg-gray-50 transition flex items-center justify-center gap-2 rounded-xl">
                    <Heart size={16} /> Favorilerim
                  </button>
                  <button onClick={() => { navigate("/profil"); setMobileMenuOpen(false); }} className="w-full py-3 border border-gray-200 text-gray-700 text-sm tracking-wide hover:bg-gray-50 transition flex items-center justify-center gap-2 rounded-xl">
                    <Settings size={16} /> Kullanıcı Ayarlarım
                  </button>
                  <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="w-full py-3 bg-gray-900 text-white text-sm tracking-wide hover:bg-gray-800 transition flex items-center justify-center gap-2 rounded-xl">
                    <LogOut size={16} /> Çıkış Yap
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}