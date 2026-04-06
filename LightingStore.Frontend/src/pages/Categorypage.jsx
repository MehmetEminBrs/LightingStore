import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ShoppingCart,
  Heart,
  ChevronRight,
  Star,
  PackageOpen,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";

import Header from "../components/Header";
import Footer from "../components/Footer";

const API_URL = import.meta.env.VITE_API_URL;


function ProductStarRating({ productId }) {
  const [avgRating, setAvgRating] = useState(null);
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    fetch(`${API_URL}/api/products/${productId}/comments`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const avg = data.reduce((a, r) => a + r.rating, 0) / data.length;
          setAvgRating(avg);
          setReviewCount(data.length);
        }
      })
      .catch(() => {});
  }, [productId]);

  if (!avgRating) return null;

  return (
    <div className="flex items-center gap-1 mb-2">
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={11}
            className={i < Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}
          />
        ))}
      </div>
      <span className="text-xs text-gray-500 ml-1">{avgRating.toFixed(1)} ({reviewCount})</span>
    </div>
  );
}

const SORT_OPTIONS = [
  { value: "default", label: "Varsayılan" },
  { value: "price_asc", label: "Fiyat: Düşükten Yükseğe" },
  { value: "price_desc", label: "Fiyat: Yüksekten Düşüğe" },
  { value: "name_asc", label: "İsim: A → Z" },
  { value: "name_desc", label: "İsim: Z → A" },
];

