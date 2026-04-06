import { useNavigate } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 mt-20">
      <div className="max-w-[1400px] mx-auto px-6 py-16">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h4 className="text-sm tracking-wide font-medium mb-4">HAKKIMIZDA</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-gray-900 transition">Hikayemiz</a></li>
              <li><a href="#" className="hover:text-gray-900 transition">Kariyer</a></li>
              <li><a href="#" className="hover:text-gray-900 transition">Basın</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm tracking-wide font-medium mb-4">YARDIM</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-gray-900 transition">Sıkça Sorulanlar</a></li>
              <li><a href="#" className="hover:text-gray-900 transition">Kargo</a></li>
              <li><a href="#" className="hover:text-gray-900 transition">İadeler</a></li>
              <li><a href="#" className="hover:text-gray-900 transition">Sipariş Takibi</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm tracking-wide font-medium mb-4">ALIŞVERİŞ</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-gray-900 transition">Yeni Gelenler</a></li>
              <li><a href="#" className="hover:text-gray-900 transition">Çok Satanlar</a></li>
              <li><a href="#" className="hover:text-gray-900 transition">İndirimler</a></li>
              <li><a href="#" className="hover:text-gray-900 transition">Hediye Kartları</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm tracking-wide font-medium mb-4">TAKİP EDİN</h4>
            <div className="flex gap-4">
              <a href="#" className="text-gray-600 hover:text-gray-900 transition">Instagram</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition">Pinterest</a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-600">
          <p>© 2024 LUMINA. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-gray-900 transition">Gizlilik Politikası</a>
            <a href="#" className="hover:text-gray-900 transition">Kullanım Koşulları</a>
          </div>
        </div>
      </div>
    </footer>
  );
}