import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  ShoppingCart,
  ChevronRight,
  PackageOpen,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const API_URL = import.meta.env.VITE_API_URL;


export default function Favorites() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchFavorites();
    window.scrollTo(0, 0);
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFavorites(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Favoriler alınamadı:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchProduct = async () => {
  try {
    setLoading(true);
    const res = await fetch(`${API_URL}/api/products/slug/${slug}`);
    const data = await res.json();
    setProduct(data);
    setSelectedImageIndex(0);

    if (token && data.productId) {
      try {
        const favRes = await fetch(`${API_URL}/api/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const favData = await favRes.json();
        const isFav = Array.isArray(favData) && favData.some(f => f.productId === data.productId);
        setIsFavorited(isFav);
      } catch {
        setIsFavorited(false);
      }
    }

    if (data.categoryId) fetchSimilarProducts(data.categoryId, data.productId);
    if (data.productId) {
      fetchReviews(data.productId);
      fetchStock(data.productId);
    }
  } catch (e) {
    console.error("Ürün yüklenemedi:", e);
  } finally {
    setLoading(false);
  }
};

  const removeFavorite = async (productId) => {
    setRemovingId(productId);
    try {
      await fetch(`${API_URL}/api/favorites/${productId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavorites(prev => prev.filter(item => item.productId !== productId));
    } catch (e) {
      console.error("Favori çıkarılamadı:", e);
    } finally {
      setRemovingId(null);
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f7f6f3" }}>

      <Header />

      <main className="max-w-[1400px] mx-auto px-6 py-8">

        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <button onClick={() => navigate("/")} className="hover:text-gray-900 transition">Anasayfa</button>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium">Favorilerim</span>
        </nav>

        <div className="mb-10">
          <div className="flex items-center gap-3 mb-1">
            <Heart size={22} className="fill-red-500 text-red-500" />
            <h1 className="text-3xl md:text-4xl font-light tracking-wide text-gray-900">Favorilerim</h1>
          </div>
          {!loading && (
            <p className="text-sm text-gray-500 mt-2 ml-9">{favorites.length} ürün kaydedildi</p>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="w-10 h-10 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
          </div>
        ) : favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <PackageOpen size={32} className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-light text-gray-800 mb-3">Henüz favori ürününüz yok</h2>
            <p className="text-sm text-gray-500 mb-8 max-w-xs">Beğendiğiniz ürünleri favorilere ekleyerek daha sonra kolayca bulabilirsiniz.</p>
            <button
              onClick={() => navigate("/")}
              className="px-8 py-3 bg-gray-900 text-white text-sm tracking-wide hover:bg-gray-800 transition rounded-xl"
            >
              Alışverişe Başla
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favorites.map(item => (
              <div
                key={item.productId}
                className="group bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div
                  className="relative aspect-square bg-gray-50 overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/urun/${item.slug || item.productId}`)}
                >
                  {item.productImage ? (
                    <img
                      src={`${API_URL}${item.productImage}`}
                      alt={item.productName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">💡</div>
                  )}

                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteConfirm(item.productId); }}
                    className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-red-50"
                  >
                    <Heart size={16} className="fill-red-500 text-red-500" />
                  </button>
                </div>

                <div className="p-4">
                  <h3
                    className="text-sm font-medium text-gray-800 mb-2 line-clamp-2 cursor-pointer hover:text-gray-600 transition leading-snug"
                    onClick={() => navigate(`/urun/${item.slug || item.productId}`)}
                  >
                    {item.productName}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-light text-gray-900">
                      ₺{(item.discountPrice && item.discountPrice < item.price ? item.discountPrice : item.price)?.toLocaleString("tr-TR")}
                    </span>
                    {item.discountPrice && item.discountPrice < item.price && (
                      <span className="text-sm text-gray-400 line-through">
                        ₺{item.price?.toLocaleString("tr-TR")}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => navigate(`/urun/${item.slug}`)}
                    className="w-full mt-3 py-2.5 border border-gray-200 text-gray-700 text-xs tracking-wide rounded-lg hover:bg-gray-900 hover:text-white hover:border-gray-900 transition flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={14} />
                    Ürüne Git
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-[250] flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full">
            <div className="flex items-center justify-center w-12 h-12 bg-red-50 rounded-full mx-auto mb-4">
              <Heart size={22} className="fill-red-400 text-red-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 text-center mb-2">Favoriden Çıkar</h3>
            <p className="text-sm text-gray-500 text-center mb-6">Bu ürünü favorilerinizden kaldırmak istediğinize emin misiniz?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 border border-gray-200 text-gray-700 text-sm rounded-xl hover:bg-gray-50 transition"
              >
                İptal
              </button>
              <button
                onClick={() => removeFavorite(deleteConfirm)}
                disabled={removingId === deleteConfirm}
                className="flex-1 py-3 bg-red-500 text-white text-sm rounded-xl hover:bg-red-600 transition disabled:opacity-60"
              >
                {removingId === deleteConfirm ? "Kaldırılıyor..." : "Evet, Kaldır"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />

      <style jsx>{`
        * { font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        h1, h2, h3 { font-family: 'Cormorant Garamond', serif; }
      `}</style>
    </div>
  );
}