# LUMINA  E-TİCARET

Fullstack e-ticaret uygulaması. Ürün listeleme, stok kontrolü, favoriler, yorumlar, kullanıcı yönetimi ve sipariş yönetimi özelliklerine sahip modern bir online mağaza uygulamasıdır.

---

## Özellikler

- Kullanıcı kayıt, giriş
- Kullanıcı Profil Yönetimi
    Adres Ekleme, Silme Güncelleme
    Kullanıcı Adı Değiştirme, Silme
    Şifre Güncelleme
- E-posta doğrulama ve şifre sıfırlama
- Ürünleri kategori, popülerlik, indirim ve yeni ürün olarak kategorilendirme-filtreleme 
- Ürünleri listeleme, filtreleme ve detay görüntüleme
- Ürünlere yorum yazabilme
- Favorilere ekleme / çıkarma
- Sepet ve sipariş yönetimi
- Admin panel üzerinden ürün, kategori, stok ve yorum yönetimi
- EF Core migrations ile versioned database
- Full responsive tasarım(mobil, tablet, desktop)

---

## Kullanılan Teknolojiler 

| Katman          | Teknoloji                     |
|-----------------|-------------------------------|
| Backend         | .NET 8, C#, EF Core, SQL Server |
| Frontend        | React, Vite, Tailwind CSS      |
| Kimlik Doğrulama | JWT + BCrypt                  |
| E-posta Servisi | SMTP (Gmail)                   |

---

## Proje Yapısı
```text
LightingStore/
├─ LightingStore.Api/ # Backend (.NET 8)
├─ LightingStore.Frontend/ # Frontend (React + Vite)
└─ README.md

```

Kurulum

### Backend
```bash


cd LightingStore.Api
dotnet restore
dotnet ef database update
dotnet run
```
appsettingsexamp.json dosyasını kopyalayıp appsettings.json oluşturun. placeholder alanları doldurun.


### Frontend
```bash

cd LightingStore.Frontend
npm install
npm run dev

```
Aşağıda verilen .env.example dosyasını kopyalayıp .env oluşturun. API URL alanına kendi URL adresinizi giriniz.
```bash
.env -> API URL: VITE_API_URL=http://localhost:5xxx 
```

Notlar

Migrations, backend içinde versioned olarak tutulmaktadır.
API ve Frontend, .env üzerinden kolayca konfigüre edilebilir.
E-posta bilgileri ve JWT anahtarları placeholder olarak gelmiştir; production ortamında değiştirilmesi gerekmektedir.

##  Proje Görselleri

İndirmeden önce projenin nasıl göründüğünü görmek için `screenshots` klasörüne göz atabilirsiniz:


```text
LightingStore/
├── screenshots/
│   ├── Login.png      
```



## Gelecekte Planlanan Özellikler
Destek Sistemi – Kullanıcılar için canlı destek ve ticket sistemi

Chatbot Entegrasyonu – Yapay zekâ destekli hızlı yardım ve öneriler

Kargo Takip Entegrasyonu – Üçüncü taraf kargo servisleri ile otomatik takip

Daha Fazla Ödeme Yöntemi – Online ödeme ve dijital cüzdan entegrasyonu




UYARI: Bu proje hâlen geliştirilme aşamasındadır.

