/**
 * checkout.js - Modul halaman instruksi pembayaran (Langkah 3 & 4)
 * Bigboz Store - Tampilan konfirmasi pesanan dan instruksi bayar
 */

const Checkout = {

  /**
   * Tampilkan halaman instruksi pembayaran
   * @param {Object} pesanan - Data pesanan lengkap
   */
  tampilkanInstruksiBayar(pesanan) {
    const halaman = document.getElementById('halaman-instruksi');
    const halamanBeranda = document.getElementById('halaman-beranda');

    if (!halaman || !halamanBeranda) return;

    // Sembunyikan beranda, tampilkan halaman instruksi
    halamanBeranda.classList.add('hidden');
    halaman.classList.remove('hidden');

    // Scroll ke atas
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Render konten instruksi
    this.renderKontenInstruksi(pesanan, halaman);
  },

  /**
   * Render konten halaman instruksi bayar
   */
  renderKontenInstruksi(pesanan, container) {
    const {
      orderId,
      nama,
      wa,
      produk,
      varian,
      target,
      total,
      metode,
      demo,
    } = pesanan;

    const totalStr = total > 0 ? Utils.formatRupiah(total) : 'Sesuai Kesepakatan Admin';

    // Build target string untuk tampilan
    const targetHTML = Array.isArray(target)
      ? target.map(t => `
          <div class="flex justify-between text-sm">
            <span class="text-slate-400">${Utils.escapeHTML(t.label)}</span>
            <span class="text-white font-medium">${Utils.escapeHTML(t.nilai)}</span>
          </div>
        `).join('')
      : `<div class="flex justify-between text-sm"><span class="text-slate-400">Target</span><span class="text-white">${Utils.escapeHTML(target)}</span></div>`;

    // Instruksi bayar sesuai metode
    const instruksiBayarHTML = this.renderInstruksiBayar(metode, total);

    // Build URL WhatsApp
    const urlWA = Utils.buatPesanWA({
      ...pesanan,
      adminWA: window.BIGBOZ_CONFIG?.WA_ADMIN,
    });

    // Demo mode notice
    const demoBannerHTML = demo ? `
      <div class="bg-blue-900/50 border border-blue-500/50 rounded-xl p-3 mb-4">
        <p class="text-blue-300 text-xs text-center">
          ℹ️ <strong>Mode Demo</strong> — API belum terhubung. Pesanan tidak tersimpan ke server, tapi kamu bisa coba alur WhatsApp.
        </p>
      </div>
    ` : '';

    container.innerHTML = `
      <!-- Header dengan tombol kembali -->
      <div class="sticky top-0 z-20 bg-slate-900 border-b border-slate-700 px-4 py-3">
        <div class="flex items-center gap-3 max-w-lg mx-auto">
          <button id="btn-kembali-beranda" class="text-slate-400 hover:text-white p-1" aria-label="Kembali ke beranda">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <div class="flex-1">
            <h1 class="text-white font-bold text-base">Instruksi Pembayaran</h1>
            <p class="text-slate-400 text-xs">Selesaikan pembayaran kamu</p>
          </div>
        </div>
        <!-- Progress indicator -->
        <div class="mt-3 max-w-lg mx-auto">
          ${this.renderProgressBar(3, 4)}
        </div>
      </div>

      <div class="max-w-lg mx-auto px-4 py-5 space-y-5">

        ${demoBannerHTML}

        <!-- Order ID -->
        <div class="bg-slate-800 border border-orange-500/30 rounded-2xl p-4 text-center">
          <p class="text-slate-400 text-sm mb-1">Nomor Pesanan Kamu</p>
          <p class="text-2xl font-extrabold text-orange-400 tracking-wider">${Utils.escapeHTML(orderId)}</p>
          <button
            class="mt-2 text-xs px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors inline-flex items-center gap-1"
            id="btn-salin-order-id"
            data-salin="${Utils.escapeHTML(orderId)}"
          >
            📋 Salin Order ID
          </button>
          <p class="text-slate-500 text-xs mt-2">Simpan nomor ini untuk konfirmasi ke admin</p>
        </div>

        <!-- Total Bayar -->
        <div class="bg-slate-800 rounded-2xl p-4 text-center">
          <p class="text-slate-400 text-sm">Total Yang Harus Dibayar</p>
          <p class="text-4xl font-extrabold text-white mt-1">${totalStr}</p>
          <p class="text-orange-400 text-sm mt-1">via ${Utils.escapeHTML(metode)}</p>
          ${total > 0 ? `
          <button
            class="mt-2 text-xs px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors inline-flex items-center gap-1"
            data-salin="${total}"
            id="btn-salin-total"
          >
            📋 Salin Nominal
          </button>` : ''}
        </div>

        <!-- Instruksi Pembayaran -->
        <div class="bg-slate-800 rounded-2xl p-4">
          <h2 class="text-white font-semibold mb-3">📌 Cara Bayar via ${Utils.escapeHTML(metode)}</h2>
          ${instruksiBayarHTML}
        </div>

        <!-- Detail Pesanan -->
        <div class="bg-slate-800 rounded-2xl p-4">
          <h2 class="text-white font-semibold mb-3">🧾 Detail Pesanan</h2>
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-slate-400">Nama</span>
              <span class="text-white">${Utils.escapeHTML(nama)}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-400">WhatsApp</span>
              <span class="text-white">${Utils.escapeHTML(wa)}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-400">Produk</span>
              <span class="text-white font-medium">${Utils.escapeHTML(produk)}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-400">Varian</span>
              <span class="text-white">${Utils.escapeHTML(varian)}</span>
            </div>
            <div class="border-t border-slate-700 pt-2">
              ${targetHTML}
            </div>
          </div>
        </div>

        <!-- Tombol Kirim Bukti WA (CTA utama) -->
        <a
          href="${urlWA}"
          target="_blank"
          rel="noopener noreferrer"
          class="block w-full bg-green-500 hover:bg-green-400 active:bg-green-600 text-white font-bold text-lg py-5 rounded-2xl text-center transition-colors duration-150 shadow-lg shadow-green-500/30"
          id="btn-kirim-bukti-wa"
        >
          <span class="text-2xl">💬</span><br>
          Saya Sudah Bayar →<br>
          <span class="text-sm font-normal opacity-90">Kirim Bukti ke WhatsApp</span>
        </a>

        <p class="text-slate-500 text-xs text-center -mt-2 pb-2">
          ⏱️ Pesanan diproses setelah bukti bayar diterima admin.<br>
          Jam operasional: 08.00 – 22.00 WIB
        </p>

        <!-- Tombol Pesan Lagi -->
        <button
          id="btn-pesan-lagi"
          class="w-full border border-slate-600 hover:border-slate-400 text-slate-300 font-medium py-3 rounded-xl transition-colors duration-150 text-sm"
        >
          ← Kembali ke Katalog
        </button>

      </div>
    `;

    // Event listeners
    document.getElementById('btn-kembali-beranda')?.addEventListener('click', () => this.kembaliKeBeranda());
    document.getElementById('btn-pesan-lagi')?.addEventListener('click', () => this.kembaliKeBeranda());

    // Tombol salin
    container.querySelectorAll('[data-salin]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const teks = btn.dataset.salin;
        await Utils.salinKlipboard(teks);
        const asli = btn.innerHTML;
        btn.innerHTML = '✅ Disalin!';
        setTimeout(() => btn.innerHTML = asli, 2000);
      });
    });
  },

  /**
   * Render instruksi bayar sesuai metode
   */
  renderInstruksiBayar(metode, total) {
    const dana = window.BIGBOZ_CONFIG?.DANA_NUMBER || '081234567890';
    const namaDANA = window.BIGBOZ_CONFIG?.DANA_NAME || 'Admin Bigboz';
    const totalStr = Utils.formatRupiah(total);
    const qrisImg = window.BIGBOZ_CONFIG?.QRIS_IMAGE || 'assets/img/qris.png';

    if (metode === 'DANA') {
      return `
        <div class="space-y-3">
          <div class="flex gap-3 items-start">
            <div class="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
            <p class="text-slate-300 text-sm">Buka aplikasi <strong class="text-white">DANA</strong> di HP kamu</p>
          </div>
          <div class="flex gap-3 items-start">
            <div class="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
            <div>
              <p class="text-slate-300 text-sm">Pilih menu <strong class="text-white">Kirim Uang</strong>, masukkan nomor:</p>
              <div class="flex items-center justify-between mt-2 bg-slate-900 rounded-xl p-3">
                <div>
                  <p class="text-white font-bold text-xl">${Utils.escapeHTML(dana)}</p>
                  <p class="text-slate-400 text-sm">a.n. ${Utils.escapeHTML(namaDANA)}</p>
                </div>
                <button class="btn-salin-inline text-xs px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg" data-salin="${Utils.escapeHTML(dana)}">
                  📋 Salin
                </button>
              </div>
            </div>
          </div>
          <div class="flex gap-3 items-start">
            <div class="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
            <div>
              <p class="text-slate-300 text-sm">Masukkan nominal <strong class="text-white">PERSIS</strong>:</p>
              ${total > 0 ? `
              <div class="flex items-center justify-between mt-2 bg-slate-900 rounded-xl p-3">
                <p class="text-orange-400 font-bold text-xl">${totalStr}</p>
                <button class="btn-salin-inline text-xs px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg" data-salin="${total}">
                  📋 Salin
                </button>
              </div>` : '<p class="text-slate-400 text-sm mt-1">Sesuai kesepakatan dengan admin</p>'}
            </div>
          </div>
          <div class="flex gap-3 items-start">
            <div class="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
            <p class="text-slate-300 text-sm">Klik bayar, <strong class="text-white">screenshot bukti pembayaran</strong>, lalu klik tombol kirim ke WhatsApp di bawah</p>
          </div>
        </div>
      `;
    }

    // QRIS
    return `
      <div class="space-y-3">
        <div class="bg-white rounded-2xl p-4 text-center">
          <img
            src="${qrisImg}"
            alt="QRIS Bigboz Store"
            class="w-52 h-52 mx-auto object-contain"
            onerror="this.parentElement.innerHTML='<p class=\\'text-gray-500 text-sm p-4\\'>Gambar QRIS belum tersedia.<br>Hubungi admin untuk QRIS.</p>'"
          />
          <p class="text-gray-500 text-xs mt-2">Scan dengan GoPay, OVO, LinkAja, ShopeePay, atau banking app</p>
        </div>
        <div class="space-y-3 mt-3">
          <div class="flex gap-3 items-start">
            <div class="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
            <p class="text-slate-300 text-sm">Buka aplikasi e-wallet atau m-banking kamu</p>
          </div>
          <div class="flex gap-3 items-start">
            <div class="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
            <p class="text-slate-300 text-sm">Pilih menu <strong class="text-white">Scan QR / QRIS</strong></p>
          </div>
          <div class="flex gap-3 items-start">
            <div class="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
            <div>
              <p class="text-slate-300 text-sm">Masukkan nominal <strong class="text-white">PERSIS</strong>:</p>
              ${total > 0 ? `
              <div class="flex items-center justify-between mt-2 bg-slate-900 rounded-xl p-3">
                <p class="text-orange-400 font-bold text-xl">${totalStr}</p>
                <button class="btn-salin-inline text-xs px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg" data-salin="${total}">
                  📋 Salin
                </button>
              </div>` : '<p class="text-slate-400 text-sm mt-1">Sesuai kesepakatan dengan admin</p>'}
            </div>
          </div>
          <div class="flex gap-3 items-start">
            <div class="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
            <p class="text-slate-300 text-sm"><strong class="text-white">Screenshot bukti pembayaran</strong>, lalu klik tombol kirim ke WhatsApp di bawah</p>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Render progress bar langkah
   */
  renderProgressBar(langkahSaat, totalLangkah) {
    const langkah = ['Pilih Produk', 'Isi Data', 'Bayar', 'Kirim Bukti'];
    return `
      <div class="flex items-center gap-1">
        ${langkah.map((label, i) => {
      const n = i + 1;
      const aktif = n === langkahSaat;
      const selesai = n < langkahSaat;
      return `
            <div class="flex-1 flex flex-col items-center gap-1">
              <div class="w-full h-1.5 rounded-full ${selesai ? 'bg-orange-500' : aktif ? 'bg-orange-400' : 'bg-slate-700'}"></div>
              <span class="text-xs ${aktif ? 'text-orange-400 font-semibold' : selesai ? 'text-orange-500' : 'text-slate-600'} hidden sm:block">${label}</span>
            </div>
            ${n < totalLangkah ? '' : ''}
          `;
    }).join('')}
      </div>
      <p class="text-slate-400 text-xs mt-1 text-center">Langkah ${langkahSaat} dari ${totalLangkah}: <span class="text-orange-400 font-medium">${langkah[langkahSaat - 1]}</span></p>
    `;
  },

  /**
   * Kembali ke beranda
   */
  kembaliKeBeranda() {
    const halaman = document.getElementById('halaman-instruksi');
    const halamanBeranda = document.getElementById('halaman-beranda');

    halaman?.classList.add('hidden');
    halamanBeranda?.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
};

window.Checkout = Checkout;
