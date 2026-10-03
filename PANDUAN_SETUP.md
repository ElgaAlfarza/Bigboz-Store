# PANDUAN SETUP BIGBOZ STORE
## Lengkap dari Nol sampai Online

---

## 📁 Struktur Folder Proyek

```
Bigboz Store/
├── index.html          ← Halaman utama (satu file SPA)
├── Code.gs             ← Backend Google Apps Script
├── css/
│   └── style.css       ← Styling custom
├── js/
│   ├── api.js          ← Komunikasi dengan backend
│   ├── ui.js           ← Render UI & interaksi
│   ├── checkout.js     ← Halaman instruksi pembayaran
│   └── utils.js        ← Fungsi-fungsi pembantu
└── assets/
    └── img/
        └── qris.png    ← Ganti dengan gambar QRIS kamu
```

---

## 🗂️ LANGKAH 1 — Buat Google Sheet

### A. Buat Sheet baru
1. Buka [Google Sheets](https://sheets.google.com)
2. Klik **"+ Blank"** untuk spreadsheet baru
3. Beri nama: **"Bigboz Store Database"**

### B. Sheet "Produk" — Buat header kolom

Di **Sheet1**, rename jadi **"Produk"**, lalu buat header di **baris 1**:

| Kolom | A | B | C | D | E | F | G | H | I | J |
|-------|---|---|---|---|---|---|---|---|---|---|
| **Header** | id | kategori | nama | varian | harga | deskripsi | langkah_pakai | field_input | status_aktif | badge | stok |

> **PENTING:** Nama kolom harus persis seperti di atas (lowercase, tanpa spasi)!

### C. Isi data produk contoh (minimal 8 baris)

Salin data di bawah ini ke baris 2 dst:

```
id  | kategori      | nama              | varian         | harga | deskripsi                                    | langkah_pakai                                                                                                              | field_input                        | status_aktif | badge    | stok
1   | Akun Premium  | Gemini Pro        | 18 Bulan       | 30000 | Akun Gemini Pro original 18 bulan...          | Kirim pesanan via WA|Admin kirim akun 1x24 jam|Login pakai akun yang dikirim|Jangan ubah email/password|Nikmati 18 bulan    | Email Kamu                         | TRUE         | Terlaris | 10
2   | Top Up Game   | Free Fire         | 70 Diamond     | 11000 | Top Up Diamond FF langsung ke akun kamu      | Masukkan User ID FF|Pilih nominal|Bayar sesuai harga|Admin proses 5-15 menit|Diamond masuk akun                            | User ID Free Fire|Server           | TRUE         | Promo    | 999
3   | Top Up Game   | Free Fire         | 140 Diamond    | 21000 | Top Up Diamond FF langsung ke akun kamu      | Masukkan User ID FF|Pilih nominal|Bayar sesuai harga|Admin proses 5-15 menit|Diamond masuk akun                            | User ID Free Fire|Server           | TRUE         |          | 999
4   | Top Up Game   | Mobile Legends    | 86 Diamond     | 20000 | Top Up Diamond ML resmi                      | Siapkan User ID & Server ID|Isi di form|Lakukan pembayaran|Admin proses|Diamond masuk 5-30 menit                          | User ID Mobile Legends|Server ID   | TRUE         |          | 999
5   | Top Up Game   | Mobile Legends    | 172 Diamond    | 39000 | Top Up Diamond ML resmi                      | Siapkan User ID & Server ID|Isi di form|Lakukan pembayaran|Admin proses|Diamond masuk 5-30 menit                          | User ID Mobile Legends|Server ID   | TRUE         | Terlaris | 999
6   | PPOB          | Token Listrik PLN | Rp 25.000      | 26500 | Token PLN langsung dikirim via WA            | Masukkan nomor meter PLN|Bayar sesuai nominal|Admin kirim token ke WA|Masukkan token ke meteran|Listrik aktif                    | Nomor Meter PLN (11-13 digit)      | TRUE         |          | 999
7   | PPOB          | Token Listrik PLN | Rp 50.000      | 51500 | Token PLN langsung dikirim via WA            | Masukkan nomor meter PLN|Bayar sesuai nominal|Admin kirim token ke WA|Masukkan token ke meteran|Listrik aktif                    | Nomor Meter PLN (11-13 digit)      | TRUE         |          | 999
8   | PPOB          | Pulsa             | Rp 10.000      | 11500 | Isi pulsa semua operator                     | Masukkan nomor HP tujuan|Pilih nominal|Bayar|Pulsa terkirim 1-5 menit|Cek saldo HP                                              | Nomor HP Tujuan                    | TRUE         |          | 999
9   | Paket Data    | VPN Premium       | 1 Bulan        | 15000 | VPN premium aman & bebas blokir              | Pesan dan bayar|Admin kirim detail akun|Download app VPN|Masukkan data akun|Internet aman 1 bulan                              | Email Kamu                         | TRUE         |          | 50
10  | Jasa Digital  | Pembuatan Website | Paket Basic    | 0     | Website profesional mulai Rp 350.000        | Hubungi admin WA untuk diskusi|Admin kirim penawaran|Setuju, DP 50%|Admin mulai kerja|Revisi|Pelunasan & website aktif              | Brief Kebutuhan Website            | TRUE         |          | 5
11  | Jasa Digital  | Joki Tugas        | Sesuai Kebutuhan | 0   | Jasa tugas kuliah/sekolah, harga nego        | Kirim brief ke admin WA|Admin beri estimasi harga|Setuju, bayar DP|Admin kerjakan|Revisi|Tugas selesai, bayar sisa            | Deskripsi Tugas|Deadline           | TRUE         |          | 10
```

> **Tips langkah_pakai:** Pisahkan setiap langkah dengan tanda **|** (pipe). Ini akan ditampilkan sebagai stepper bernomor di halaman produk.

### D. Sheet "Pesanan" — Buat sheet baru

1. Klik **"+"** di bawah untuk tambah sheet
2. Rename jadi **"Pesanan"**
3. Buat header di baris 1 (kolom A–J):

```
order_id | waktu | nama | wa | produk | varian | target | total | metode | status
```

> Sheet Pesanan akan terisi otomatis setiap ada pesanan baru. Kamu tidak perlu isi secara manual.

---

## ⚙️ LANGKAH 2 — Setup Google Apps Script

### A. Buka Apps Script dari Sheet

1. Di Google Sheet kamu, klik menu **"Extensions"** (Ekstensi)
2. Pilih **"Apps Script"**
3. Tab baru akan terbuka dengan editor kode

### B. Ganti kode dengan Code.gs

1. Hapus semua kode yang ada (biasanya ada `function myFunction() {}`)
2. Salin seluruh isi file **`Code.gs`** dari folder proyek
3. Tempel ke editor Apps Script
4. Klik **💾 Save** (Ctrl+S)

### C. Test fungsi sebelum deploy

1. Di bagian atas editor, pilih fungsi **`testDoGet`** dari dropdown
2. Klik tombol **▶ Run**
3. Lihat log di bagian bawah — harus muncul daftar produk dalam format JSON

### D. Deploy sebagai Web App

1. Klik **"Deploy"** di pojok kanan atas
2. Pilih **"New deployment"**
3. Klik ikon ⚙️ di sebelah "Type" → pilih **"Web app"**
4. Isi pengaturan:
   - **Description:** `Bigboz Store API v1`
   - **Execute as:** `Me` ← WAJIB pilih ini!
   - **Who has access:** `Anyone` ← WAJIB pilih ini!
5. Klik **"Deploy"**
6. **Izinkan akses** saat diminta (klik "Review permissions" → pilih akun Google kamu → "Allow")
7. **Salin URL Web App** yang muncul — ini adalah URL API kamu!

> URL formatnya: `https://script.google.com/macros/s/AKfyc.../exec`

---

## 🔧 LANGKAH 3 — Konfigurasi File api.js

Buka file **`js/api.js`** dan ganti bagian CONFIG:

```javascript
const CONFIG = {
  // Tempel URL Web App dari langkah sebelumnya
  API_URL: 'https://script.google.com/macros/s/AKfyc.../exec',

  // Nomor WA admin (format 62xxx, tanpa + dan tanpa spasi)
  WA_ADMIN: '6281234567890',  // ← Ganti dengan nomor WA kamu

  // Nama toko
  STORE_NAME: 'Bigboz Store',

  // Nomor DANA admin
  DANA_NUMBER: '081234567890',  // ← Ganti dengan nomor DANA kamu
  DANA_NAME: 'Nama Pemilik',    // ← Ganti dengan nama pemilik DANA

  // Path gambar QRIS
  QRIS_IMAGE: 'assets/img/qris.png',  // Ganti gambar qris.png dengan QRIS kamu
};
```

> **Cara dapat nomor WA format 62xxx:** Jika nomormu `08123456789`, formatnya jadi `628123456789` (ganti `0` di awal dengan `62`)

---

## 🖼️ LANGKAH 4 — Ganti Gambar QRIS

1. Ambil gambar QRIS kamu dari aplikasi banking atau GoPay/OVO dll
2. Simpan dengan nama **`qris.png`**
3. Taruh di folder **`assets/img/`**
4. Ukuran gambar minimal 400x400 pixel agar bisa di-scan dengan jelas

---

## 🖥️ LANGKAH 5 — Jalankan Local Server untuk Preview

Kamu perlu local server karena browser memblokir file JS dari `file://`.

### Opsi A: Python (paling mudah)

```bash
# Buka terminal/PowerShell di folder Bigboz Store
cd "d:\BigBoz\Bigboz Store"

# Python 3
python -m http.server 8000

# Atau Python 2
python -m SimpleHTTPServer 8000
```

Buka browser: **http://localhost:8000**

### Opsi B: Node.js (npx)

```bash
cd "d:\BigBoz\Bigboz Store"
npx serve .
```

### Opsi C: VS Code Live Server

1. Install extension **"Live Server"** di VS Code
2. Klik kanan `index.html` → **"Open with Live Server"**

---

## 🌐 LANGKAH 6 — Upload ke Hosting (Online)

### Opsi Gratis: Netlify

1. Buka [netlify.com](https://netlify.com) dan daftar (gratis)
2. Drag & drop folder **"Bigboz Store"** ke halaman Netlify
3. Kamu langsung dapat URL seperti `https://bigboz-store.netlify.app`

### Opsi Gratis Lainnya:
- **GitHub Pages**: Upload ke repo GitHub, aktifkan Pages
- **Vercel**: Mirip Netlify, gratis untuk project kecil
- **Cloudflare Pages**: Gratis dan super cepat

### Opsi Berbayar (domain sendiri):
- Hosting Indonesia: Niagahoster, IDwebhost, Domainesia
- Upload via FTP/cPanel dengan nama domain sendiri

---

## ✅ CHECKLIST TESTING — Alur Lengkap

Lakukan testing ini setiap sebelum membuka toko:

### 📱 Test di HP (wajib!)

- [ ] Buka website di Chrome HP kamu
- [ ] Halaman beranda tampil dengan baik (tidak geser ke kanan)
- [ ] Semua teks terbaca jelas tanpa zoom
- [ ] Tombol "Beli Sekarang" mudah di-tap (tidak terlalu kecil)

### 🛍️ Alur Belanja (pilih produk)

- [ ] Tab kategori bisa di-scroll horizontal
- [ ] Search bar berfungsi (coba ketik "Diamond")
- [ ] Kartu produk tampil dengan harga dan badge
- [ ] Klik "Beli Sekarang" → modal detail terbuka
- [ ] Chip varian bisa dipilih dan harga berubah
- [ ] Cara Menggunakan tampil sebagai stepper bernomor

### 📝 Form & Validasi

- [ ] Klik "Lanjut Bayar" saat form kosong → muncul pesan error merah
- [ ] Isi nama dan WA format salah (mis: `1234`) → muncul error WA
- [ ] Isi nomor WA format benar (`08xxx`) → error hilang
- [ ] Semua field wajib terisi → tombol bisa diklik

### 💳 Pilih Metode Bayar

- [ ] Pilih DANA → muncul nomor DANA dan nama pemilik
- [ ] Tombol "Salin" nomor DANA berfungsi (muncul "✅ Disalin!")
- [ ] Pilih QRIS → muncul gambar QR
- [ ] Tombol "Unduh QRIS" berfungsi

### 🧾 Instruksi Pembayaran

- [ ] Klik "Lanjut Bayar" dengan form lengkap → muncul halaman instruksi
- [ ] Order ID tampil (format BBZ-YYYYMMDD-XXXX)
- [ ] Tombol "Salin Order ID" berfungsi
- [ ] Total bayar tampil dengan benar
- [ ] Instruksi bayar sesuai metode yang dipilih (DANA atau QRIS)

### 📲 Kirim ke WhatsApp

- [ ] Klik tombol hijau "Saya Sudah Bayar → Kirim Bukti ke WhatsApp"
- [ ] Aplikasi WA terbuka (atau browser WA Web)
- [ ] Pesan otomatis sudah terisi: Order ID, nama, produk, target, total, metode
- [ ] Kamu tinggal lampirkan screenshot bukti bayar

### 🔄 Navigasi

- [ ] Tombol "← Kembali ke Katalog" di halaman instruksi berfungsi
- [ ] Tombol WA melayang di pojok kanan bawah berfungsi
- [ ] FAQ bisa dibuka/tutup dengan klik

### 📊 Google Sheet (setelah API terhubung)

- [ ] Lakukan 1 pembelian test
- [ ] Cek Google Sheet → tab "Pesanan" harus ada baris baru
- [ ] Kolom status harus: "Menunggu Pembayaran"
- [ ] Kolom harga harus sesuai (ambil dari sheet, bukan dari frontend)

---

## ❗ Troubleshooting Umum

### "API URL belum dikonfigurasi" / Pakai data contoh
→ Kamu belum ganti `API_URL` di `js/api.js`. Ikuti Langkah 3 di atas.

### Pesanan tidak masuk ke Google Sheet
→ Pastikan saat deploy, **"Who has access" = Anyone**. Coba re-deploy dengan setting baru.

### Gambar QRIS tidak muncul
→ Pastikan file bernama persis `qris.png` di folder `assets/img/`. Ukuran file jangan terlalu besar (max 2MB).

### Modal produk tidak bisa ditutup
→ Coba klik di area gelap di luar modal, atau tekan tombol ESC.

### Nomor WA tidak valid padahal sudah benar
→ Format yang valid: `08xxxx` (10-13 digit) atau `62xxxx`. Jangan pakai spasi atau tanda hubung.

---

## 📞 Butuh Bantuan?

Hubungi admin Bigboz Store melalui:
- WhatsApp: [Klik untuk chat](https://wa.me/6281234567890)
- Jam respon: 08.00 – 22.00 WIB

---

*Panduan ini dibuat untuk Bigboz Store · Versi 1.0 · 2024*
