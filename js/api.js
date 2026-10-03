/**
 * api.js - Modul komunikasi dengan Google Apps Script Backend
 * Bigboz Store - Semua request ke backend melalui file ini
 */

// ================================================================
// KONFIGURASI - Ganti URL ini setelah deploy Google Apps Script
// ================================================================
const CONFIG = {
  // Ganti dengan URL Web App setelah deploy di Google Apps Script
  API_URL: 'https://script.googleusercontent.com/macros/echo?user_content_key=AUkAhnR9uxk5aXwQ19EU7T-SAUkinCepZ7-8FFKY4VDWO9gMU7VXBtx_JoO1yV2bkZdwTE5qNayQxH-ZsJ3K-BlbAYlnXmHDVJn4SAkATXA4YzDMnl4oXqfajnIbpkUwjBDP1vxWM5uZkEPE4rN1HkkrwhCj-Am9INGQ3LGhpJDNsbMG-Y_Ua6zdSKxXTzmWX5yXEc_pfY6DButvHaFarIXq2rPfao7f6DltIK-7vAYtNnOLnJH-qLz03HUPEhStrDp6-WLr_uHzER02Z1v5ip99eGyexYcRug&lib=Mko_xikTvZ5PmK9v1FRAo7C9Eq6nprUKQ',

  // Nomor WhatsApp admin (format internasional tanpa +)
  WA_ADMIN: '6285238208849',

  // Nama toko
  STORE_NAME: 'Bigboz Store',

  // Nomor DANA admin
  DANA_NUMBER: '085238208849',
  DANA_NAME: 'Elfila Melany',

  // Path gambar QRIS
  QRIS_IMAGE: 'assets/img/qris.svg',
};

// Export config agar bisa dipakai modul lain
window.BIGBOZ_CONFIG = CONFIG;

/**
 * Ambil semua produk aktif dari Google Apps Script (doGet)
 * Menggunakan JSONP-like approach via fetch dengan mode no-cors fallback
 * @returns {Promise<Array>} Array produk
 */
async function fetchProducts() {
  try {
    // Cek apakah URL API sudah dikonfigurasi
    if (CONFIG.API_URL === 'GANTI_DENGAN_URL_GOOGLE_APPS_SCRIPT_KAMU') {
      console.warn('API URL belum dikonfigurasi, menggunakan data contoh.');
      return getMockProducts();
    }

    const response = await fetch(`${CONFIG.API_URL}?action=products`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'ok') {
      throw new Error(data.message || 'Gagal mengambil data produk');
    }

    return data.products;
  } catch (error) {
    console.error('fetchProducts error:', error);
    // Fallback ke data mock jika API gagal
    return getMockProducts();
  }
}

/**
 * Kirim data pesanan ke Google Apps Script (doPost)
 * Dikirim sebagai text/plain untuk menghindari CORS preflight
 * @param {Object} orderData - Data pesanan dari checkout
 * @returns {Promise<Object>} Response dari server {status, order_id, message}
 */
async function submitOrder(orderData) {
  try {
    // Validasi URL API
    if (CONFIG.API_URL === 'GANTI_DENGAN_URL_GOOGLE_APPS_SCRIPT_KAMU') {
      // Mode demo: simulasikan response sukses
      const fakeOrderId = generateDemoOrderId();
      return {
        status: 'ok',
        order_id: fakeOrderId,
        message: 'Demo mode - pesanan tidak benar-benar tersimpan',
        demo: true,
      };
    }

    // Kirim sebagai text/plain agar tidak ada CORS preflight
    // Google Apps Script akan parse body ini sebagai JSON
    const response = await fetch(CONFIG.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'create_order',
        ...orderData,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('submitOrder error:', error);
    throw new Error('Gagal menghubungi server. Coba lagi atau hubungi admin via WhatsApp.');
  }
}

/**
 * Generate demo order ID (hanya untuk mode offline/demo)
 */
function generateDemoOrderId() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = String(Math.floor(Math.random() * 9000) + 1000);
  return `BBZ-${date}-${rand}`;
}

/**
 * Data produk contoh (digunakan saat API belum dikonfigurasi atau offline)
 * Struktur sama persis dengan yang ada di Google Sheet
 */
