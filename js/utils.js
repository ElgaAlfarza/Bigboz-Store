/**
 * utils.js - Fungsi-fungsi pembantu (utility)
 * Bigboz Store - Validasi, format, dan helper umum
 */

const Utils = {

  /**
   * Format angka ke format Rupiah Indonesia
   * @param {number} angka - Nilai angka
   * @returns {string} String format "Rp 30.000"
   */
  formatRupiah(angka) {
    if (!angka || angka === 0) return 'Hubungi Admin';
    return 'Rp ' + Number(angka).toLocaleString('id-ID');
  },

  /**
   * Validasi nomor WhatsApp Indonesia
   * Format valid: 08xx, 62xx, +62xx
   * @param {string} nomor - Nomor yang divalidasi
   * @returns {boolean}
   */
  validasiWA(nomor) {
    const bersih = nomor.replace(/[\s\-()]/g, '');
    // Pola: 08xx (10-13 digit) atau 62xx (11-14 digit) atau +62xx
    const pola = /^(\+?62|0)8[0-9]{8,11}$/;
    return pola.test(bersih);
  },

  /**
   * Normalisasi nomor WA ke format 62xxx (tanpa +)
   * @param {string} nomor
   * @returns {string}
   */
  normalisasiWA(nomor) {
    let bersih = nomor.replace(/[\s\-()]/g, '');
    if (bersih.startsWith('+62')) return bersih.slice(1);
    if (bersih.startsWith('62')) return bersih;
    if (bersih.startsWith('08')) return '62' + bersih.slice(1);
    return bersih;
  },

  /**
   * Validasi field tidak boleh kosong
   * @param {string} nilai
   * @returns {boolean}
   */
  tidakKosong(nilai) {
    return nilai !== null && nilai !== undefined && nilai.trim().length > 0;
  },

  /**
   * Validasi nomor meter PLN (11-13 digit angka)
   * @param {string} nomor
   * @returns {boolean}
   */
  validasiMeterPLN(nomor) {
    return /^[0-9]{11,13}$/.test(nomor.trim());
  },

  /**
   * Salin teks ke clipboard
   * @param {string} teks - Teks yang disalin
   * @returns {Promise<boolean>}
   */
  async salinKlipboard(teks) {
    try {
      await navigator.clipboard.writeText(teks);
      return true;
    } catch {
      // Fallback untuk browser lama
      const ta = document.createElement('textarea');
      ta.value = teks;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      return true;
    }
  },

  /**
   * Tampilkan notifikasi toast sementara
   * @param {string} pesan - Pesan yang ditampilkan
   * @param {string} tipe - 'sukses' | 'error' | 'info'
   * @param {number} durasi - Durasi tampil dalam ms
   */
  toast(pesan, tipe = 'info', durasi = 3000) {
    // Hapus toast lama jika ada
    const toastLama = document.getElementById('bbz-toast');
    if (toastLama) toastLama.remove();

    const warna = {
      sukses: 'bg-green-600',
      error: 'bg-red-600',
      info: 'bg-blue-600',
    }[tipe] || 'bg-gray-700';

    const ikon = {
      sukses: '✅',
      error: '❌',
      info: 'ℹ️',
    }[tipe] || '💬';

    const toast = document.createElement('div');
    toast.id = 'bbz-toast';
    toast.className = `fixed top-4 left-1/2 -translate-x-1/2 z-[9999] ${warna} text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 max-w-xs text-center transition-all duration-300`;
    toast.innerHTML = `<span>${ikon}</span><span>${pesan}</span>`;
    document.body.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, durasi);
  },

  /**
   * Simpan data ke localStorage dengan key prefix 'bbz_'
   * @param {string} kunci
   * @param {*} nilai
   */
  simpanLokal(kunci, nilai) {
    try {
      localStorage.setItem(`bbz_${kunci}`, JSON.stringify(nilai));
    } catch (e) {
      console.warn('Gagal menyimpan ke localStorage:', e);
    }
  },

  /**
   * Ambil data dari localStorage
   * @param {string} kunci
   * @returns {*} Data atau null jika tidak ada
   */
  ambilLokal(kunci) {
    try {
      const raw = localStorage.getItem(`bbz_${kunci}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  /**
   * Hapus data dari localStorage
   * @param {string} kunci
   */
  hapusLokal(kunci) {
    localStorage.removeItem(`bbz_${kunci}`);
  },

  /**
   * Debounce function - tunda eksekusi hingga jeda ketik
   * @param {Function} fn - Fungsi yang didebounce
   * @param {number} jeda - Jeda dalam ms
   * @returns {Function}
   */
  debounce(fn, jeda = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), jeda);
    };
  },

  /**
   * Escape HTML untuk mencegah XSS
   * @param {string} str
   * @returns {string}
   */
  escapeHTML(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  },

  /**
   * Buat pesan WhatsApp otomatis dari data pesanan
   * @param {Object} pesanan - Data lengkap pesanan
   * @returns {string} URL wa.me dengan pesan terenkode
   */
  buatPesanWA(pesanan) {
    const {
      orderId,
      nama,
      wa,
      produk,
      varian,
      target,
      total,
      metode,
      adminWA,
    } = pesanan;

    const totalStr = this.formatRupiah(total);
    const targetStr = Array.isArray(target)
      ? target.map((t) => `  • ${t.label}: ${t.nilai}`).join('\n')
      : `  • ${target}`;

    const pesan = `Halo Admin Bigboz Store! 👋

Saya ingin konfirmasi pembayaran pesanan saya:

🧾 *Order ID:* ${orderId}
👤 *Nama:* ${nama}
📱 *WhatsApp:* ${wa}

🛍️ *Produk:* ${produk} - ${varian}
🎯 *Data Target:*
${targetStr}

💰 *Total Bayar:* ${totalStr}
💳 *Metode Bayar:* ${metode}

Berikut bukti pembayaran saya 👇
_(lampirkan screenshot bukti transfer/QRIS)_

Terima kasih! 🙏`;

    const nomor = adminWA || window.BIGBOZ_CONFIG?.WA_ADMIN || '6281234567890';
    return `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;
  },

  /**
   * Scroll halus ke elemen
   * @param {string|Element} target - Selector CSS atau elemen
   */
  scrollKe(target) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  },
};

window.Utils = Utils;
