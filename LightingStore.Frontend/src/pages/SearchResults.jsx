import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  Search, ChevronRight, SlidersHorizontal, X,
  ChevronDown, Star, Heart, ShoppingCart, Package,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
const API_URL = import.meta.env.VITE_API_URL;


const SORT_OPTIONS = [
  { value: "default",    label: "Önerilen" },
  { value: "price-asc",  label: "Fiyat: Düşükten Yükseğe" },
  { value: "price-desc", label: "Fiyat: Yüksekten Düşüğe" },
  { value: "new",        label: "En Yeniler" },
];

function HighlightText({ text, query }) {
  if (!query?.trim()) return <span>{text}</span>;
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

export default function SearchResults() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") || "";

  const [inputValue, setInputValue] = useState(q);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState("default");
  const [sortOpen, setSortOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null); 
  const abortRef = useRef(null);
  const sortRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchResults = useCallback(async (query) => {
    if (!query.trim()) { setProducts([]); return; }
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/products?search=${encodeURIComponent(query)}&limit=50`, { signal: controller.signal });
      if (controller.signal.aborted) return;
      if (!res.ok) { setProducts([]); return; }
      const data = await res.json();
      const all = Array.isArray(data) ? data : (data.items || []);
      const filtered = all.filter(p => p.productName.toLowerCase().includes(query.toLowerCase()));
      setProducts(filtered);
    } catch (err) {
      if (err.name !== "AbortError") setProducts([]);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    setInputValue(q);
    setActiveCategory(null);
    fetchResults(q);
    window.scrollTo(0, 0);
  }, [q, fetchResults]);

  const categories = [...new Map(products.map(p => [p.categoryId, { id: p.categoryId, name: p.categoryName, slug: p.categorySlug }])).values()];

  const sorted = [...products]
    .filter(p => activeCategory ? p.categoryId === activeCategory : true)
    .sort((a, b) => {
      const pa = a.discountPrice && a.discountPrice < a.price ? a.discountPrice : a.price;
      const pb = b.discountPrice && b.discountPrice < b.price ? b.discountPrice : b.price;
      if (sort === "price-asc") return pa - pb;
      if (sort === "price-desc") return pb - pa;
      if (sort === "new") return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      return 0;
    });

  const calcDiscount = (price, disc) => disc ? Math.round(((price - disc) / price) * 100) : 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f7f6f3" }}>
      <Header />

      <main className="max-w-[1400px] mx-auto px-6 py-8">

        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button onClick={() => navigate("/")} className="hover:text-gray-900 transition">Anasayfa</button>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium">Arama Sonuçları</span>
          {q && <><ChevronRight size={14} /><span className="text-gray-500">"{q}"</span></>}
        </nav>

        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="w-10 h-10 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
          </div>
        ) : !q ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Search size={40} className="text-gray-200 mb-4" />
            <p className="text-gray-400 text-sm">Aramak istediğiniz ürünü yukarıya yazın</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-5">
              <Package size={30} className="text-gray-300" />
            </div>
            <h2 className="text-xl font-light text-gray-700 mb-2">Sonuç bulunamadı</h2>
            <p className="text-sm text-gray-400 mb-6 max-w-xs">
              "<span className="font-medium text-gray-600">{q}</span>" için eşleşen ürün bulunamadı. Farklı bir arama yapmayı deneyin.
            </p>
            <button onClick={() => navigate("/")} className="px-6 py-3 bg-gray-900 text-white text-sm tracking-wide rounded-xl hover:bg-gray-800 transition">
              Anasayfaya Dön
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-light text-gray-900">
                  "<span className="font-medium">{q}</span>" için sonuçlar
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">{sorted.length} ürün bulundu</p>
              </div>

              <div className="relative flex-shrink-0" ref={sortRef}>
                <button
                  onClick={() => setSortOpen(p => !p)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-gray-400 transition shadow-sm"
                >
                  <SlidersHorizontal size={14} className="text-gray-500" />
                  {SORT_OPTIONS.find(o => o.value === sort)?.label}
                  <ChevronDown size={13} className={`text-gray-400 transition-transform duration-200 ${sortOpen ? "rotate-180" : ""}`} />
                </button>
                {sortOpen && (
                  <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-xl z-30 overflow-hidden">
                    {SORT_OPTIONS.map(opt => (
                      <button key={opt.value}
                        onClick={() => { setSort(opt.value); setSortOpen(false); }}
                        className={`w-full text-left px-4 py-3 text-sm transition ${sort === opt.value ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-50"}`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {categories.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  onClick={() => setActiveCategory(null)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium border transition ${!activeCategory ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}
                >
                  Tümü <span className="ml-1 opacity-70">({products.length})</span>
                </button>
                {categories.map(cat => {
                  const count = products.filter(p => p.categoryId === cat.id).length;
                  return (
                    <button key={cat.id}
                      onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium border transition ${activeCategory === cat.id ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}
                    >
                      {cat.name} <span className="ml-1 opacity-70">({count})</span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
              {sorted.map(product => {
                const hasDiscount = product.discountPrice && product.discountPrice < product.price;
                const displayPrice = hasDiscount ? product.discountPrice : product.price;
                const discountPct = hasDiscount ? calcDiscount(product.price, product.discountPrice) : 0;
                return (
                  <div
                    key={product.productId}
                    onClick={() => navigate(`/urun/${product.slug}`)}
                    className="group cursor-pointer bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="relative aspect-square bg-gray-50 overflow-hidden">
                      {product.mainImageUrl ? (
                        <img
                          src={`${API_URL}${product.mainImageUrl}`}
                          alt={product.productName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl">💡</div>
                      )}
                      {hasDiscount && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-black text-white text-[10px] font-medium tracking-wide rounded-sm">
                          -{discountPct}%
                        </div>
                      )}
                      {product.isNew && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-medium tracking-wide rounded-sm"
                          style={{ top: hasDiscount ? "2rem" : "0.5rem" }}>
                          YENİ
                        </div>
                      )}
                    </div>

                    <div className="p-3">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">{product.categoryName}</p>
                      <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 leading-snug group-hover:text-gray-600 transition">
                        <HighlightText text={product.productName} query={q} />
                      </h3>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-medium text-gray-900">₺{displayPrice?.toLocaleString("tr-TR")}</span>
                        {hasDiscount && (
                          <span className="text-xs text-gray-400 line-through">₺{product.price?.toLocaleString("tr-TR")}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      <Footer />

      <style jsx>{`
        * { font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        h1, h2, h3 { font-family: 'Cormorant Garamond', serif; }
      `}</style>
    </div>
  );
}