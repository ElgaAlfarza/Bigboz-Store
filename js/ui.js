/**
 * ui.js - Modul tampilan BARU (layout bergaya app pulsa profesional)
 * Bigboz Store
 * Alur: Beranda → Halaman Kategori (list) → Halaman Varian (grid harga) → Form → Bayar
 */

const UI = {

  // ================================================================
  // STATE NAVIGASI
  // ================================================================
  state: {
    semuaProduk: [],
    halamanAktif: 'beranda',    // beranda | kategori | varian | checkout
    kategoriDipilih: null,       // nama kategori yang sedang dibuka
    produkDipilih: null,         // produk (nama produk unik) yang dibuka
    varianDipilih: null,         // varian/produk spesifik yang dipilih
    cariQuery: '',
  },

  // ================================================================
  // INIT
  // ================================================================
  async init() {
    this.tampilkanSkeletonBeranda();
    try {
      const produk = await window.BigbozAPI.fetchProducts();
      this.state.semuaProduk = produk;
    } catch {
      this.state.semuaProduk = [];
    }
    this.renderBeranda();
    this.initBottomNav();
    this.cekPesananTersimpan();

    // Handle back button browser
    window.addEventListener('popstate', () => this.handleBack());
  },

  // ================================================================
  // NAVIGASI ANTAR HALAMAN
  // ================================================================

  navigasi(halaman, data = {}) {
    this.state.halamanAktif = halaman;
    const kontainer = document.getElementById('app-kontainer');

    // Animasi transisi
    kontainer.style.opacity = '0';
    kontainer.style.transform = 'translateY(8px)';

    setTimeout(() => {
      switch (halaman) {
        case 'beranda':
          this.renderBeranda();
          break;
        case 'kategori':
          this.state.kategoriDipilih = data.kategori;
          this.renderHalamanKategori(data.kategori);
          break;
        case 'varian':
          this.state.produkDipilih = data.namaProduk;
          this.state.kategoriDipilih = data.kategori;
          this.renderHalamanVarian(data.namaProduk, data.kategori);
          break;
        case 'checkout':
          break;
      }
      kontainer.style.opacity = '1';
      kontainer.style.transform = 'translateY(0)';
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 120);
  },

  handleBack() {
    if (this.state.halamanAktif === 'varian') {
      this.navigasi('kategori', { kategori: this.state.kategoriDipilih });
    } else if (this.state.halamanAktif === 'kategori') {
      this.navigasi('beranda');
    } else {
      this.navigasi('beranda');
    }
  },

  // ================================================================
  // HALAMAN 1: BERANDA
  // Layout: Header + Banner + Kategori Pill + Seksi Icon Grid
  // ================================================================

  renderBeranda() {
    const produk = this.state.semuaProduk;
    const kategoris = [...new Set(produk.map(p => p.kategori))];

    // Emoji ikon untuk setiap kategori
    const ikonKat = {
      'Akun Premium': '👑',
      'Top Up Game': '🎮',
      'PPOB': '⚡',
      'Paket Data': '🌐',
      'Jasa Digital': '💼',
    };

    // Nama produk unik per kategori (untuk icon grid)
    const seksiHTML = kategoris.map(kat => {
      const produkKat = produk.filter(p => p.kategori === kat);
      // Ambil produk unik berdasarkan nama (satu ikon = satu nama produk)
      const namaunik = [...new Map(produkKat.map(p => [p.nama, p])).values()];

      const ikonHTML = namaunik.map(p => `
        <button
          class="flex flex-col items-center gap-1.5 group"
          onclick="UI.navigasi('varian', {namaProduk: '${Utils.escapeHTML(p.nama)}', kategori: '${Utils.escapeHTML(kat)}'})"
          aria-label="${Utils.escapeHTML(p.nama)}"
        >
          <div class="w-16 h-16 rounded-2xl overflow-hidden border-2 border-slate-700 group-hover:border-orange-500 transition-all duration-150 bg-slate-800 relative flex-shrink-0">
            <img
              src="${Utils.escapeHTML(p.gambar || 'assets/img/prod_default.svg')}"
              alt="${Utils.escapeHTML(p.nama)}"
              class="w-full h-full object-cover"
              loading="lazy"
              onerror="this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 64 64\\'><rect width=\\'64\\' height=\\'64\\' fill=\\'%231e293b\\'/><text x=\\'32\\' y=\\'42\\' text-anchor=\\'middle\\' font-size=\\'28\\'>🎮</text></svg>'"
            />
            ${Number(p.stok) === 0 ? '<div class="absolute inset-0 bg-black/60 flex items-center justify-center"><span class="text-xs text-red-400 font-bold">HABIS</span></div>' : ''}
          </div>
          <span class="text-slate-300 text-xs text-center leading-tight max-w-[68px] group-hover:text-orange-400 transition-colors">${Utils.escapeHTML(p.nama)}</span>
        </button>
      `).join('');

      return `
        <section class="px-4 mb-2">
          <div class="bg-slate-800 border border-slate-700/60 rounded-2xl overflow-hidden">
            <!-- Judul Seksi -->
            <button
              class="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-700/40 transition-colors"
              onclick="UI.navigasi('kategori', {kategori: '${Utils.escapeHTML(kat)}'})"
            >
              <div class="flex items-center gap-2">
                <span class="text-lg">${ikonKat[kat] || '📦'}</span>
                <span class="text-white font-bold text-sm">${Utils.escapeHTML(kat)}</span>
                <span class="text-slate-500 text-xs">(${produkKat.length} produk)</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
            <!-- Grid Ikon -->
            <div class="px-4 pb-4 grid grid-cols-4 gap-3 border-t border-slate-700/40 pt-4">
              ${ikonHTML}
              ${namaunik.length > 0 ? `
              <button
                class="flex flex-col items-center gap-1.5"
                onclick="UI.navigasi('kategori', {kategori: '${Utils.escapeHTML(kat)}'})"
              >
                <div class="w-16 h-16 rounded-2xl border-2 border-dashed border-slate-600 flex items-center justify-center bg-slate-900/50 hover:border-orange-500 transition-colors">
                  <span class="text-slate-500 text-2xl">→</span>
                </div>
                <span class="text-slate-500 text-xs">Lainnya</span>
              </button>` : ''}
            </div>
          </div>
        </section>
      `;
    }).join('');

    document.getElementById('app-kontainer').innerHTML = `
      <!-- ── HEADER BERANDA ── -->
      <div class="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
        <div class="px-4 pt-4 pb-2 flex items-center justify-between">
          <div>
            <p class="text-slate-400 text-xs">Selamat datang di</p>
            <h1 class="text-xl font-extrabold text-white"><span class="text-orange-500">BIG</span>BOZ <span class="text-orange-500">STORE</span></h1>
          </div>
          <a href="admin.html" class="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs px-3 py-1.5 rounded-full hover:bg-orange-500/20 transition-colors">
            ⚙️ Admin
          </a>
        </div>

        <!-- Search Bar -->
        <div class="px-4 pb-3">
          <div class="relative">
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true">🔍</span>
            <input
              type="search"
              id="search-beranda"
              placeholder="Cari produk: Diamond, Token, Pulsa..."
              class="input-field pl-10 py-2.5 text-sm"
              aria-label="Cari produk"
              autocomplete="off"
            />
          </div>
        </div>
      </div>

      <!-- ── BANNER PROMO ── -->
      <div class="px-4 pt-4 pb-2">
        <div class="bg-gradient-to-r from-orange-600 to-orange-500 rounded-2xl p-4 relative overflow-hidden">
          <div class="relative z-10">
            <p class="text-orange-100 text-xs font-medium mb-1">🔥 Promo Spesial</p>
            <h2 class="text-white font-extrabold text-base leading-tight">Beli Digital Cepat,<br/>Aman & Langsung Diproses!</h2>
            <div class="flex gap-3 mt-3 text-xs text-orange-100">
              <span>⚡ Proses Cepat</span>
              <span>💳 DANA/QRIS</span>
              <span>💬 Fast Respon</span>
            </div>
          </div>
          <div class="absolute right-4 top-1/2 -translate-y-1/2 text-6xl opacity-20">🏪</div>
        </div>
      </div>

      <!-- ── KATEGORI PILL ── -->
      <div class="px-4 py-3 flex gap-2 overflow-x-auto" id="pills-kategori" style="scrollbar-width:none">
        <button class="pill-kat active flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold border border-orange-500 bg-orange-500 text-white" data-kat="Semua">Semua</button>
        ${kategoris.map(k => `
          <button class="pill-kat flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold border border-slate-600 bg-slate-800 text-slate-300 hover:border-orange-400 transition-colors whitespace-nowrap" data-kat="${Utils.escapeHTML(k)}">${Utils.escapeHTML(k)}</button>
        `).join('')}
      </div>

      <!-- ── SEKSI PRODUK (icon grid per kategori) ── -->
      <div id="kontainer-seksi" class="space-y-2 pb-24">
        ${seksiHTML}
      </div>
    `;

    // Event search
    document.getElementById('search-beranda')?.addEventListener('input', Utils.debounce((e) => {
      this.filterBeranda(e.target.value.trim());
    }, 300));

    // Event pill kategori
    document.querySelectorAll('.pill-kat').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.pill-kat').forEach(b => {
          b.className = b.className.replace('bg-orange-500 text-white border-orange-500', 'bg-slate-800 text-slate-300 border-slate-600');
        });
        btn.className = btn.className.replace('bg-slate-800 text-slate-300 border-slate-600', 'bg-orange-500 text-white border-orange-500');
        this.filterBeranda('', btn.dataset.kat);
      });
    });
  },

  filterBeranda(query = '', kat = null) {
    this.state.cariQuery = query;
    const qLower = query.toLowerCase();
    const produk = this.state.semuaProduk;

    // Kumpulkan semua nama produk unik yang cocok
    const seksiEl = document.getElementById('kontainer-seksi');
    if (!seksiEl) return;

    // Jika ada query pencarian, tampilkan list hasil
    if (query) {
      const hasil = produk.filter(p =>
        p.nama.toLowerCase().includes(qLower) ||
        p.kategori.toLowerCase().includes(qLower) ||
        p.varian.toLowerCase().includes(qLower)
      );
      seksiEl.innerHTML = hasil.length === 0
        ? `<div class="text-center py-12 text-slate-500">
            <div class="text-4xl mb-2">🔍</div>
            <p>Produk tidak ditemukan</p>
          </div>`
        : `<div class="px-4">
            <p class="text-slate-400 text-xs mb-3">Hasil pencarian "${Utils.escapeHTML(query)}" — ${hasil.length} produk</p>
            ${hasil.map(p => this.renderListItem(p)).join('')}
          </div>`;
      return;
    }

    // Filter per kategori
    if (kat && kat !== 'Semua') {
      this.navigasi('kategori', { kategori: kat });
    } else {
      this.renderBeranda();
    }
  },

  // ================================================================
  // HALAMAN 2: KATEGORI (list produk nama unik)
  // Layout: Header back + list item (foto bulat + nama + panah)
  // ================================================================

  renderHalamanKategori(kategori) {
    const produk = this.state.semuaProduk.filter(p => p.kategori === kategori);
    const namaunik = [...new Map(produk.map(p => [p.nama, p])).values()];

    const listHTML = namaunik.length === 0
      ? `<div class="text-center py-12 text-slate-500"><div class="text-4xl mb-2">📭</div><p>Belum ada produk</p></div>`
      : namaunik.map(p => this.renderListItem(p)).join('');

    document.getElementById('app-kontainer').innerHTML = `
      <!-- Header Kategori -->
      <div class="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 px-4 py-3 flex items-center gap-3">
        <button onclick="UI.navigasi('beranda')" class="text-slate-400 hover:text-white p-1 -ml-1 rounded-lg" aria-label="Kembali">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 class="text-white font-bold text-base flex-1">${Utils.escapeHTML(kategori)}</h1>
        <span class="text-slate-500 text-xs">${namaunik.length} produk</span>
      </div>

      <!-- Search dalam kategori -->
      <div class="px-4 pt-3 pb-2">
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
          <input type="search" id="search-kat" placeholder="Cari di ${Utils.escapeHTML(kategori)}..." class="input-field pl-9 py-2.5 text-sm" autocomplete="off"/>
        </div>
      </div>

      <!-- List Produk -->
      <div id="list-produk-kat" class="pb-24 divide-y divide-slate-800">
        ${listHTML}
      </div>
    `;

    // Search dalam kategori
    document.getElementById('search-kat')?.addEventListener('input', Utils.debounce((e) => {
      const q = e.target.value.trim().toLowerCase();
      const filtered = namaunik.filter(p => p.nama.toLowerCase().includes(q) || p.varian.toLowerCase().includes(q));
      document.getElementById('list-produk-kat').innerHTML =
        filtered.length === 0
          ? `<div class="text-center py-8 text-slate-500">Tidak ditemukan</div>`
          : filtered.map(p => this.renderListItem(p)).join('');
    }, 300));
  },

  /**
   * Render satu item list (foto bulat + nama + panah)
   */
  renderListItem(produk) {
    const stokHabis = Number(produk.stok) === 0;
    // Hitung jumlah varian
    const jumlahVarian = this.state.semuaProduk.filter(p => p.nama === produk.nama).length;
    const hargaMin = Math.min(...this.state.semuaProduk.filter(p => p.nama === produk.nama).map(p => p.harga).filter(h => h > 0));

    return `
      <button
        class="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800/60 transition-colors text-left ${stokHabis ? 'opacity-60' : ''}"
        onclick="${stokHabis ? '' : `UI.navigasi('varian', {namaProduk: '${Utils.escapeHTML(produk.nama)}', kategori: '${Utils.escapeHTML(produk.kategori)}'})`}"
        ${stokHabis ? 'disabled' : ''}
      >
        <!-- Foto Bulat -->
        <div class="relative flex-shrink-0">
          <div class="w-12 h-12 rounded-full overflow-hidden border-2 ${stokHabis ? 'border-slate-700' : 'border-orange-500/40'} bg-slate-800">
            <img
              src="${Utils.escapeHTML(produk.gambar || '')}"
              alt="${Utils.escapeHTML(produk.nama)}"
              class="w-full h-full object-cover ${stokHabis ? 'grayscale' : ''}"
              loading="lazy"
              onerror="this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 48 48\\'><rect width=\\'48\\' height=\\'48\\' rx=\\'24\\' fill=\\'%231e293b\\'/><text x=\\'24\\' y=\\'32\\' text-anchor=\\'middle\\' font-size=\\'22\\'>🎮</text></svg>'"
            />
          </div>
          ${stokHabis ? '<div class="absolute -bottom-0.5 -right-0.5 bg-red-600 rounded-full w-4 h-4 flex items-center justify-center"><span class="text-white text-xs font-bold">!</span></div>' : ''}
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <p class="text-white font-semibold text-sm truncate">${Utils.escapeHTML(produk.nama)}</p>
          <div class="flex items-center gap-2 mt-0.5">
            ${stokHabis
              ? '<span class="text-red-400 text-xs">❌ Stok habis</span>'
              : `<span class="text-orange-400 text-xs font-medium">${hargaMin > 0 ? 'Mulai ' + Utils.formatRupiah(hargaMin) : 'Hubungi Admin'}</span>`
            }
            ${produk.badge ? `<span class="text-xs ${produk.badge === 'Terlaris' ? 'text-orange-400' : 'text-green-400'}">${produk.badge === 'Terlaris' ? '🔥' : '✨'} ${produk.badge}</span>` : ''}
          </div>
          <p class="text-slate-500 text-xs">${jumlahVarian} pilihan nominal</p>
        </div>

        <!-- Panah -->
        ${!stokHabis ? `
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-slate-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>` : ''}
      </button>
    `;
  },

  // ================================================================
  // HALAMAN 3: VARIAN (grid 2 kolom kartu harga)
  // ================================================================

  renderHalamanVarian(namaProduk, kategori) {
    const semuaVarian = this.state.semuaProduk.filter(p => p.nama === namaProduk);
    if (semuaVarian.length === 0) { this.navigasi('kategori', { kategori }); return; }
    const contoh = semuaVarian[0];

    // Langkah-langkah cara pakai
    const langkahArr = (contoh.langkah_pakai || '').split('|').filter(Boolean);
    const stepperHTML = langkahArr.map((l, i) => `
      <div class="flex gap-3 items-start">
        <div class="w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">${i + 1}</div>
        <p class="text-slate-300 text-sm leading-relaxed">${Utils.escapeHTML(l)}</p>
      </div>
    `).join('');

    document.getElementById('app-kontainer').innerHTML = `
      <!-- Header Varian -->
      <div class="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
        <div class="px-4 py-3 flex items-center gap-3">
          <button onclick="UI.navigasi('kategori', {kategori: '${Utils.escapeHTML(kategori)}'})" class="text-slate-400 hover:text-white p-1 -ml-1 rounded-lg" aria-label="Kembali">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <div class="flex items-center gap-2 flex-1">
            <img src="${Utils.escapeHTML(contoh.gambar || '')}" alt="" class="w-8 h-8 rounded-lg object-cover bg-slate-800 border border-slate-700"
              onerror="this.style.display='none'"/>
            <div>
              <h1 class="text-white font-bold text-base leading-tight">${Utils.escapeHTML(namaProduk)}</h1>
              <p class="text-slate-400 text-xs">${Utils.escapeHTML(kategori)}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="pb-24">

        <!-- Deskripsi singkat -->
        <div class="px-4 pt-4 pb-2">
          <p class="text-slate-400 text-sm">${Utils.escapeHTML(contoh.deskripsi || '')}</p>
        </div>

        <!-- Cara Menggunakan -->
        <div class="mx-4 mb-4 bg-slate-800 border border-slate-700 rounded-2xl p-4">
          <h2 class="text-white font-semibold text-sm mb-3 flex items-center gap-2">📋 Cara Menggunakan</h2>
          <div class="space-y-2.5">${stepperHTML}</div>
          <div class="mt-3 pt-3 border-t border-slate-700">
            <p class="text-slate-500 text-xs font-semibold mb-1">⚠️ Catatan Penting:</p>
            <ul class="text-slate-500 text-xs space-y-0.5">
              <li>• Pastikan data yang diisi sudah benar sebelum bayar</li>
              <li>• Proses setelah bukti bayar diterima admin (08.00–22.00)</li>
              <li>• Tidak ada refund jika salah input dari pembeli</li>
            </ul>
          </div>
        </div>

        <!-- Pilih Nominal/Varian -->
        <div class="px-4 mb-4">
          <h2 class="text-white font-semibold text-sm mb-3">💎 Pilih Nominal</h2>
          <div id="grid-varian" class="grid grid-cols-2 gap-3">
            ${semuaVarian.map(v => {
              const habis = Number(v.stok) === 0;
              const harga = v.harga > 0 ? Utils.formatRupiah(v.harga) : 'Via Admin';
              return `
                <button
                  class="kartu-varian text-left p-3 rounded-xl border-2 transition-all duration-150 ${habis ? 'border-slate-700 bg-slate-800/50 opacity-50 cursor-not-allowed' : 'border-slate-700 bg-slate-800 hover:border-orange-500 hover:bg-orange-500/5 active:scale-95'}"
                  data-id="${v.id}"
                  ${habis ? 'disabled' : ''}
                  onclick="${habis ? '' : `UI.pilihVarian('${v.id}')`}"
                >
                  <p class="text-white font-semibold text-sm leading-tight">${Utils.escapeHTML(v.varian)}</p>
                  <p class="text-orange-400 font-bold text-base mt-1">${harga}</p>
                  ${habis ? '<p class="text-red-400 text-xs mt-0.5">Stok habis</p>' : ''}
                  ${v.badge ? `<span class="inline-block mt-1 text-xs bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded-full">${v.badge}</span>` : ''}
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <p class="text-center text-slate-600 text-xs px-4">Pilih nominal di atas untuk melanjutkan pembelian</p>

      </div>
    `;
  },

  /**
   * Pilih varian dan buka form pembelian
   */
  pilihVarian(varianId) {
    const varian = this.state.semuaProduk.find(p => p.id === varianId);
    if (!varian) return;
    this.state.varianDipilih = varian;

    // Tandai varian aktif
    document.querySelectorAll('.kartu-varian').forEach(btn => {
      const aktif = btn.dataset.id === varianId;
      btn.className = btn.className.replace(
        aktif ? 'border-slate-700 bg-slate-800' : 'border-orange-500 bg-orange-500/10',
        aktif ? 'border-orange-500 bg-orange-500/10' : 'border-slate-700 bg-slate-800'
      );
    });

    // Buka modal form setelah 100ms
    setTimeout(() => this.bukaModalForm(varian), 150);
  },

  // ================================================================
  // MODAL FORM PEMBELIAN (Langkah 3: isi data & bayar)
  // ================================================================

  bukaModalForm(varian) {
    const modal = document.getElementById('modal-form');
    const konten = document.getElementById('modal-form-konten');
    if (!modal || !konten) return;

    const fieldsInput = (varian.field_input || '').split('|').filter(Boolean);
    const inputFieldsHTML = this.renderInputFields(fieldsInput);

    const danaNumber = window.BIGBOZ_CONFIG?.DANA_NUMBER || '081234567890';
    const danaName = window.BIGBOZ_CONFIG?.DANA_NAME || 'Admin Bigboz';
    const qrisImg = window.BIGBOZ_CONFIG?.QRIS_IMAGE || 'assets/img/qris.png';

    konten.innerHTML = `
      <!-- Handle drag (untuk mobile) -->
      <div class="flex justify-center pt-3 pb-1">
        <div class="w-10 h-1 bg-slate-600 rounded-full"></div>
      </div>

      <!-- Header -->
      <div class="px-5 pb-3 border-b border-slate-700 flex items-center justify-between">
        <div>
          <h2 class="text-white font-bold text-base">${Utils.escapeHTML(varian.nama)}</h2>
          <p class="text-orange-400 font-semibold">${varian.harga > 0 ? Utils.formatRupiah(varian.harga) : 'Via Admin'} <span class="text-slate-400 font-normal text-sm">— ${Utils.escapeHTML(varian.varian)}</span></p>
        </div>
        <button id="btn-tutup-modal" class="text-slate-400 hover:text-white p-1">✕</button>
      </div>

      <div class="px-5 py-4 space-y-4 overflow-y-auto max-h-[60vh]">

        <!-- Form Data -->
        <div>
          <h3 class="text-white font-semibold text-sm mb-3">📝 Data Pembeli</h3>
          <div class="space-y-3">
            <div>
              <label class="label-form" for="f-nama">Nama Lengkap <span class="text-red-400">*</span></label>
              <input type="text" id="f-nama" class="input-field" placeholder="Nama kamu" autocomplete="name" maxlength="60"/>
              <p class="pesan-error hidden" id="err-nama">Nama tidak boleh kosong</p>
            </div>
            <div>
              <label class="label-form" for="f-wa">Nomor WhatsApp <span class="text-red-400">*</span></label>
              <input type="tel" id="f-wa" class="input-field" placeholder="08xxxxxxxxx" autocomplete="tel" maxlength="15" inputmode="tel"/>
              <p class="pesan-error hidden" id="err-wa">Format nomor WA tidak valid</p>
            </div>
            ${inputFieldsHTML}
          </div>
        </div>

        <!-- Metode Bayar -->
        <div>
          <h3 class="text-white font-semibold text-sm mb-3">💳 Cara Bayar</h3>
          <div class="space-y-2" role="radiogroup">

            <!-- DANA -->
            <label class="radio-card block" id="card-dana">
              <input type="radio" name="metode" value="DANA" class="sr-only" checked id="radio-dana"/>
              <div class="flex items-center gap-3">
                <div class="radio-dot" id="dot-dana"></div>
                <div class="flex-1">
                  <p class="text-white font-semibold text-sm">💙 DANA</p>
                  <p class="text-slate-400 text-xs">Transfer ke nomor DANA admin</p>
                </div>
              </div>
              <div class="mt-2 bg-slate-900 rounded-xl p-3 border border-slate-700" id="detail-dana">
                <div class="flex justify-between items-center">
                  <div>
                    <p class="text-white font-bold">${Utils.escapeHTML(danaNumber)}</p>
                    <p class="text-slate-400 text-xs">a.n. ${Utils.escapeHTML(danaName)}</p>
                  </div>
                  <button type="button" class="text-xs px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg" data-salin="${Utils.escapeHTML(danaNumber)}">📋 Salin</button>
                </div>
              </div>
            </label>

            <!-- QRIS -->
            <label class="radio-card block" id="card-qris">
              <input type="radio" name="metode" value="QRIS" class="sr-only" id="radio-qris"/>
              <div class="flex items-center gap-3">
                <div class="radio-dot" id="dot-qris"></div>
                <div class="flex-1">
                  <p class="text-white font-semibold text-sm">📱 QRIS</p>
                  <p class="text-slate-400 text-xs">Scan QR — semua e-wallet & bank</p>
                </div>
              </div>
              <div class="mt-2 hidden text-center" id="detail-qris">
                <div class="bg-white rounded-xl p-3 inline-block">
                  <img src="${qrisImg}" alt="QRIS" class="w-40 h-40 object-contain"
                    onerror="this.parentElement.innerHTML='<p class=\\'text-gray-500 text-xs p-4\\'>QRIS belum tersedia</p>'"/>
                </div>
              </div>
            </label>

          </div>
        </div>

      </div>

      <!-- Tombol Lanjut Bayar (sticky bawah) -->
      <div class="px-5 py-4 border-t border-slate-700 bg-slate-900">
        <div class="flex justify-between text-sm mb-3">
          <span class="text-slate-400">Total Bayar</span>
          <span class="text-orange-400 font-bold text-base">${varian.harga > 0 ? Utils.formatRupiah(varian.harga) : 'Via Admin'}</span>
        </div>
        <button id="btn-lanjut-bayar" class="w-full bg-orange-500 hover:bg-orange-400 text-white font-bold py-4 rounded-2xl text-base transition-colors shadow-lg shadow-orange-500/20">
          Lanjut Bayar →
        </button>
        <p class="text-slate-600 text-xs text-center mt-2">🔒 Data aman • Diproses setelah bukti bayar</p>
      </div>
    `;

    modal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');

    // Events
    document.getElementById('btn-tutup-modal')?.addEventListener('click', () => this.tutupModal());
    modal.addEventListener('click', (e) => { if (e.target === modal) this.tutupModal(); });

    // Radio metode bayar
    ['dana', 'qris'].forEach(m => {
      document.getElementById(`radio-${m}`)?.addEventListener('change', () => {
        document.getElementById('detail-dana').classList.toggle('hidden', m !== 'dana');
        document.getElementById('detail-qris').classList.toggle('hidden', m !== 'qris');
        ['dana', 'qris'].forEach(x => {
          document.getElementById(`card-${x}`)?.classList.toggle('border-orange-500', x === m);
          document.getElementById(`card-${x}`)?.classList.toggle('bg-orange-500/5', x === m);
        });
      });
    });

    // Tombol salin
    konten.querySelectorAll('[data-salin]').forEach(btn => {
      btn.addEventListener('click', async () => {
        await Utils.salinKlipboard(btn.dataset.salin);
        btn.textContent = '✅ Disalin!';
        setTimeout(() => btn.textContent = '📋 Salin', 2000);
      });
    });

    // Inisialisasi tampilan awal
    document.getElementById('card-dana')?.classList.add('border-orange-500', 'bg-orange-500/5');

    // Tombol Lanjut Bayar
    document.getElementById('btn-lanjut-bayar')?.addEventListener('click', () => {
      this.prosesLanjutBayar(varian);
    });
  },

  renderInputFields(fields) {
    if (!fields || fields.length === 0) return '';
    return fields.map((label, i) => {
      const id = `f-din-${i}`;
      const isArea = label.toLowerCase().includes('brief') || label.toLowerCase().includes('deskripsi');
      const tipe = label.toLowerCase().includes('email') ? 'email' : label.toLowerCase().includes('hp') ? 'tel' : 'text';
      return `
        <div>
          <label class="label-form" for="${id}">${Utils.escapeHTML(label)} <span class="text-red-400">*</span></label>
          ${isArea
          ? `<textarea id="${id}" class="input-field resize-none min-h-[70px]" placeholder="${Utils.escapeHTML(label)}..." data-label="${Utils.escapeHTML(label)}" maxlength="400"></textarea>`
          : `<input type="${tipe}" id="${id}" class="input-field" placeholder="${Utils.escapeHTML(label)}" data-label="${Utils.escapeHTML(label)}" maxlength="100"/>`
        }
          <p class="pesan-error hidden" id="err-${id}">${Utils.escapeHTML(label)} wajib diisi</p>
        </div>
      `;
    }).join('');
  },

  tutupModal() {
    document.getElementById('modal-form')?.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
    // Reset highlight varian
    document.querySelectorAll('.kartu-varian').forEach(btn => {
      btn.classList.remove('border-orange-500', 'bg-orange-500/10');
      btn.classList.add('border-slate-700', 'bg-slate-800');
    });
  },

  async prosesLanjutBayar(varian) {
    // Validasi
    let valid = true;

    const nama = document.getElementById('f-nama')?.value.trim();
    if (!Utils.tidakKosong(nama)) {
      document.getElementById('err-nama')?.classList.remove('hidden');
      document.getElementById('f-nama')?.classList.add('border-red-500');
      valid = false;
    } else {
      document.getElementById('err-nama')?.classList.add('hidden');
      document.getElementById('f-nama')?.classList.remove('border-red-500');
    }

    const wa = document.getElementById('f-wa')?.value.trim();
    if (!Utils.validasiWA(wa)) {
      document.getElementById('err-wa')?.classList.remove('hidden');
      document.getElementById('f-wa')?.classList.add('border-red-500');
      valid = false;
    } else {
      document.getElementById('err-wa')?.classList.add('hidden');
      document.getElementById('f-wa')?.classList.remove('border-red-500');
    }

    // Field dinamis
    document.querySelectorAll('[data-label]').forEach(el => {
      const errEl = document.getElementById(`err-${el.id}`);
      if (!Utils.tidakKosong(el.value)) {
        errEl?.classList.remove('hidden');
        el.classList.add('border-red-500');
        valid = false;
      } else {
        errEl?.classList.add('hidden');
        el.classList.remove('border-red-500');
      }
    });

    if (!valid) {
      Utils.toast('Lengkapi semua field yang wajib diisi', 'error');
      return;
    }

    const btn = document.getElementById('btn-lanjut-bayar');
    btn.disabled = true;
    btn.innerHTML = '<span class="inline-block animate-spin mr-1">⏳</span> Memproses...';

    try {
      const metode = document.querySelector('input[name="metode"]:checked')?.value || 'DANA';
      const fieldDinamis = [];
      document.querySelectorAll('[data-label]').forEach(el => {
        fieldDinamis.push({ label: el.dataset.label, nilai: el.value.trim() });
      });

      const dataPesanan = {
        produk_id: varian.id,
        nama,
        wa: Utils.normalisasiWA(wa),
        produk: varian.nama,
        varian: varian.varian,
        harga: varian.harga,
        target: fieldDinamis,
        metode,
      };

      const hasil = await window.BigbozAPI.submitOrder(dataPesanan);
      if (hasil.status !== 'ok') throw new Error(hasil.message);

      const pesananFinal = { ...dataPesanan, orderId: hasil.order_id, total: varian.harga, demo: hasil.demo };
      Utils.simpanLokal('pesanan_terakhir', pesananFinal);

      this.tutupModal();
      window.Checkout.tampilkanInstruksiBayar(pesananFinal);
    } catch (err) {
      Utils.toast(err.message || 'Gagal. Coba lagi.', 'error');
      btn.disabled = false;
      btn.innerHTML = 'Lanjut Bayar →';
    }
  },

  // ================================================================
  // BOTTOM NAVIGATION BAR
  // ================================================================

  initBottomNav() {
    document.getElementById('btn-wa-float')?.addEventListener('click', () => {
      const url = `https://wa.me/${window.BIGBOZ_CONFIG?.WA_ADMIN || '6281234567890'}?text=${encodeURIComponent('Halo Admin Bigboz Store, saya mau bertanya.')}`;
      window.open(url, '_blank');
    });

    // Bottom nav
    document.querySelectorAll('.nav-bottom-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.nav;
        if (target === 'beranda') this.navigasi('beranda');
        else if (target === 'katalog') this.navigasi('kategori', { kategori: this.state.semuaProduk[0]?.kategori || 'Top Up Game' });
        else if (target === 'info') {
          document.getElementById('seksi-faq')?.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  },

  // ================================================================
  // SKELETON LOADING
  // ================================================================
  tampilkanSkeletonBeranda() {
    document.getElementById('app-kontainer').innerHTML = `
      <div class="px-4 pt-4 space-y-4 animate-pulse">
        <div class="h-8 bg-slate-800 rounded-xl w-1/2"></div>
        <div class="h-10 bg-slate-800 rounded-xl"></div>
        <div class="h-24 bg-slate-800 rounded-2xl"></div>
        <div class="h-4 bg-slate-800 rounded-full w-1/3"></div>
        <div class="bg-slate-800 rounded-2xl p-4">
          <div class="h-4 bg-slate-700 rounded w-1/3 mb-4"></div>
          <div class="grid grid-cols-4 gap-3">
            ${Array(4).fill('<div class="flex flex-col items-center gap-2"><div class="w-16 h-16 bg-slate-700 rounded-2xl"></div><div class="h-3 bg-slate-700 rounded w-14"></div></div>').join('')}
          </div>
        </div>
        <div class="bg-slate-800 rounded-2xl p-4">
          <div class="h-4 bg-slate-700 rounded w-1/2 mb-4"></div>
          <div class="grid grid-cols-4 gap-3">
            ${Array(4).fill('<div class="flex flex-col items-center gap-2"><div class="w-16 h-16 bg-slate-700 rounded-2xl"></div><div class="h-3 bg-slate-700 rounded w-14"></div></div>').join('')}
          </div>
        </div>
      </div>
    `;
  },

  // ================================================================
  // BANNER PESANAN AKTIF
  // ================================================================
  cekPesananTersimpan() {
    const pesanan = Utils.ambilLokal('pesanan_terakhir');
    const banner = document.getElementById('banner-pesanan-aktif');
    if (pesanan?.orderId && banner) {
      banner.classList.remove('hidden');
      banner.innerHTML = `
        <div class="flex items-center justify-between gap-2 text-xs">
          <span>📦 Pesanan aktif: <strong>${pesanan.orderId}</strong></span>
          <div class="flex gap-2">
            <button onclick="Checkout.tampilkanInstruksiBayar(Utils.ambilLokal('pesanan_terakhir'))" class="text-orange-400 font-bold underline">Lihat</button>
            <button onclick="Utils.hapusLokal('pesanan_terakhir'); this.closest('#banner-pesanan-aktif').classList.add('hidden')" class="text-slate-400">✕</button>
          </div>
        </div>
      `;
    }
  },
};

window.UI = UI;