export default function CategoryPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [sortValue, setSortValue] = useState("default");
  const [sortOpen, setSortOpen] = useState(false);

  useEffect(() => {
    fetchCategoryAndProducts();
    if (token) fetchFavorites();
    window.scrollTo(0, 0);
  }, [slug]);

  const fetchCategoryAndProducts = async () => {
    try {
      setLoading(true);

      const catRes = await fetch(`${API_URL}/api/categories`);
      const cats = await catRes.json();
      const found = cats.find(c => c.slug === slug);
      if (!found) { setCategory(null); setProducts([]); return; }
      setCategory(found);

      const prodRes = await fetch(`${API_URL}/api/products?categoryId=${found.categoryId}&limit=100`);
      const prodData = await prodRes.json();
      const list = Array.isArray(prodData) ? prodData : prodData.items || [];
      setProducts(list.filter(p => p.categoryId === found.categoryId));
    } catch (e) {
      console.error("Kategori yüklenemedi:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const res = await fetch(`${API_URL}/api/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFavoriteIds(new Set(Array.isArray(data) ? data.map(f => f.productId) : []));
    } catch (e) {}
  };

  const handleFavorite = async (e, productId) => {
    e.stopPropagation();
    if (!token) { navigate("/login"); return; }
    setFavoriteIds(prev => {
      const next = new Set(prev);
      next.has(productId) ? next.delete(productId) : next.add(productId);
      return next;
    });
    try {
      await fetch(`${API_URL}/api/favorites/${productId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (e) {
      setFavoriteIds(prev => {
        const next = new Set(prev);
        next.has(productId) ? next.delete(productId) : next.add(productId);
        return next;
      });
    }
  };

  const calculateDiscount = (price, discountPrice) => {
    if (!discountPrice) return 0;
    return Math.round(((price - discountPrice) / price) * 100);
  };

  const sortedProducts = [...products].sort((a, b) => {
    const aPrice = a.discountPrice && a.discountPrice < a.price ? a.discountPrice : a.price;
    const bPrice = b.discountPrice && b.discountPrice < b.price ? b.discountPrice : b.price;
    if (sortValue === "price_asc") return aPrice - bPrice;
    if (sortValue === "price_desc") return bPrice - aPrice;
    if (sortValue === "name_asc") return a.productName.localeCompare(b.productName, "tr");
    if (sortValue === "name_desc") return b.productName.localeCompare(a.productName, "tr");
    return 0;
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f7f6f3" }}>
      <Header />

      <main className="max-w-[1400px] mx-auto px-6 py-8">

        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <button onClick={() => navigate("/")} className="hover:text-gray-900 transition">Anasayfa</button>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium">{category?.categoryName || "Kategori"}</span>
        </nav>

        {loading ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="w-10 h-10 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
          </div>
        ) : !category ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <PackageOpen size={32} className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-light text-gray-800 mb-3">Kategori Bulunamadı</h2>
            <button onClick={() => navigate("/")} className="px-8 py-3 bg-gray-900 text-white text-sm tracking-wide hover:bg-gray-800 transition rounded-xl">
              Anasayfaya Dön
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
              <div className="flex items-center gap-5">
                {category.imageUrl && (
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0">
                    <img
                      src={`${API_URL}${category.imageUrl}`}
                      alt={category.categoryName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <h1 className="text-3xl md:text-4xl font-light tracking-wide text-gray-900">
                    {category.categoryName}
                  </h1>
                  {!loading && (
                    <p className="text-sm text-gray-500 mt-1">{products.length} ürün</p>
                  )}
                </div>
              </div>

              {products.length > 1 && (
                <div className="relative">
                  <button
                    onClick={() => setSortOpen(o => !o)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-gray-400 transition"
                  >
                    <SlidersHorizontal size={15} className="text-gray-500" />
                    {SORT_OPTIONS.find(o => o.value === sortValue)?.label}
                    <ChevronDown size={14} className={`transition-transform ${sortOpen ? "rotate-180" : ""}`} />
                  </button>
                  {sortOpen && (
                    <div className="absolute right-0 top-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-20 overflow-hidden min-w-[220px]">
                      {SORT_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => { setSortValue(opt.value); setSortOpen(false); }}
                          className={`w-full text-left px-4 py-3 text-sm transition hover:bg-gray-50 ${sortValue === opt.value ? "text-gray-900 font-medium bg-gray-50" : "text-gray-600"}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {sortedProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-28 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <PackageOpen size={32} className="text-gray-400" />
                </div>
                <h2 className="text-2xl font-light text-gray-800 mb-3">Bu kategoride henüz ürün yok</h2>
                <p className="text-sm text-gray-500 mb-8">Yakında yeni ürünler eklenecek.</p>
                <button onClick={() => navigate("/")} className="px-8 py-3 bg-gray-900 text-white text-sm tracking-wide hover:bg-gray-800 transition rounded-xl">
                  Alışverişe Devam Et
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {sortedProducts.map(product => {
                  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
                  const displayPrice = hasDiscount ? product.discountPrice : product.price;
                  const discountPercent = hasDiscount ? calculateDiscount(product.price, product.discountPrice) : 0;
                  const isFav = favoriteIds.has(product.productId);

                  return (
                    <div
                      key={product.productId}
                      onClick={() => navigate(`/urun/${product.slug}`)}
                      className="group cursor-pointer bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
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
                          <div className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-black text-white text-[11px] font-medium tracking-wide">
                            -{discountPercent}%
                          </div>
                        )}

                        <button
                          onClick={(e) => handleFavorite(e, product.productId)}
                          className={`absolute top-3 right-3 z-10 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full shadow-sm flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition hover:bg-white ${isFav ? "md:opacity-100" : ""}`}
                        >
                          <Heart size={16} className={isFav ? "fill-red-500 text-red-500" : "text-gray-700"} />
                        </button>
                      </div>

                      <div className="p-4">
                        <h3 className="text-sm font-medium text-gray-800 mb-2 line-clamp-2 leading-snug group-hover:text-gray-600 transition">
                          {product.productName}
                        </h3>
                        <ProductStarRating productId={product.productId} />
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-light text-gray-900">
                            ₺{displayPrice?.toLocaleString("tr-TR")}
                          </span>
                          {hasDiscount && (
                            <span className="text-sm text-gray-400 line-through">
                              ₺{product.price?.toLocaleString("tr-TR")}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/urun/${product.slug}`); }}
                          className="w-full mt-3 py-2.5 border border-gray-200 text-gray-700 text-xs tracking-wide rounded-lg hover:bg-gray-900 hover:text-white hover:border-gray-900 transition flex items-center justify-center gap-2"
                        >
                          <ShoppingCart size={13} />
                          Ürüne Git
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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