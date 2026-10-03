// ============================================================
// Code.gs — Google Apps Script Backend untuk Bigboz Store
// Auto-Setup Database, Header & Dataset Otomatis
// Deploy sebagai Web App (Execute as: Me, Who can access: Anyone)
// ============================================================

// ── Nama Sheet ──
var SHEET_PRODUK  = 'Produk';
var SHEET_PESANAN = 'Pesanan';

// ── Header Kolom ──
var HEADER_PRODUK = [
  'id', 'kategori', 'nama', 'varian', 'harga',
  'deskripsi', 'langkah_pakai', 'field_input',
  'status_aktif', 'badge', 'stok', 'gambar'
];

var HEADER_PESANAN = [
  'order_id', 'waktu', 'nama', 'wa',
  'produk', 'varian', 'target', 'total',
  'metode', 'status'
];

// ── Data Awal Produk (Default Dataset) ──
var DATA_PRODUK_DEFAULT = [
  [
    '1', 'Akun Premium', 'Gemini Pro', '18 Bulan', 30000,
    'Akun Gemini Pro original 18 bulan full garansi.',
    'Kirim pesanan via WhatsApp|Admin proses akun dalam 1x24 jam|Login akun yang dikirimkan|Nikmati fitur premium',
    'Email Kamu', 'TRUE', 'Terlaris', 10, 'assets/img/prod_gemini_pro.jpg'
  ],
  [
    '2', 'Top Up Game', 'Free Fire', '70 Diamond', 11000,
    'Top Up Diamond FF langsung proses otomatis.',
    'Masukkan User ID FF kamu|Pilih nominal varian|Selesaikan pembayaran|Diamond masuk ke akun 1-5 menit',
    'User ID Free Fire|Server', 'TRUE', 'Promo', 999, 'assets/img/prod_free_fire.jpg'
  ],
  [
    '3', 'Top Up Game', 'Free Fire', '140 Diamond', 21000,
    'Top Up Diamond FF langsung proses otomatis.',
    'Masukkan User ID FF kamu|Pilih nominal varian|Selesaikan pembayaran|Diamond masuk ke akun 1-5 menit',
    'User ID Free Fire|Server', 'TRUE', '', 999, 'assets/img/prod_free_fire.jpg'
  ],
  [
    '4', 'Top Up Game', 'Mobile Legends', '86 Diamond', 20000,
    'Diamond MLBB resmi kilat.',
    'Salin User ID & Server ID ML kamu|Isi form dan pilih varian|Bayar via QRIS/DANA|Diamond otomatis masuk',
    'User ID Mobile Legends|Server ID', 'TRUE', '', 999, 'assets/img/prod_mobile_legends.jpg'
  ],
  [
    '5', 'Top Up Game', 'Mobile Legends', '172 Diamond', 39000,
    'Diamond MLBB resmi kilat.',
    'Salin User ID & Server ID ML kamu|Isi form dan pilih varian|Bayar via QRIS/DANA|Diamond otomatis masuk',
    'User ID Mobile Legends|Server ID', 'TRUE', 'Terlaris', 999, 'assets/img/prod_mobile_legends.jpg'
  ],
  [
    '6', 'PPOB', 'Token Listrik PLN', 'Rp 25.000', 26500,
    'Token stroom PLN 24 jam langsung terkirim.',
    'Masukkan 11-12 digit nomor meteran PLN|Bayar sesuai nominal|Admin kirimkan 20 digit kode token via WA|Masukkan kode ke meteran rumah',
    'Nomor Meter PLN (11-12 digit)', 'TRUE', '', 999, 'assets/img/prod_token_pln.svg'
  ],
  [
    '7', 'PPOB', 'Token Listrik PLN', 'Rp 50.000', 51500,
    'Token stroom PLN 24 jam langsung terkirim.',
    'Masukkan 11-12 digit nomor meteran PLN|Bayar sesuai nominal|Admin kirimkan 20 digit kode token via WA|Masukkan kode ke meteran rumah',
    'Nomor Meter PLN (11-12 digit)', 'TRUE', '', 999, 'assets/img/prod_token_pln.svg'
  ],
  [
    '8', 'PPOB', 'Pulsa', 'Rp 10.000', 11500,
    'Pulsa all operator (Telkomsel, XL, Indosat, Tri).',
    'Masukkan nomor HP tujuan|Pilih nominal pulsa|Bayar via QRIS/DANA|Pulsa terkirim otomatis 1-3 menit',
    'Nomor HP Tujuan', 'TRUE', '', 999, 'assets/img/prod_pulsa.svg'
  ],
  [
    '9', 'Paket Data', 'VPN Premium', '1 Bulan', 15000,
    'VPN kilat aman, bebas blokir & anti lag.',
    'Bayar pesanan VPN|Admin kirim file konfigurasi & akun ke WA|Download aplikasi VPN|Koneksi langsung aktif',
    'Email Kamu', 'TRUE', '', 50, 'assets/img/prod_vpn.svg'
  ],
  [
    '10', 'Jasa Digital', 'Pembuatan Website', 'Paket Basic', 0,
    'Jasa website toko online & landing page bisnis.',
    'Hubungi admin via WhatsApp|Konsultasi konsep toko & desain|Admin berikan penawaran harga|Website siap online dalam 24 jam',
    'Konsep / Nama Toko', 'TRUE', '', 5, 'assets/img/prod_website.svg'
  ],
  [
    '11', 'Jasa Digital', 'Joki Tugas', 'Sesuai Kebutuhan', 0,
    'Jasa pengerjaan makalah, laporan & presentasi.',
    'Kirimkan materi tugas ke WA admin|Admin evaluasi tingkat kesulitan & deadline|Setuju harga, tugas langsung dikerjakan',
    'Deskripsi Tugas|Deadline', 'TRUE', '', 10, 'assets/img/prod_joki.svg'
  ]
];