function getMockProducts() {
  // Cek apakah ada data dari admin panel (localStorage)
  const adminData = window.BigbozAdmin ? window.BigbozAdmin.getProduk() : null;
  if (adminData && adminData.length > 0) return adminData;

  return [
    {
      id: '1',
      kategori: 'Akun Premium',
      nama: 'Gemini Pro',
      varian: '18 Bulan',
      harga: 30000,
      deskripsi: 'Akun Gemini Pro original 18 bulan. Akses semua fitur AI premium tanpa batas.',
      langkah_pakai: 'Kirim pesanan via WhatsApp|Admin akan mengirimkan akun dalam 1x24 jam|Login menggunakan akun yang dikirim admin|Jangan ubah email atau password akun|Nikmati fitur premium selama 18 bulan',
      field_input: 'Email Kamu',
      badge: 'Terlaris',
      stok: 10,
      gambar: 'assets/img/prod_gemini_pro.jpg',
    },
    {
      id: '2',
      kategori: 'Top Up Game',
      nama: 'Free Fire',
      varian: '70 Diamond',
      harga: 11000,
      deskripsi: 'Top Up Diamond Free Fire langsung ke akun kamu. Proses otomatis cepat!',
      langkah_pakai: 'Masukkan User ID Free Fire kamu|Pilih nominal diamond|Bayar sesuai harga|Admin proses dalam 5-15 menit|Diamond masuk ke akun kamu',
      field_input: 'User ID Free Fire|Server (misal: Indonesia)',
      badge: 'Promo',
      stok: 999,
      gambar: 'assets/img/prod_free_fire.jpg',
    },
    {
      id: '3',
      kategori: 'Top Up Game',
      nama: 'Free Fire',
      varian: '140 Diamond',
      harga: 21000,
      deskripsi: 'Top Up Diamond Free Fire langsung ke akun kamu. Proses otomatis cepat!',
      langkah_pakai: 'Masukkan User ID Free Fire kamu|Pilih nominal diamond|Bayar sesuai harga|Admin proses dalam 5-15 menit|Diamond masuk ke akun kamu',
      field_input: 'User ID Free Fire|Server (misal: Indonesia)',
      badge: '',
      stok: 999,
      gambar: 'assets/img/prod_free_fire.jpg',
    },
    {
      id: '4',
      kategori: 'Top Up Game',
      nama: 'Mobile Legends',
      varian: '86 Diamond',
      harga: 20000,
      deskripsi: 'Top Up Diamond Mobile Legends resmi. Langsung masuk ke akun dalam hitungan menit.',
      langkah_pakai: 'Siapkan User ID dan Server ID Mobile Legends kamu|Masukkan ID di form pembelian|Lakukan pembayaran|Admin akan proses pesananmu|Diamond masuk dalam 5-30 menit',
      field_input: 'User ID Mobile Legends|Server ID',
      badge: '',
      stok: 999,
      gambar: 'assets/img/prod_mobile_legends.jpg',
    },
    {
      id: '5',
      kategori: 'Top Up Game',
      nama: 'Mobile Legends',
      varian: '172 Diamond',
      harga: 39000,
      deskripsi: 'Top Up Diamond Mobile Legends resmi. Langsung masuk ke akun dalam hitungan menit.',
      langkah_pakai: 'Siapkan User ID dan Server ID Mobile Legends kamu|Masukkan ID di form pembelian|Lakukan pembayaran|Admin akan proses pesananmu|Diamond masuk dalam 5-30 menit',
      field_input: 'User ID Mobile Legends|Server ID',
      badge: 'Terlaris',
      stok: 999,
      gambar: 'assets/img/prod_mobile_legends.jpg',
    },
    {
      id: '6',
      kategori: 'PPOB',
      nama: 'Token Listrik PLN',
      varian: 'Rp 25.000',
      harga: 26500,
      deskripsi: 'Token listrik PLN langsung dikirim via WhatsApp. Proses cepat, berlaku 24 jam.',
      langkah_pakai: 'Masukkan nomor meter PLN (11-13 digit) di form|Bayar sesuai nominal|Admin kirim token ke WhatsApp kamu|Masukkan token ke meteran listrik|Listrik kamu langsung aktif',
      field_input: 'Nomor Meter PLN (11-13 digit)',
      badge: '',
      stok: 999,
      gambar: 'assets/img/prod_token_pln.svg',
    },
    {
      id: '7',
      kategori: 'PPOB',
      nama: 'Token Listrik PLN',
      varian: 'Rp 50.000',
      harga: 51500,
      deskripsi: 'Token listrik PLN langsung dikirim via WhatsApp. Proses cepat, berlaku 24 jam.',
      langkah_pakai: 'Masukkan nomor meter PLN (11-13 digit) di form|Bayar sesuai nominal|Admin kirim token ke WhatsApp kamu|Masukkan token ke meteran listrik|Listrik kamu langsung aktif',
      field_input: 'Nomor Meter PLN (11-13 digit)',
      badge: '',
      stok: 999,
      gambar: 'assets/img/prod_token_pln.svg',
    },
    {
      id: '8',
      kategori: 'PPOB',
      nama: 'Pulsa',
      varian: 'Rp 10.000',
      harga: 11500,
      deskripsi: 'Isi pulsa semua operator (Telkomsel, XL, Indosat, Tri, Smartfren). Proses otomatis.',
      langkah_pakai: 'Masukkan nomor HP tujuan di form|Pilih nominal pulsa|Bayar sesuai harga|Pulsa otomatis terkirim dalam 1-5 menit|Cek saldo HP kamu',
      field_input: 'Nomor HP Tujuan',
      badge: '',
      stok: 999,
      gambar: 'assets/img/prod_pulsa.svg',
    },
    {
      id: '9',
      kategori: 'Paket Data',
      nama: 'VPN Premium',
      varian: '1 Bulan',
      harga: 15000,
      deskripsi: 'VPN premium untuk akses internet aman dan bebas blokir. Cocok untuk kerja remote.',
      langkah_pakai: 'Pesan dan bayar VPN|Admin kirim detail akun VPN ke WhatsApp|Download aplikasi VPN yang ditunjukkan admin|Masukkan data akun yang dikirim|Nikmati internet aman selama 1 bulan',
      field_input: 'Email Kamu',
      badge: '',
      stok: 50,
      gambar: 'assets/img/prod_vpn.svg',
    },
    {
      id: '10',
      kategori: 'Jasa Digital',
      nama: 'Pembuatan Website',
      varian: 'Paket Basic',
      harga: 0,
      deskripsi: 'Website profesional untuk bisnis kamu. Termasuk hosting 1 tahun, domain .com, dan desain modern. Harga mulai dari Rp 350.000. Diskusi kebutuhan dulu via WhatsApp!',
      langkah_pakai: 'Hubungi admin via WhatsApp untuk diskusi kebutuhan|Admin akan kirim penawaran harga|Setuju harga, lakukan DP 50%|Admin mulai pengerjaan website|Revisi hingga sesuai keinginan|Pelunasan dan website aktif',
      field_input: 'Brief Kebutuhan Website',
      badge: '',
      stok: 5,
      gambar: 'assets/img/prod_website.svg',
    },
    {
      id: '11',
      kategori: 'Jasa Digital',
      nama: 'Joki Tugas',
      varian: 'Sesuai Kebutuhan',
      harga: 0,
      deskripsi: 'Jasa pengerjaan tugas kuliah/sekolah (makalah, skripsi bab, laporan, presentasi). Harga tergantung tingkat kesulitan. Hubungi admin dulu!',
      langkah_pakai: 'Kirim brief tugas ke admin via WhatsApp|Admin evaluasi dan berikan estimasi harga|Setuju harga, bayar DP|Admin kerjakan tugas sesuai deadline|Revisi jika diperlukan|Tugas selesai, bayar sisa',
      field_input: 'Deskripsi Tugas|Deadline',
      badge: '',
      stok: 10,
      gambar: 'assets/img/prod_joki.svg',
    },
  ];
}

// Export fungsi agar bisa dipakai modul lain
window.BigbozAPI = {
  fetchProducts,
  submitOrder,
  CONFIG,
};
