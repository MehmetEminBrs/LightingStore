import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import {
  ShoppingCart,
  Heart,
  ChevronRight,
  ChevronLeft,
  Star,
  Truck,
  Shield,
  RotateCcw,
  X,
  Minus,
  Plus,
  Check,
  AlertCircle,
  ZoomIn,
  Trash2,
  SlidersHorizontal,
  User,
} from "lucide-react";

import Header from "../components/Header";
import Footer from "../components/Footer";

const API = import.meta.env.VITE_API_URL;

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);

  const [addedToCart, setAddedToCart] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);

  const [stockData, setStockData] = useState(null);
  const [stockLoading, setStockLoading] = useState(true);

  const [reviewForm, setReviewForm] = useState({ rating: 0, content: "" });
  const [ratingWarning, setRatingWarning] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [loginPopup, setLoginPopup] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [submitConfirm, setSubmitConfirm] = useState(false);

  const [ratingFilter, setRatingFilter] = useState(0);

  const [toast, setToast] = useState(null);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getCurrentUserId = () => {
    try {
      if (!token) return 0;
      const payload = JSON.parse(atob(token.split(".")[1]));
      const val =
        payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
        payload["nameid"] ||
        payload["sub"] ||
        0;
      return parseInt(val);
    } catch {
      return 0;
    }
  };
  const currentUserId = getCurrentUserId();

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);
  }, [slug]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/products/slug/${slug}`);
      const data = await res.json();
      setProduct(data);
      setSelectedImageIndex(0);

      if (token && data.productId) {
        try {
          const favRes = await fetch(`${API}/api/favorites`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const favData = await favRes.json();
          setIsFavorited(Array.isArray(favData) && favData.some(f => f.productId === data.productId));
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

  const fetchStock = async (productId) => {
    try {
      setStockLoading(true);
      const res = await fetch(`${API}/api/stocks/${productId}`);
      if (res.ok) {
        const data = await res.json();
        setStockData(data);
      } else {
        setStockData(null);
      }
    } catch {
      setStockData(null);
    } finally {
      setStockLoading(false);
    }
  };

  const fetchReviews = async (productId) => {
    try {
      const res = await fetch(`${API}/api/products/${productId}/comments`);
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch {
      setReviews([]);
    }
  };

  const submitReview = async () => {
    if (!reviewForm.content.trim()) return;
    setSubmitConfirm(false);
    setReviewSubmitting(true);
    try {
      const res = await fetch(`${API}/api/products/${product.productId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: reviewForm.content, rating: reviewForm.rating })
      });
      if (res.ok) {
        setReviewForm({ rating: 0, content: "" });
        await fetchReviews(product.productId);
        showToast("Yorum gönderildi");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const deleteReview = async (commentId) => {
    try {
      await fetch(`${API}/api/products/${product.productId}/comments/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(prev => prev.filter(r => r.commentId !== commentId));
      showToast("Yorum silindi");
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSimilarProducts = async (categoryId, currentProductId) => {
    try {
      const res = await fetch(`${API}/api/products?categoryId=${categoryId}&limit=8`);
      const data = await res.json();
      const filtered = (Array.isArray(data) ? data : data.items || [])
        .filter(p => p.productId !== currentProductId && p.categoryId === categoryId)
        .slice(0, 4);
      setSimilarProducts(filtered);
    } catch {
      setSimilarProducts([]);
    }
  };

  const calculateDiscount = (price, discountPrice) => {
    if (!discountPrice) return 0;
    return Math.round(((price - discountPrice) / price) * 100);
  };

  const handleAddToCart = async () => {
    if (isOutOfStock || cartLoading) return;

    if (!token) {
      setShowAuthPopup(true);
      return;
    }

    const availableStock = stockData?.quantity ?? Infinity;
    if (quantity > availableStock) {
      showToast(`Stokta yalnızca ${availableStock} adet bulunmaktadır`, "error");
      return;
    }

    setCartLoading(true);
    try {
      const res = await fetch(
        `${API}/api/cart/add?productId=${product.productId}&quantity=${quantity}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2500);
        showToast(`${product.productName} sepete eklendi`);

        window.dispatchEvent(new CustomEvent("cartUpdated"));
      } else {
        const text = await res.text();
        showToast(text || "Bir hata oluştu", "error");
      }
    } catch {
      showToast("Bağlantı hatası", "error");
    } finally {
      setCartLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (!token) { navigate("/login"); return; }
    setIsFavorited(prev => !prev);
    try {
      await fetch(`${API}/api/favorites/${product.productId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      setIsFavorited(prev => !prev);
    }
  };

  const prevImage = () => {
    if (!product?.images) return;
    setSelectedImageIndex(prev => (prev - 1 + product.images.length) % product.images.length);
  };

  const nextImage = () => {
    if (!product?.images) return;
    setSelectedImageIndex(prev => (prev + 1) % product.images.length);
  };

  const allImages = product?.images?.length > 0
    ? product.images
    : product?.mainImageUrl
    ? [product.mainImageUrl]
    : [];

  const displayPrice = product?.discountPrice && product.discountPrice < product.price
    ? product.discountPrice
    : product?.price;

  const hasDiscount = product?.discountPrice && product.discountPrice < product.price;
  const discountPercent = hasDiscount ? calculateDiscount(product.price, product.discountPrice) : 0;

  const avgRating = reviews.length
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const isOutOfStock = !stockLoading && (!stockData || stockData.isOutOfStock);

  const stockStatus = stockLoading
    ? null
    : isOutOfStock
    ? { label: "Stokta Yok", color: "text-red-500", bg: "bg-red-50", icon: X }
    : stockData?.isLowStock
    ? { label: `Son ${stockData.quantity} ürün`, color: "text-amber-600", bg: "bg-amber-50", icon: AlertCircle }
    : null;

  const hasCommented = token && reviews.some(r => r.userId === currentUserId);

  const sortedAndFilteredReviews = (() => {
    const sorted = [...reviews].sort((a, b) => {
      const aIsOwn = token && a.userId === currentUserId ? 1 : 0;
      const bIsOwn = token && b.userId === currentUserId ? 1 : 0;
      return bIsOwn - aIsOwn;
    });
    if (ratingFilter === 0) return sorted;
    return sorted.filter(r => r.rating === ratingFilter);
  })();

  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
  }));

  const maxQuantity = stockData?.quantity ?? 99;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f7f6f3" }}>

      <Header />

      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
        </div>
      ) : !product ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
          <h2 className="text-2xl font-light mb-4">Ürün Bulunamadı</h2>
          <button onClick={() => navigate("/")} className="px-6 py-3 bg-gray-900 text-white text-sm tracking-wide hover:bg-gray-800 transition">
            Anasayfaya Dön
          </button>
        </div>
      ) : (
        <main className="max-w-[1400px] mx-auto px-6 py-8">

          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <button onClick={() => navigate("/")} className="hover:text-gray-900 transition">Anasayfa</button>
            <ChevronRight size={14} />
            {product.categoryName && (
              <>
                <button onClick={() => navigate(`/kategori/${product.categorySlug || ""}`)} className="hover:text-gray-900 transition">
                  {product.categoryName}
                </button>
                <ChevronRight size={14} />
              </>
            )}
            <span className="text-gray-900 font-medium line-clamp-1">{product.productName}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">

            <div className="flex flex-col gap-4">
              <div
                className="relative bg-white border border-gray-200 rounded-2xl overflow-hidden aspect-square cursor-zoom-in"
                onClick={() => setLightboxOpen(true)}
              >
                {allImages.length > 0 ? (
                  <img
                    src={`${API}${allImages[selectedImageIndex]}`}
                    alt={product.productName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-8xl">💡</div>
                )}

                {hasDiscount && (
                  <div className="absolute top-4 left-4 z-10 px-3 py-1.5 bg-black text-white text-xs font-medium tracking-wide">
                    -{discountPercent}%
                  </div>
                )}
                {product.isNew && (
                  <div className="absolute top-4 left-4 z-10 px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium tracking-wide" style={{ top: hasDiscount ? "3rem" : "1rem" }}>
                    YENİ
                  </div>
                )}

                <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm p-1.5 rounded-full pointer-events-none">
                  <ZoomIn size={16} className="text-gray-600" />
                </div>

                {allImages.length > 1 && (
                  <>
                    <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center transition">
                      <ChevronLeft size={18} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center transition">
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}
              </div>

              {allImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                        idx === selectedImageIndex
                          ? "border-gray-900 shadow-md"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <img
                        src={`${API}${img}`}
                        alt={`${product.productName} ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <div className="mb-2">
                <span className="text-sm text-gray-500 tracking-widest uppercase">{product.categoryName}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-light tracking-wide text-gray-900 mb-4 leading-snug">
                {product.productName}
              </h1>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={15} className={avgRating && i < Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"} />
                  ))}
                </div>
                {avgRating && <span className="text-sm font-medium text-gray-700">{avgRating}</span>}
                <span className="text-sm text-gray-500">({reviews.length} yorum)</span>
                <button
                  onClick={() => document.getElementById("reviews-section")?.scrollIntoView({ behavior: "smooth" })}
                  className="text-sm text-gray-500 underline underline-offset-2 hover:text-gray-900 transition"
                >
                  Yorumları gör
                </button>
              </div>

              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-4xl font-light text-gray-900">
                  ₺{displayPrice?.toLocaleString("tr-TR")}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-xl text-gray-400 line-through">
                      ₺{product.price?.toLocaleString("tr-TR")}
                    </span>
                    <span className="px-3 py-1 bg-black text-white text-sm font-medium tracking-wide rounded-sm">
                      %{discountPercent} İNDİRİM
                    </span>
                  </>
                )}
              </div>

              {stockStatus && (
                <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium mb-6 w-fit ${stockStatus.bg} ${stockStatus.color}`}>
                  <stockStatus.icon size={15} />
                  {stockStatus.label}
                </div>
              )}

              {product.description && (
                <p className="text-gray-600 text-sm leading-relaxed mb-8 border-t border-gray-100 pt-6">
                  {product.description}
                </p>
              )}

              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm text-gray-700 font-medium w-16">Adet</span>
                <div className={`flex items-center border rounded-xl overflow-hidden bg-white ${isOutOfStock ? "border-gray-100 opacity-40 pointer-events-none" : "border-gray-200"}`}>
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-11 h-11 flex items-center justify-center hover:bg-gray-50 transition text-gray-700"
                    disabled={isOutOfStock}
                  >
                    <Minus size={15} />
                  </button>
                  <span className="w-12 text-center text-sm font-medium text-gray-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(maxQuantity, q + 1))}
                    className="w-11 h-11 flex items-center justify-center hover:bg-gray-50 transition text-gray-700"
                    disabled={isOutOfStock || quantity >= maxQuantity}
                  >
                    <Plus size={15} />
                  </button>
                </div>
                {!isOutOfStock && stockData?.quantity && quantity >= maxQuantity && (
                  <span className="text-xs text-amber-600">Maksimum stok adedi</span>
                )}
              </div>

              <div className="flex gap-3 mb-8">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || stockLoading || cartLoading}
                  className={`flex-1 py-4 text-sm tracking-wide font-medium transition flex items-center justify-center gap-2 rounded-xl ${
                    isOutOfStock
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : addedToCart
                      ? "bg-green-600 text-white"
                      : cartLoading
                      ? "bg-gray-700 text-white cursor-wait"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  }`}
                >
                  {isOutOfStock ? (
                    <><X size={18} /> Stok Yok</>
                  ) : cartLoading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Ekleniyor...</>
                  ) : addedToCart ? (
                    <><Check size={18} /> Sepete Eklendi</>
                  ) : (
                    <><ShoppingCart size={18} /> Sepete Ekle</>
                  )}
                </button>
                <button
                  onClick={handleFavorite}
                  className={`w-14 h-14 border rounded-xl flex items-center justify-center transition ${
                    isFavorited
                      ? "bg-red-50 border-red-200 text-red-500"
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-400"
                  }`}
                >
                  <Heart size={20} className={isFavorited ? "fill-red-500" : ""} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-gray-100">
                <div className="flex flex-col items-center text-center gap-2 p-3 bg-white border border-gray-100 rounded-xl">
                  <Truck size={20} className="text-gray-700" />
                  <span className="text-xs text-gray-600 leading-tight">Ücretsiz<br/>Kargo</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2 p-3 bg-white border border-gray-100 rounded-xl">
                  <RotateCcw size={20} className="text-gray-700" />
                  <span className="text-xs text-gray-600 leading-tight">14 Gün<br/>İade</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2 p-3 bg-white border border-gray-100 rounded-xl">
                  <Shield size={20} className="text-gray-700" />
                  <span className="text-xs text-gray-600 leading-tight">Güvenli<br/>Ödeme</span>
                </div>
              </div>
            </div>
          </div>

          {similarProducts.length > 0 && (
            <div className="py-16 border-t border-gray-200">
              <h2 className="text-3xl md:text-4xl font-light tracking-wide mb-10 text-center">Benzer Ürünler</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {similarProducts.map(p => {
                  const pHasDiscount = p.discountPrice && p.discountPrice < p.price;
                  const pDisplayPrice = pHasDiscount ? p.discountPrice : p.price;
                  const pDiscountPct = pHasDiscount ? calculateDiscount(p.price, p.discountPrice) : 0;
                  return (
                    <div
                      key={p.productId}
                      onClick={() => { navigate(`/urun/${p.slug}`); window.scrollTo(0, 0); }}
                      className="group cursor-pointer bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
                    >
                      <div className="relative aspect-square bg-gray-50 overflow-hidden">
                        {p.mainImageUrl ? (
                          <img src={`${API}${p.mainImageUrl}`} alt={p.productName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-5xl">💡</div>
                        )}
                        {pHasDiscount && (
                          <div className="absolute top-3 left-3 px-2 py-1 bg-black text-white text-[10px] font-medium tracking-wide">
                            -{pDiscountPct}%
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{p.categoryName}</div>
                        <h3 className="text-base font-medium text-gray-800 mb-2 line-clamp-2 group-hover:text-gray-600 transition">{p.productName}</h3>
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-light">₺{pDisplayPrice?.toLocaleString("tr-TR")}</span>
                          {pHasDiscount && (
                            <span className="text-sm text-gray-400 line-through">₺{p.price?.toLocaleString("tr-TR")}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div id="reviews-section" className="py-16 border-t border-gray-200">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-light tracking-wide mb-2 text-center">Müşteri Yorumları</h2>

              <div className="flex flex-col items-center gap-2 mb-8">
                <div className="flex items-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={22} className={avgRating && i < Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"} />
                  ))}
                </div>
                {avgRating ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-light text-gray-900">{avgRating}</span>
                    <span className="text-xl text-gray-400">/ 5</span>
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm mt-1">Henüz değerlendirme yok</span>
                )}
                <span className="text-sm text-gray-500">{reviews.length} değerlendirme</span>
              </div>

              {reviews.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mr-1">
                    <SlidersHorizontal size={13} />
                    <span>Filtrele:</span>
                  </div>
                  <button
                    onClick={() => setRatingFilter(0)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      ratingFilter === 0
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    Tümü
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${ratingFilter === 0 ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                      {reviews.length}
                    </span>
                  </button>
                  {ratingCounts.map(({ star, count }) => count > 0 && (
                    <button
                      key={star}
                      onClick={() => setRatingFilter(ratingFilter === star ? 0 : star)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        ratingFilter === star
                          ? "bg-amber-400 text-white border-amber-400"
                          : "bg-white text-gray-600 border-gray-200 hover:border-amber-300"
                      }`}
                    >
                      <Star size={11} className={ratingFilter === star ? "fill-white text-white" : "fill-amber-400 text-amber-400"} />
                      {star}
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${ratingFilter === star ? "bg-white/25 text-white" : "bg-gray-100 text-gray-500"}`}>
                        {count}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {sortedAndFilteredReviews.length > 0 ? (
                <div className="space-y-4 mb-12">
                  {sortedAndFilteredReviews.map((review) => {
                    const isOwn = token && review.userId === currentUserId;
                    return (
                      <div
                        key={review.commentId}
                        className={`bg-white border rounded-xl p-6 transition-all ${
                          isOwn ? "border-gray-900 shadow-sm ring-1 ring-gray-900/10" : "border-gray-200"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900">
                                {review.userName
                                  ? review.userName.slice(0, 2) + "*".repeat(Math.max(review.userName.length - 2, 3))
                                  : "Anonim"}
                              </span>
                              {isOwn && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-900 text-white text-[10px] font-medium rounded-full tracking-wide">
                                  <Check size={9} />
                                  Yorumunuz
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={13} className={i < review.rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"} />
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {review.createdAt && (
                              <span className="text-xs text-gray-400">
                                {new Date(review.createdAt).toLocaleDateString("tr-TR")}
                              </span>
                            )}
                            {isOwn && (
                              <button
                                onClick={() => setDeleteConfirm(review.commentId)}
                                className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                title="Yorumu sil"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{review.content}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500 text-sm mb-12">
                  {ratingFilter > 0
                    ? `${ratingFilter} yıldızlı yorum bulunamadı.`
                    : "Henüz yorum yok. İlk yorumu siz yazın!"}
                </div>
              )}

              {token ? (
                hasCommented ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
                    <Check size={28} className="text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium text-sm">Bu ürün için zaten yorum yaptınız</p>
                    <p className="text-xs text-gray-400 mt-1">Yorumunuzu yukarıdan silebilirsiniz</p>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-2xl p-8">
                    <h3 className="text-xl font-light tracking-wide mb-6">Yorum Yap</h3>
                    <div className="mb-5">
                      <label className="block text-sm text-gray-700 font-medium mb-2">Puanınız</label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            onClick={() => { setReviewForm(f => ({ ...f, rating: star })); setRatingWarning(false); }}
                            className="transition-transform hover:scale-110"
                          >
                            <Star size={28} className={star <= reviewForm.rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"} />
                          </button>
                        ))}
                        {reviewForm.rating === 0 && (
                          <span className="text-xs text-gray-400 ml-1">Seçilmedi</span>
                        )}
                      </div>
                      {ratingWarning && (
                        <div className="flex items-center gap-1.5 mt-2 text-amber-600">
                          <AlertCircle size={13} />
                          <span className="text-xs font-medium">Lütfen kaç yıldız olduğunu seçiniz</span>
                        </div>
                      )}
                    </div>
                    <div className="mb-6">
                      <label className="block text-sm text-gray-900 font-medium mb-2">Yorumunuz</label>
                      <textarea
                        value={reviewForm.content}
                        onChange={e => setReviewForm(f => ({ ...f, content: e.target.value }))}
                        placeholder="Ürün hakkında düşüncelerinizi paylaşın..."
                        rows={4}
                        className="w-full px-4 py-3 text-white border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition text-sm resize-none"
                      />
                    </div>
                    <button
                      onClick={() => {
                        if (reviewForm.rating === 0) {
                          setRatingWarning(true);
                          return;
                        }
                        if (reviewForm.content.trim()) setSubmitConfirm(true);
                      }}
                      disabled={reviewSubmitting || !reviewForm.content.trim()}
                      className="px-8 py-3 bg-gray-900 text-white text-sm tracking-wide hover:bg-gray-800 transition rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {reviewSubmitting ? "Gönderiliyor..." : "Yorumu Gönder"}
                    </button>
                  </div>
                )
              ) : (
                <div
                  className="bg-white border border-gray-200 rounded-2xl p-8 text-center cursor-pointer hover:border-gray-400 transition"
                  onClick={() => setLoginPopup(true)}
                >
                  <User size={32} className="text-gray-900 mx-auto mb-3" />
                  <p className="text-gray-700 font-medium mb-1">Yorum yapmak için giriş yapın</p>
                  <p className="text-sm text-gray-500">Deneyiminizi diğer müşterilerle paylaşın</p>
                </div>
              )}
            </div>
          </div>

        </main>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] px-4">
          <div className={`rounded-2xl shadow-2xl px-6 py-3 flex items-center gap-3 ${toast.type === "error" ? "bg-red-600" : "bg-gray-900"} text-white`}>
            {toast.type === "error" ? <X size={16} className="text-red-200" /> : <Check size={16} className="text-green-400" />}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-[250] flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full">
            <div className="flex items-center justify-center w-12 h-12 bg-red-50 rounded-full mx-auto mb-4">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 text-center mb-2">Yorumu Sil</h3>
            <p className="text-sm text-gray-500 text-center mb-6">Bu yorumu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 border border-gray-200 text-gray-700 text-sm rounded-xl hover:bg-gray-50 transition">İptal</button>
              <button onClick={() => { deleteReview(deleteConfirm); setDeleteConfirm(null); }} className="flex-1 py-3 bg-red-500 text-white text-sm rounded-xl hover:bg-red-600 transition">Evet, Sil</button>
            </div>
          </div>
        </div>
      )}

      {submitConfirm && (
        <div className="fixed inset-0 bg-black/40 z-[250] flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-50 rounded-full mx-auto mb-4">
              <Star size={22} className="text-amber-400 fill-amber-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 text-center mb-2">Yorum Gönder</h3>
            <p className="text-sm text-gray-500 text-center mb-6">Yorumunuzu göndermek istediğinize emin misiniz?</p>
            <div className="flex gap-3">
              <button onClick={() => setSubmitConfirm(false)} className="flex-1 py-3 border border-gray-200 text-gray-700 text-sm rounded-xl hover:bg-gray-50 transition">İptal</button>
              <button onClick={submitReview} className="flex-1 py-3 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-800 transition">Evet, Gönder</button>
            </div>
          </div>
        </div>
      )}

      {loginPopup && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] w-full max-w-sm px-4">
          <div className="bg-gray-900 text-white rounded-2xl shadow-2xl px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <User size={18} className="text-gray-300 flex-shrink-0" />
              <span className="text-sm">Yorum yapabilmek için giriş yapmanız gerekmektedir</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => { setLoginPopup(false); navigate("/login"); }} className="text-xs bg-white text-gray-900 px-3 py-1.5 rounded-lg font-medium hover:bg-gray-100 transition">Giriş Yap</button>
              <button onClick={() => setLoginPopup(false)} className="text-gray-400 hover:text-white transition"><X size={16} /></button>
            </div>
          </div>
        </div>
      )}

      {lightboxOpen && allImages.length > 0 && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
          style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", backgroundColor: "rgba(0,0,0,0.85)" }}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition"
          >
            <X size={18} className="text-gray-800" />
          </button>

          <div
            className="relative flex items-center justify-center mx-4"
            style={{ width: "min(700px, 92vw)", height: "min(700px, 78vh)" }}
            onClick={e => e.stopPropagation()}
          >
            <img
              src={`${API}${allImages[selectedImageIndex]}`}
              alt={product?.productName}
              className="w-full h-full object-contain rounded-xl"
              style={{ padding: "6px" }}
            />

            {allImages.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImageIndex(prev => (prev - 1 + allImages.length) % allImages.length)}
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition"
                  style={{ transform: "translateY(-50%) translateX(-50%)" }}
                >
                  <ChevronLeft size={18} className="text-gray-800" />
                </button>
                <button
                  onClick={() => setSelectedImageIndex(prev => (prev + 1) % allImages.length)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition"
                  style={{ transform: "translateY(-50%) translateX(50%)" }}
                >
                  <ChevronRight size={18} className="text-gray-800" />
                </button>

                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                  {allImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`rounded-full transition-all ${idx === selectedImageIndex ? "w-5 h-2 bg-white" : "w-2 h-2 bg-white/40 hover:bg-white/70"}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showAuthPopup && (
        <div
          className="fixed inset-0 bg-black/50 z-[250] flex items-center justify-center"
          onClick={() => setShowAuthPopup(false)}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAuthPopup(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
            >
              <X size={16} className="text-gray-400" />
            </button>
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <ShoppingCart size={26} className="text-gray-500" />
            </div>
            <h3 className="text-base font-medium text-gray-900 mb-2">Sepete ekleyebilmek için</h3>
            <p className="text-sm text-gray-400 mb-6">giriş yapmanız gerekmektedir</p>
            <button
              onClick={() => navigate("/login")}
              className="w-full py-3 bg-gray-900 text-white text-sm tracking-wide rounded-xl hover:bg-gray-800 transition"
            >
              Giriş Yap
            </button>
            <button
              onClick={() => setShowAuthPopup(false)}
              className="mt-3 text-xs text-gray-400 hover:text-gray-600 transition block w-full"
            >
              Vazgeç
            </button>
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