// ============================================================
// MENU OTOMATIS DI GOOGLE SHEETS
// Saat file spreadsheet dibuka, muncul menu "🏪 Bigboz Store"
// ============================================================
function onOpen() {
  try {
    SpreadsheetApp.getUi()
      .createMenu('🏪 Bigboz Store')
      .addItem('⚡ Setup Database Otomatis (Header & Produk)', 'menuSetupOtomatis')
      .addItem('📦 Reset Data Produk ke Bawaan', 'resetDataProdukBawaan')
      .addToUi();
  } catch (e) {
    // Diabaikan jika dijalankan di luar context UI
  }
}

function menuSetupOtomatis() {
  var hasil = setupDatabaseOtomatis();
  SpreadsheetApp.getUi().alert('✅ Berhasil!', hasil.message, SpreadsheetApp.getUi().ButtonSet.OK);
}

function resetDataProdukBawaan() {
  var ui = SpreadsheetApp.getUi();
  var resp = ui.alert('Konfirmasi Reset', 'Apakah Anda yakin ingin mereset data produk ke 11 produk awal?', ui.ButtonSet.YES_NO);
  if (resp === ui.Button.YES) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_PRODUK);
    if (sheet) {
      sheet.clearContents();
    }
    setupDatabaseOtomatis();
    ui.alert('✅ Selesai', 'Data produk telah direset ke 11 produk awal.', ui.ButtonSet.OK);
  }
}

