/**
 * admin-data.js - Module manajemen data produk via localStorage
 * Bigboz Store Admin Panel
 * Data produk disimpan di localStorage agar bisa diakses oleh halaman utama
 */

const BigbozAdmin = {
  STORAGE_KEY: 'bbz_admin_produk',
  SESSION_KEY: 'bbz_admin_session',
  PASS_KEY: 'bbz_admin_pass',
  DEFAULT_PASS: 'bigboz2024', // Password default, bisa diubah dari admin

  // ── Autentikasi ──────────────────────────────────────────────────

  cekLogin() {
    return sessionStorage.getItem(this.SESSION_KEY) === 'true';
  },

  login(password) {
    const passHash = localStorage.getItem(this.PASS_KEY) || this.hashSimple(this.DEFAULT_PASS);
    if (this.hashSimple(password) === passHash) {
      sessionStorage.setItem(this.SESSION_KEY, 'true');
      return true;
    }
    return false;
  },

  logout() {
    sessionStorage.removeItem(this.SESSION_KEY);
  },

  ubahPassword(passBaru) {
    localStorage.setItem(this.PASS_KEY, this.hashSimple(passBaru));
  },

  // Hash sederhana (bukan untuk keamanan tinggi, hanya prevent casual)
  hashSimple(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return String(hash);
  },

  // ── CRUD Produk ──────────────────────────────────────────────────

  getProduk() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },

  simpanProduk(daftarProduk) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(daftarProduk));
  },

  getProdukById(id) {
    const semua = this.getProduk() || [];
    return semua.find(p => p.id === id) || null;
  },

  tambahProduk(dataProduk) {
    const semua = this.getProduk() || [];
    const idBaru = String(Date.now());
    const produkBaru = { ...dataProduk, id: idBaru };
    semua.push(produkBaru);
    this.simpanProduk(semua);
    return produkBaru;
  },

  updateProduk(id, dataBaru) {
    const semua = this.getProduk() || [];
    const idx = semua.findIndex(p => p.id === id);
    if (idx === -1) return false;
    semua[idx] = { ...semua[idx], ...dataBaru, id };
    this.simpanProduk(semua);
    return true;
  },

  hapusProduk(id) {
    const semua = this.getProduk() || [];
    const filtered = semua.filter(p => p.id !== id);
    this.simpanProduk(filtered);
  },

  // Toggle status stok: set stok ke 0 (habis) atau 999 (ready)
  toggleStok(id) {
    const produk = this.getProdukById(id);
    if (!produk) return;
    const stokBaru = Number(produk.stok) === 0 ? 999 : 0;
    this.updateProduk(id, { stok: stokBaru });
    return stokBaru;
  },

  // Export produk sebagai JSON untuk backup
  exportJSON() {
    const semua = this.getProduk() || [];
    const blob = new Blob([JSON.stringify(semua, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bigboz-produk-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // Import produk dari JSON
  importJSON(jsonStr) {
    const data = JSON.parse(jsonStr);
    if (!Array.isArray(data)) throw new Error('Format JSON tidak valid');
    this.simpanProduk(data);
    return data.length;
  },

  // Inisialisasi data default dari api.js jika belum ada
  inisialisasi(defaultProducts) {
    if (!this.getProduk()) {
      this.simpanProduk(defaultProducts);
    }
  },
};

window.BigbozAdmin = BigbozAdmin;
