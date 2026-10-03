# 🏪 BIGBOZ STORE — Toko Produk Digital Indonesia

Website e-commerce mobile-first untuk penjualan produk digital (Top Up Game, Akun Premium AI, Token Listrik PLN, Pulsa, VPN, dan Jasa Kreatif) yang terintegrasi langsung dengan **Google Sheets** sebagai database online.

---

## ⚡ Fitur Utama

- **Alur Checkout 4 Langkah Santai:**
  1. Pilih Produk
  2. Baca Cara Pakai & Syarat
  3. Bayar via QRIS / DANA
  4. Kirim Bukti Pembayaran ke WhatsApp (Otomatis terisi format teks)
- **Desain Modern & Mobile-First:** Tema gelap tech/esports navy & sky blue (`#071324` & `#38bdf8`), typography Plus Jakarta Sans, dan Material Symbols.
- **Backend Tanpa Biaya Server:** Menggunakan Google Apps Script (`Code.gs`) yang terhubung langsung ke Google Sheets.
- **Admin Panel Terintegrasi (`admin.html`):** Kelola produk, ubah harga, toggle status ready / kosong, edit panduan langkah pakai, dan upload foto produk langsung dari browser.
- **Proteksi Harga Server-Side:** Harga divalidasi ulang di backend untuk mencegah manipulasi client-side.
- **Zero-Dependency Frontend:** HTML5, Tailwind CSS (CDN), dan Vanilla JavaScript modular.

---

## 📁 Struktur Folder

```
Bigboz Store/
├── index.html          # Halaman toko utama (SPA)
├── admin.html          # Panel admin pengelolaan produk
├── Code.gs             # Backend Google Apps Script
├── vercel.json         # Konfigurasi deployment Vercel
├── .gitignore          # File yang diabaikan Git
├── README.md           # Dokumentasi proyek
├── PANDUAN_SETUP.md    # Panduan setup Google Sheets lengkap
├── css/
│   └── style.css       # Custom styling pendukung
├── js/
│   ├── admin-data.js   # Module manajemen data localStorage
│   ├── api.js          # Konfigurasi & komunikasi backend
│   ├── checkout.js     # Modul invoice & WhatsApp dispatcher
│   ├── ui.js           # Render UI dinamis
│   └── utils.js        # Helper & formatter rupiah/WA
└── assets/
    └── img/            # Gambar produk & QRIS SVG
```

---

## 🚀 Panduan Deployment

### 1. Hubungkan ke Google Sheets
Ikuti panduan lengkap pada [PANDUAN_SETUP.md](PANDUAN_SETUP.md) untuk setup database spreadsheet dan deploy `Code.gs` sebagai Web App.

### 2. Atur Konfigurasi di `js/api.js`
Ganti nilai konfigurasi toko:
```javascript
const CONFIG = {
  API_URL: 'https://script.google.com/macros/s/AKfycb.../exec',
  WA_ADMIN: '6281234567890',
  DANA_NUMBER: '081234567890',
  DANA_NAME: 'Nama Pemilik DANA',
  QRIS_IMAGE: 'assets/img/qris.svg',
};
```

### 3. Deploy ke Vercel
1. Push repositori ini ke GitHub.
2. Buka [vercel.com](https://vercel.com) dan login dengan akun GitHub kamu.
3. Klik **"Add New"** → **"Project"** → pilih repositori `Bigboz Store`.
4. Framework Preset: **Other** (karena HTML/JS statis).
5. Klik **"Deploy"**. Web toko online kamu langsung aktif dalam hitungan detik!

---

## 📄 Lisensi
Dibuat untuk BIGBOZ STORE. Hak Cipta Dilindungi.