// ============================================================
// FUNGSI UTAMA: SETUP DATABASE OTOMATIS
// Menambahkan Tab Sheet, Header Baris 1, dan 11 Data Produk
// ============================================================
function setupDatabaseOtomatis() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. SETUP TAB "Produk"
  var sheetProduk = ss.getSheetByName(SHEET_PRODUK);
  if (!sheetProduk) {
    sheetProduk = ss.insertSheet(SHEET_PRODUK);
  }

  // Jika sheet kosong atau belum ada data produk
  if (sheetProduk.getLastRow() < 2) {
    sheetProduk.clear();

    // Tulis Header
    sheetProduk.appendRow(HEADER_PRODUK);

    // Format Header Produk
    var headerRange = sheetProduk.getRange(1, 1, 1, HEADER_PRODUK.length);
    headerRange.setBackground('#071324');
    headerRange.setFontColor('#38bdf8');
    headerRange.setFontWeight('bold');
    headerRange.setFontSize(10);
    sheetProduk.setFrozenRows(1);

    // Tulis 11 Data Produk Default
    for (var i = 0; i < DATA_PRODUK_DEFAULT.length; i++) {
      sheetProduk.appendRow(DATA_PRODUK_DEFAULT[i]);
    }

    // Auto-fit kolom agar rapi
    for (var c = 1; c <= HEADER_PRODUK.length; c++) {
      sheetProduk.autoResizeColumn(c);
    }
  }

  // 2. SETUP TAB "Pesanan"
  var sheetPesanan = ss.getSheetByName(SHEET_PESANAN);
  if (!sheetPesanan) {
    sheetPesanan = ss.insertSheet(SHEET_PESANAN);
  }

  if (sheetPesanan.getLastRow() === 0) {
    // Tulis Header Pesanan
    sheetPesanan.appendRow(HEADER_PESANAN);

    // Format Header Pesanan
    var headerRangeP = sheetPesanan.getRange(1, 1, 1, HEADER_PESANAN.length);
    headerRangeP.setBackground('#064e3b');
    headerRangeP.setFontColor('#34d399');
    headerRangeP.setFontWeight('bold');
    headerRangeP.setFontSize(10);
    sheetPesanan.setFrozenRows(1);

    for (var cp = 1; cp <= HEADER_PESANAN.length; cp++) {
      sheetPesanan.autoResizeColumn(cp);
    }
  }

  // 3. Bersihkan Sheet bawaan "Sheet1" jika ada
  var defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1) {
    try {
      ss.deleteSheet(defaultSheet);
    } catch (e) {}
  }

  return {
    status: 'ok',
    message: 'Tab "Produk" (11 produk) dan tab "Pesanan" telah dibuat otomatis dengan header lengkap!'
  };
}

// ============================================================
// doGet — Ambil daftar produk aktif (atau panggil ?action=setup)
// ============================================================
function doGet(e) {
  try {
    // Jika dipanggil dengan ?action=setup, jalankan setup otomatis
    if (e && e.parameter && e.parameter.action === 'setup') {
      var resSetup = setupDatabaseOtomatis();
      return jsonResponse(resSetup);
    }

    // Pastikan database sudah ada sebelum mengambil produk
    pastikanDatabaseSiap();

    var produk = getProdukAktif();
    return jsonResponse({ status: 'ok', products: produk });
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.message });
  }
}

// ============================================================
// doPost — Terima pesanan baru dari frontend
// ============================================================
function doPost(e) {
  var lock = LockService.getScriptLock();

  try {
    // Pastikan sheet Pesanan sudah siap
    pastikanDatabaseSiap();

    // Parse body JSON (dikirim sebagai text/plain)
    var body = JSON.parse(e.postData.contents);

    // Validasi action
    if (body.action !== 'create_order') {
      return jsonResponse({ status: 'error', message: 'Action tidak dikenal' });
    }

    // Ambil dan validasi field wajib
    var nama       = String(body.nama       || '').trim();
    var wa         = String(body.wa         || '').trim();
    var produkNama = String(body.produk     || '').trim();
    var varian     = String(body.varian     || '').trim();
    var metode     = String(body.metode     || '').trim();
    var produkId   = String(body.produk_id  || '').trim();
    var target     = body.target; // array [{label, nilai}]

    if (!nama || !wa || !produkNama || !varian || !metode) {
      return jsonResponse({ status: 'error', message: 'Field wajib tidak lengkap' });
    }

    // Validasi metode bayar
    if (metode !== 'DANA' && metode !== 'QRIS') {
      return jsonResponse({ status: 'error', message: 'Metode bayar tidak valid' });
    }

    // ── Hitung harga dari server (JANGAN percaya harga dari frontend) ──
    var hargaServer = getHargaDariSheet(produkId, produkNama, varian);
    if (hargaServer === null) {
      return jsonResponse({ status: 'error', message: 'Produk tidak ditemukan atau tidak aktif' });
    }

    // Buat Order ID unik dengan LockService
    lock.waitLock(5000); // tunggu max 5 detik
    var orderId = buatOrderId();

    // Simpan ke sheet Pesanan
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_PESANAN);

    // Buat header jika sheet kosong
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADER_PESANAN);
    }

    // Serialize target
    var targetStr = Array.isArray(target)
      ? target.map(function(t) { return t.label + ': ' + t.nilai; }).join(' | ')
      : String(target || '');

    // Append baris pesanan baru
    sheet.appendRow([
      orderId,
      new Date(),
      nama,
      wa,
      produkNama,
      varian,
      targetStr,
      hargaServer,
      metode,
      'Menunggu Pembayaran'
    ]);

    lock.releaseLock();

    return jsonResponse({
      status: 'ok',
      order_id: orderId,
      message: 'Pesanan berhasil dibuat',
      total: hargaServer
    });

  } catch (err) {
    try { lock.releaseLock(); } catch (e2) {}
    return jsonResponse({ status: 'error', message: 'Terjadi kesalahan: ' + err.message });
  }
}

