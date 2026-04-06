import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { 
  ShoppingCart, 
  Heart,
  ChevronRight,
  Star,
  Truck,
  Shield,
  ChevronLeft,
} from "lucide-react";

import Header from "../components/Header";
import Footer from "../components/Footer";

import hero1 from "../assets/slider1.jpg";
import hero2 from "../assets/slider2.jpg";
import hero3 from "../assets/slider3.jpg";
import beforeAfter1 from "../assets/beforeafterslider1.jpg";
import beforeAfter2 from "../assets/beforeafterslider2.jpg";

const API_URL = import.meta.env.VITE_API_URL;


function ProductImageCarousel({ product, hasDiscount, discountPercent, isFavorited, onFavoriteToggle }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [productImages, setProductImages] = useState([]);
  const [loading, setLoading] = useState(false);

  

  useEffect(() => {
    if (isHovering && productImages.length === 0) {
      fetchProductImages();
    }
  }, [isHovering]);

  const fetchProductImages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/products/${product.productId}`);
      const data = await response.json();
      if (data.images && data.images.length > 0) {
        setProductImages(data.images);
      }
      setLoading(false);
    } catch (error) {
      console.error("Resimler yüklenemedi:", error);
      setLoading(false);
    }
  };

  const hasMultipleImages = productImages.length > 1;

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  return (
    <div 
      className="relative aspect-square overflow-hidden bg-gray-50 rounded-t-lg"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {productImages.length > 0 ? (
        <img src={`${API_URL}${productImages[currentImageIndex]}`} alt={product.productName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
      ) : product.mainImageUrl ? (
        <img src={`${API_URL}${product.mainImageUrl}`} alt={product.productName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-6xl">💡</div>
      )}
      
      {hasDiscount && (
        <div className="absolute top-4 left-4 z-10">
          <div className="px-3 py-1.5 bg-black text-white text-xs font-medium tracking-wide">-{discountPercent}%</div>
        </div>
      )}

      <button
        onClick={(e) => onFavoriteToggle(e, product.productId)}
        className={`absolute top-4 right-4 z-10 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-white ${isFavorited ? "opacity-100" : ""}`}
      >
        <Heart size={16} className={isFavorited ? "fill-red-500 text-red-500" : "text-gray-700"} />
      </button>

      {hasMultipleImages && isHovering && (
        <>
          <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full shadow-sm flex items-center justify-center transition">
            <ChevronLeft size={16} />
          </button>
          <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full shadow-sm flex items-center justify-center transition">
            <ChevronRight size={16} />
          </button>
        </>
      )}

      {hasMultipleImages && isHovering && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
          {productImages.map((_, index) => (
            <button
              key={index}
              onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
              className={`h-1 rounded-full transition-all ${index === currentImageIndex ? 'bg-white w-6' : 'bg-white/50 w-1 hover:bg-white/70'}`}
            />
          ))}
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-20">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}

function StarRating({ rating, reviewCount }) {
  if (!rating && rating !== 0) return null;
  const rounded = Math.round(rating);
  return (
    <div className="flex items-center gap-1 mb-3">
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={11}
            className={i < rounded ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}
          />
        ))}
      </div>
      <span className="text-xs text-gray-500 ml-1">
        ({reviewCount ?? rating})
      </span>
    </div>
  );
}

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
    <div className="flex items-center gap-1 mb-3">
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


function BeforeAfterSlider() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [direction, setDirection] = useState(1);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setSliderPosition((prev) => {
        if (prev >= 70) { setDirection(-1); return prev - 1; }
        if (prev <= 30) { setDirection(1); return prev + 1; }
        return prev + direction;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [autoPlay, direction]);

  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  const handleMouseDown = () => { setIsDragging(true); setAutoPlay(false); };
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e) => { if (!isDragging) return; handleMove(e.clientX); };
  const handleTouchStart = () => { setIsDragging(true); setAutoPlay(false); };
  const handleTouchMove = (e) => { if (e.touches.length > 0) handleMove(e.touches[0].clientX); };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <div className="py-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-light tracking-wide mb-4">Satın Almadan Önce Deneyin</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">Ürünlerimizi evinizde deneme fırsatını kaçırmayın. Beğenmezseniz ücretsiz iade hakkınız var.</p>
      </div>

      <div
        ref={containerRef}
        className="relative h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] rounded-sm overflow-hidden select-none cursor-ew-resize"
        onMouseDown={handleMouseDown}
        onTouchMove={handleTouchMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={() => setIsDragging(false)}
      >
        <div className="absolute inset-0">
          <img
            src={beforeAfter1}
            alt="Adım 1"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent">
            <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12 text-white">
              <div className="text-xs md:text-sm tracking-[0.2em] mb-1 md:mb-2 opacity-90">ADIM 1</div>
              <h3 className="text-xl md:text-3xl lg:text-4xl font-light mb-1 md:mb-3">Siparişinizi Alın</h3>
              <p className="text-xs md:text-sm opacity-90 max-w-xs md:max-w-md hidden sm:block">Ürünleriniz özenle paketlenip kapınıza kadar ücretsiz gelir</p>
            </div>
          </div>
        </div>

        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}>
          <img
            src={beforeAfter2}
            alt="Adım 2"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent">
            <div className="absolute bottom-6 right-6 md:bottom-12 md:right-12 text-white text-right">
              <div className="text-xs md:text-sm tracking-[0.2em] mb-1 md:mb-2 opacity-90">ADIM 2</div>
              <h3 className="text-xl md:text-3xl lg:text-4xl font-light mb-1 md:mb-3">Evinizde Deneyin</h3>
              <p className="text-xs md:text-sm opacity-90 max-w-xs md:max-w-md hidden sm:block">14 gün içinde beğenmezseniz ücretsiz iade edebilirsiniz</p>
            </div>
          </div>
        </div>

        <div className="absolute top-0 bottom-0 w-0.5 md:w-1 bg-white cursor-ew-resize z-10" style={{ left: `${sliderPosition}%` }}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 md:w-12 md:h-12 bg-white rounded-full shadow-xl flex items-center justify-center">
            <div className="flex gap-0.5 md:gap-1">
              <ChevronLeft size={12} className="text-gray-900 md:hidden" />
              <ChevronRight size={12} className="text-gray-900 md:hidden" />
              <ChevronLeft size={16} className="text-gray-900 hidden md:block" />
              <ChevronRight size={16} className="text-gray-900 hidden md:block" />
            </div>
          </div>
        </div>

        <div className="absolute top-4 md:top-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs tracking-wide text-gray-900 shadow-lg pointer-events-none whitespace-nowrap">
          ← Kaydırın →
        </div>
      </div>

      <div className="mt-12 text-center">
        <button className="px-8 py-4 bg-gray-900 text-white text-sm tracking-wide hover:bg-gray-800 transition inline-flex items-center gap-2">
          Detaylı Bilgi <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [categories, setCategories] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  const heroSlides = [
    { id: 1, image: hero1, cta: "Hemen Alışverişe Başla" },
    { id: 2, image: hero2, cta: "Koleksiyonu Keşfet" },
    { id: 3, image: hero3, cta: "Detayları Görüntüle" },
  ];

  useEffect(() => {
    fetchData();
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(slideInterval);
  }, []);

  useEffect(() => {
    if (token) fetchFavorites();
  }, []);

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

  const fetchData = async () => {
    try {
      const categoriesRes = await fetch(`${API_URL}/api/categories`);
      const categoriesData = await categoriesRes.json();
      setCategories(categoriesData.filter(c => c.isActive));

      const popularRes = await fetch(`${API_URL}/api/products/popular`);
      setPopularProducts(await popularRes.json());

      const newRes = await fetch(`${API_URL}/api/products/new`);
      setNewProducts(await newRes.json());
    } catch (error) {
      console.error("Veri yükleme hatası:", error);
    }
  };

  const calculateDiscount = (price, discountPrice) => {
    if (!discountPrice) return 0;
    return Math.round(((price - discountPrice) / price) * 100);
  };

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f7f6f3' }}>

      <Header />

      <div className="relative overflow-hidden group" style={{ height: 'clamp(260px, 56vw, 700px)' }}>
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: index === currentSlide ? 1 : 0 }}
          >
            <img
              src={slide.image}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover object-center"
              style={{ objectPosition: 'center center' }}
            />
            <button
              onClick={() => navigate("/urunler")}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:bottom-16 md:right-16 px-5 py-3 md:px-8 md:py-4 bg-white text-gray-900 text-xs md:text-sm tracking-wide hover:bg-gray-100 transition inline-flex items-center gap-2 shadow-lg whitespace-nowrap"
            >
              {slide.cta} <ChevronRight size={14} />
            </button>
          </div>
        ))}

        <button
          onClick={prevSlide}
          className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-10 w-9 h-9 md:w-12 md:h-12 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full shadow-lg flex items-center justify-center transition opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft size={16} className="text-gray-900" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-10 w-9 h-9 md:w-12 md:h-12 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full shadow-lg flex items-center justify-center transition opacity-0 group-hover:opacity-100"
        >
          <ChevronRight size={16} className="text-gray-900" />
        </button>

        <div className="absolute bottom-3 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 md:gap-3 z-10">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-0.5 rounded-full transition-all ${index === currentSlide ? 'bg-white w-6 md:w-8' : 'bg-white/40 w-2 hover:bg-white/60'}`}
            />
          ))}
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto px-4 md:px-6">

        <div className="py-20 border-t border-gray-100">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-light tracking-wide mb-4">Popüler Koleksiyon</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Zamansız tasarımları ve olağanüstü kalitesiyle özenle seçilmiş en sevilen aydınlatma parçalarımızı keşfedin.</p>
          </div>

          {popularProducts.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="text-gray-400" size={28} />
              </div>
              <p className="text-gray-500">Henüz popüler ürün bulunmuyor</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {popularProducts.map((product) => {
                const hasDiscount = product.discountPrice && product.discountPrice < product.price;
                const displayPrice = hasDiscount ? product.discountPrice : product.price;
                const discountPercent = hasDiscount ? calculateDiscount(product.price, product.discountPrice) : 0;
                return (
                  <div key={product.productId} onClick={() => navigate(`/urun/${product.slug}`)} className="group cursor-pointer bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                    <ProductImageCarousel product={product} hasDiscount={hasDiscount} discountPercent={discountPercent} isFavorited={favoriteIds.has(product.productId)} onFavoriteToggle={handleFavorite} />
                    <div className="p-4">
                      <div className="text-xs text-gray-500 mb-1.5 tracking-wide uppercase">{product.categoryName}</div>
                      <h3 className="text-lg font-medium mb-3 line-clamp-2 min-h-[3rem] group-hover:text-gray-600 transition text-gray-800">{product.productName}</h3>
                      <ProductStarRating productId={product.productId} />
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-light">₺{displayPrice.toLocaleString("tr-TR")}</span>
                        {hasDiscount && <span className="text-sm text-gray-400 line-through">₺{product.price.toLocaleString("tr-TR")}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="py-20 border-t border-gray-100">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-light tracking-wide mb-4">Kategorilere Göre Alışveriş</h2>
            <p className="text-gray-600">Özenle seçilmiş koleksiyonlarımızı keşfedin</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.slice(0, 8).map((category) => (
              <button key={category.categoryId} onClick={() => navigate(`/kategori/${category.slug}`)} className="group">
                <div className="aspect-square bg-gray-50 rounded-sm mb-4 overflow-hidden flex items-center justify-center text-6xl group-hover:bg-gray-100 transition">
                  <img src={`${API_URL}${category.imageUrl}`} alt={category.categoryName} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-sm tracking-wide group-hover:text-gray-600 transition">{category.categoryName}</h3>
              </button>
            ))}
          </div>
        </div>

        {newProducts.length > 0 && (
          <div className="py-20">
            <div className="text-center mb-12">
              <div className="inline-block px-4 py-1.5 bg-gray-100 text-gray-900 text-sm tracking-widest mb-4 rounded-full">YENİ</div>
              <h2 className="text-4xl md:text-5xl font-light tracking-wide mb-4">Yeni Gelenler</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">En yeni ürünlerimizi keşfedin ve mekanınıza modern bir dokunuş katın.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {newProducts.slice(0, 8).map((product) => {
                const hasDiscount = product.discountPrice && product.discountPrice < product.price;
                const displayPrice = hasDiscount ? product.discountPrice : product.price;
                const discountPercent = hasDiscount ? calculateDiscount(product.price, product.discountPrice) : 0;
                return (
                  <div key={product.productId} onClick={() => navigate(`/urun/${product.slug}`)} className="group cursor-pointer bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                    <ProductImageCarousel product={product} hasDiscount={hasDiscount} discountPercent={discountPercent} isFavorited={favoriteIds.has(product.productId)} onFavoriteToggle={handleFavorite} />
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs text-gray-500 tracking-wide uppercase">{product.categoryName}</span>
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] tracking-wide font-medium rounded-full">YENİ</span>
                      </div>
                      <h3 className="text-lg font-medium mb-3 line-clamp-2 min-h-[3rem] group-hover:text-gray-600 transition text-gray-800">{product.productName}</h3>
                      <ProductStarRating productId={product.productId} />
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-light">₺{displayPrice.toLocaleString("tr-TR")}</span>
                        {hasDiscount && <span className="text-sm text-gray-400 line-through">₺{product.price.toLocaleString("tr-TR")}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-center mt-12">
              <button onClick={() => navigate("/urunler")} className="px-8 py-4 border border-gray-900 text-gray-900 text-sm tracking-wide hover:bg-gray-900 hover:text-white transition inline-flex items-center gap-2">
                Tüm Yenileri Gör <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-16 border-b border-gray-100">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <Truck className="text-gray-900" size={24} />
            </div>
            <h3 className="text-sm tracking-wide font-medium mb-2">ÜCRETSİZ KARGO</h3>
            <p className="text-sm text-gray-600">500₺ üzeri siparişlerde</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <Shield className="text-gray-900" size={24} />
            </div>
            <h3 className="text-sm tracking-wide font-medium mb-2">GÜVENLİ ÖDEME</h3>
            <p className="text-sm text-gray-600">%100 güvenli işlem</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <Star className="text-gray-900" size={24} />
            </div>
            <h3 className="text-sm tracking-wide font-medium mb-2">PREMIUM KALİTE</h3>
            <p className="text-sm text-gray-600">Özenle seçilmiş tasarımlar</p>
          </div>
        </div>

        <BeforeAfterSlider />

      </main>

      <Footer />

      <style jsx>{`
        * { font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        h1, h2, h3 { font-family: 'Cormorant Garamond', serif; }
      `}</style>
    </div>
  );
}