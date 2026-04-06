import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  ChevronRight,
  Minus,
  Plus,
  Trash2,
  PackageOpen,
  Tag,
  ArrowRight,
  Check,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Cart() {
  const API_URL = import.meta.env.VITE_API_URL;

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [stockMap, setStockMap] = useState({});

  const showToast = (message) => {
    setToast({ message });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetchCart();
    window.scrollTo(0, 0);
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const items = Array.isArray(data) ? data : [];
      setCartItems(items);

      if (items.length > 0) {
        const stockResults = await Promise.allSettled(
          items.map(item =>
            fetch(`${API_URL}/api/stocks/${item.productId}`).then(r => r.ok ? r.json() : null)
          )
        );
        const map = {};
        stockResults.forEach((result, idx) => {
          const productId = items[idx].productId;
          map[productId] = result.status === "fulfilled" ? result.value : null;
        });
        setStockMap(map);
      }
    } catch (e) {
      console.error("Sepet yüklenemedi:", e);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQty) => {
    if (newQty < 1) return;

    const stock = stockMap[productId];
    const maxQty = stock?.quantity ?? 99;
    if (newQty > maxQty) return;

    setUpdatingId(productId);
    try {
      await fetch(`${API_URL}/api/cart/remove/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetch(`${API_URL}/api/cart/add?productId=${productId}&quantity=${newQty}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems(prev =>
        prev.map(item =>
          item.productId === productId
            ? { ...item, quantity: newQty, total: newQty * (item.discountPrice ?? item.price) }
            : item
        )
      );
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const removeItem = async (productId) => {
    try {
      await fetch(`${API_URL}/api/cart/remove/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems(prev => prev.filter(item => item.productId !== productId));
      showToast("Ürün sepetten çıkarıldı");
    } catch (e) {
      console.error(e);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.total ?? 0), 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const freeShippingThreshold = 500;
  const shippingCost = subtotal >= freeShippingThreshold ? 0 : 49.90;
  const remaining = freeShippingThreshold - subtotal;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f7f6f3" }}>

      <Header />

      <main className="max-w-[1400px] mx-auto px-6 py-8">

        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <button onClick={() => navigate("/")} className="hover:text-gray-900 transition">Anasayfa</button>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium">Sepetim</span>
        </nav>

        <div className="mb-10">
          <div className="flex items-center gap-3 mb-1">
            <ShoppingCart size={22} className="text-gray-800" />
            <h1 className="text-3xl md:text-4xl font-light tracking-wide text-gray-900">Sepetim</h1>
          </div>
          {!loading && cartItems.length > 0 && (
            <p className="text-sm text-gray-500 mt-2 ml-9">{totalItems} ürün</p>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="w-10 h-10 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
          </div>
        ) : cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <PackageOpen size={32} className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-light text-gray-800 mb-3">Sepetiniz boş</h2>
            <p className="text-sm text-gray-500 mb-8 max-w-xs">Beğendiğiniz ürünleri sepete ekleyerek alışverişe başlayabilirsiniz.</p>
            <button onClick={() => navigate("/")} className="px-8 py-3 bg-gray-900 text-white text-sm tracking-wide hover:bg-gray-800 transition rounded-xl">
              Alışverişe Başla
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            <div className="lg:col-span-2 space-y-4">

              {subtotal < freeShippingThreshold && (
                <div className="bg-white border border-gray-200 rounded-xl p-4 mb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag size={14} className="text-gray-500" />
                    <span className="text-xs text-gray-600">
                      Ücretsiz kargo için <span className="font-semibold text-gray-900">₺{remaining.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span> daha ekleyin
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-900 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((subtotal / freeShippingThreshold) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
              {subtotal >= freeShippingThreshold && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-2 flex items-center gap-2">
                  <Check size={15} className="text-green-600" />
                  <span className="text-xs text-green-700 font-medium">Tebrikler! Ücretsiz kargo kazandınız</span>
                </div>
              )}

              {cartItems.map(item => {
                const unitPrice = item.discountPrice ?? item.price;
                const hasDiscount = item.discountPrice && item.discountPrice < item.price;
                const isUpdating = updatingId === item.productId;
                const stock = stockMap[item.productId];
                const maxQty = stock?.quantity ?? 99;
                const atMaxStock = item.quantity >= maxQty;

                return (
                  <div key={item.productId} className={`bg-white border border-gray-200 rounded-xl p-5 flex gap-5 transition-opacity ${isUpdating ? "opacity-60" : ""}`}>
                    <div
                      className="w-24 h-24 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden cursor-pointer"
                      onClick={() => navigate(`/urun/${item.slug}`)}
                    >
                      {item.mainImageUrl ? (
                        <img src={`${API_URL}${item.mainImageUrl}`} alt={item.productName} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">💡</div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">{item.categoryName}</p>
                          <h3
                            className="text-sm font-medium text-gray-900 line-clamp-2 cursor-pointer hover:text-gray-600 transition"
                            onClick={() => navigate(`/urun/${item.slug}`)}
                          >
                            {item.productName}
                          </h3>
                        </div>
                        <button
                          onClick={() => setDeleteConfirm(item.productId)}
                          className="flex-shrink-0 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              disabled={isUpdating || item.quantity <= 1}
                              className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition text-gray-700 disabled:opacity-40"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="w-9 text-center text-sm font-medium text-gray-900">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              disabled={isUpdating || atMaxStock}
                              className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition text-gray-700 disabled:opacity-40"
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                          {atMaxStock && (
                            <span className="text-[10px] text-amber-600 font-medium">Maksimum stok adedi</span>
                          )}
                        </div>

                        <div className="text-right">
                          <div className="text-base font-medium text-gray-900">
                            ₺{(unitPrice * item.quantity).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                          </div>
                          {hasDiscount && (
                            <div className="flex items-center gap-1.5 justify-end mt-0.5">
                              <span className="text-xs text-gray-400 line-through">
                                ₺{(item.price * item.quantity).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          )}
                          <div className="text-[11px] text-gray-400 mt-0.5">
                            {item.quantity} × ₺{unitPrice.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-28">
                <h2 className="text-xl font-light tracking-wide text-gray-900 mb-6">Sipariş Özeti</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Ara Toplam ({totalItems} ürün)</span>
                    <span className="text-gray-900 font-medium">₺{subtotal.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Kargo</span>
                    {shippingCost === 0 ? (
                      <span className="text-green-600 font-medium">Ücretsiz</span>
                    ) : (
                      <span className="text-gray-900 font-medium">₺{shippingCost.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-medium text-gray-900">Toplam</span>
                    <span className="text-2xl font-light text-gray-900">
                      ₺{(subtotal + shippingCost).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 text-right">KDV dahil</p>
                </div>

                <button className="w-full py-4 bg-gray-900 text-white text-sm tracking-wide hover:bg-gray-800 transition rounded-xl flex items-center justify-center gap-2 font-medium">
                  Siparişi Tamamla
                  <ArrowRight size={16} />
                </button>

                <button
                  onClick={() => navigate("/")}
                  className="w-full mt-3 py-3 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50 transition"
                >
                  Alışverişe Devam Et
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-[250] flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full">
            <div className="flex items-center justify-center w-12 h-12 bg-red-50 rounded-full mx-auto mb-4">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 text-center mb-2">Ürünü Çıkar</h3>
            <p className="text-sm text-gray-500 text-center mb-6">Bu ürünü sepetten çıkarmak istediğinize emin misiniz?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 border border-gray-200 text-gray-700 text-sm rounded-xl hover:bg-gray-50 transition">
                İptal
              </button>
              <button onClick={() => removeItem(deleteConfirm)} className="flex-1 py-3 bg-red-500 text-white text-sm rounded-xl hover:bg-red-600 transition">
                Evet, Çıkar
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] px-4">
          <div className="rounded-2xl shadow-2xl px-6 py-3 flex items-center gap-3 bg-gray-900 text-white">
            <Check size={16} className="text-green-400" />
            <span className="text-sm font-medium">{toast.message}</span>
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