// ============================================================
// HELPERS
// ============================================================

/**
 * Memastikan sheet Produk dan Pesanan sudah ada dan memiliki header
 */
function pastikanDatabaseSiap() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetProduk  = ss.getSheetByName(SHEET_PRODUK);
  var sheetPesanan = ss.getSheetByName(SHEET_PESANAN);

  if (!sheetProduk || !sheetPesanan || sheetProduk.getLastRow() < 2) {
    setupDatabaseOtomatis();
  }
}

/**
 * Ambil semua produk dengan status_aktif = TRUE dari sheet Produk
 * @returns {Array} Array of produk object
 */
function getProdukAktif() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_PRODUK);
  var data  = sheet.getDataRange().getValues();

  if (data.length < 2) return [];

  var header = data[0];
  var produk = [];

  for (var i = 1; i < data.length; i++) {
    var row = {};
    for (var j = 0; j < header.length; j++) {
      row[header[j]] = data[i][j];
    }

    // Hanya kirim yang aktif
    if (row['status_aktif'] === true || row['status_aktif'] === 'TRUE' || row['status_aktif'] === 1) {
      produk.push({
        id:            String(row['id'] || i),
        kategori:      String(row['kategori']      || ''),
        nama:          String(row['nama']          || ''),
        varian:        String(row['varian']        || ''),
        harga:         Number(row['harga']         || 0),
        deskripsi:     String(row['deskripsi']     || ''),
        langkah_pakai: String(row['langkah_pakai'] || ''),
        field_input:   String(row['field_input']   || ''),
        badge:         String(row['badge']         || ''),
        stok:          Number(row['stok']          || 0),
        gambar:        String(row['gambar']        || ''),
      });
    }
  }

  return produk;
}

/**
 * Cari harga produk dari sheet berdasarkan ID atau nama+varian
 * @param {string} produkId  - ID produk
 * @param {string} namaProduk - Nama produk
 * @param {string} varian - Varian produk
 * @returns {number|null} Harga atau null jika tidak ditemukan
 */
function getHargaDariSheet(produkId, namaProduk, varian) {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_PRODUK);
  var data  = sheet.getDataRange().getValues();

  if (data.length < 2) return null;

  var header = data[0];
  var idxId       = header.indexOf('id');
  var idxNama     = header.indexOf('nama');
  var idxVarian   = header.indexOf('varian');
  var idxHarga    = header.indexOf('harga');
  var idxAktif    = header.indexOf('status_aktif');

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var aktif = row[idxAktif];
    if (aktif !== true && aktif !== 'TRUE' && aktif !== 1) continue;

    // Match by ID
    var matchId   = produkId && String(row[idxId]) === String(produkId);
    // Match by nama + varian (fallback)
    var matchNama = String(row[idxNama]).toLowerCase() === namaProduk.toLowerCase()
                 && String(row[idxVarian]).toLowerCase() === varian.toLowerCase();

    if (matchId || matchNama) {
      return Number(row[idxHarga] || 0);
    }
  }

  return null; // tidak ditemukan
}

/**
 * Buat Order ID unik format BBZ-YYYYMMDD-XXXX
 * @returns {string}
 */
function buatOrderId() {
  var now  = new Date();
  var y    = now.getFullYear();
  var m    = String(now.getMonth() + 1).padStart(2, '0');
  var d    = String(now.getDate()).padStart(2, '0');
  var rand = String(Math.floor(Math.random() * 9000) + 1000);
  return 'BBZ-' + y + m + d + '-' + rand;
}

/**
 * Buat response JSON dengan header CORS
 * @param {Object} obj - Object yang di-serialize ke JSON
 * @returns {ContentService.TextOutput}
 */
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
// TEST FUNCTION (dapat dites langsung dari editor GAS)
// ============================================================
function testSetupOtomatis() {
  var res = setupDatabaseOtomatis();
  Logger.log(res);
}

function testDoGet() {
  var result = doGet({});
  Logger.log(result.getContent());
}
