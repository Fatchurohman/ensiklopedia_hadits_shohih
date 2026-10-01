// Endpoint CDN untuk kedua kitab
const API_URLS = {
  bukhari: 'https://cdn.jsdelivr.net/gh/gadingnst/hadith-api@master/books/bukhari.json',
  muslim: 'https://cdn.jsdelivr.net/gh/gadingnst/hadith-api@master/books/muslim.json'
};

let currentBook = 'bukhari';
let allHadiths = [];
let filteredHadiths = [];

// DOM Elements
const searchInput = document.getElementById('searchInput');
const hadithContainer = document.getElementById('hadithContainer');
const btnBukhari = document.getElementById('btnBukhari');
const btnMuslim = document.getElementById('btnMuslim');

// 1. Fetch Data dari CDN Sesuai Kitab yang Dipilih
async function loadHadiths(bookName = 'bukhari') {
  if (!hadithContainer) return;

  currentBook = bookName;
  updateActiveButton();

  hadithContainer.innerHTML = `
    <div class="text-center py-12 text-slate-400">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-3"></div>
      <p class="text-sm">Memuat database Sahih ${bookName === 'bukhari' ? 'Bukhari' : 'Muslim'}...</p>
    </div>
  `;

  try {
    const response = await fetch(API_URLS[bookName]);
    if (!response.ok) {
      throw new Error(`HTTP Error Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && Array.isArray(data.hadiths)) {
      allHadiths = data.hadiths;
    } else if (Array.isArray(data)) {
      allHadiths = data;
    } else {
      throw new Error('Format data JSON tidak sesuai.');
    }

    filteredHadiths = [...allHadiths];

    if (searchInput) searchInput.value = '';

    renderHadiths(filteredHadiths.slice(0, 20));
  } catch (error) {
    console.error('Gagal memuat hadits:', error);
    hadithContainer.innerHTML = `
      <div class="glass-card p-6 rounded-xl text-red-400 text-center text-sm">
        Gagal memuat data hadits. Pastikan koneksi internet stabil.
      </div>
    `;
  }
}

// 2. Render Hadits ke Tampilan (Lengkap dengan Tombol PDF/Cetak)
function renderHadiths(list) {
  if (!hadithContainer) return;

  if (!Array.isArray(list) || list.length === 0) {
    hadithContainer.innerHTML = `
      <div class="glass-card p-8 rounded-xl text-center text-slate-400 text-sm">
        Hadits tidak ditemukan. Cobalah kata kunci lain.
      </div>
    `;
    return;
  }

  const bookTitle = currentBook === 'bukhari' ? 'Bukhari' : 'Muslim';

  hadithContainer.innerHTML = list.map((item, index) => {
    const number = item.number || item.id || '-';
    const arab = item.arab || item.ar || '';
    const idText = item.id || item.terjemah || '';
    const cardId = `hadith-card-${index}`;

    return `
      <div id="${cardId}" class="hadith-card-item glass-card p-6 sm:p-8 rounded-2xl relative overflow-hidden transition hover:border-slate-700">
        <div class="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
          <span class="px-3 py-1 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800/50 text-xs font-bold uppercase tracking-wider">
            ${bookTitle} No. ${number}
          </span>
          <div class="flex items-center gap-3 no-print">
            <button onclick="copyText('${encodeURIComponent(idText)}')" class="text-slate-400 hover:text-amber-400 text-xs font-medium flex items-center gap-1 transition">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              Salin
            </button>
            <button onclick="printHadith('${cardId}')" class="text-slate-400 hover:text-emerald-400 text-xs font-medium flex items-center gap-1 transition">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
              PDF / Cetak
            </button>
          </div>
        </div>

        <p class="font-arabic text-2xl sm:text-3xl text-right text-amber-100/90 mb-6 leading-relaxed" dir="rtl">
          ${arab}
        </p>

        <p class="text-slate-300 text-sm sm:text-base leading-relaxed">
          "${idText}"
        </p>
      </div>
    `;
  }).join('');
}

// 3. Fungsi Cetak / Simpan PDF Spesifik Per Hadits
function printHadith(cardId) {
  const card = document.getElementById(cardId);
  if (!card) return;

  card.classList.add('printing-active');
  window.print();
  card.classList.remove('printing-active');
}

// 4. Switch Kitab (Bukhari <-> Muslim)
function switchBook(bookName) {
  if (bookName === currentBook) return;
  loadHadiths(bookName);
}

// 5. Update Tampilan Tombol Aktif
function updateActiveButton() {
  if (!btnBukhari || !btnMuslim) return;

  if (currentBook === 'bukhari') {
    btnBukhari.className = 'px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm shadow-md transition hover:bg-emerald-500 flex items-center gap-2';
    btnMuslim.className = 'px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-sm transition hover:bg-slate-700 flex items-center gap-2';
  } else {
    btnMuslim.className = 'px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm shadow-md transition hover:bg-emerald-500 flex items-center gap-2';
    btnBukhari.className = 'px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-sm transition hover:bg-slate-700 flex items-center gap-2';
  }
}

// 6. Salin Teks
function copyText(text) {
  if (!text) return;
  navigator.clipboard.writeText(decodeURIComponent(text));
  alert('Teks hadits berhasil disalin!');
}

// 7. Pencarian Responsif Instan
let searchTimeout;
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const keyword = e.target.value.toLowerCase().trim();

    searchTimeout = setTimeout(() => {
      if (!keyword) {
        renderHadiths(allHadiths.slice(0, 20));
        return;
      }

      filteredHadiths = allHadiths.filter(item => {
        const numberStr = (item.number || item.id || '').toString();
        const textStr = (item.id || item.terjemah || '').toLowerCase();
        return numberStr === keyword || textStr.includes(keyword);
      });

      renderHadiths(filteredHadiths.slice(0, 50));
    }, 250);
  });
}

// 8. Function Realtime Visitor Counter (Menggunakan CounterAPI.dev)
async function updateVisitorCount() {
  const visitorElement = document.getElementById('visitorCount');
  if (!visitorElement) return;

  const BASE_VISITORS = 200; // Angka dasar awal
  const NAMESPACE = 'fatur62_hadits_sahih';
  const KEY = 'visits';

  try {
    // Memanggil API penghitung pengunjung yang lebih stabil
    const res = await fetch(`https://api.counterapi.dev/v1/${NAMESPACE}/${KEY}/up`);
    if (res.ok) {
      const data = await res.json();
      const totalVisits = BASE_VISITORS + (data.count || 1);
      
      // Simpan ke localStorage sebagai cadangan offline
      localStorage.setItem('fatur_local_visits', totalVisits);
      visitorElement.textContent = totalVisits.toLocaleString('id-ID');
    } else {
      throw new Error('API Counter tidak merespon.');
    }
  } catch (error) {
    console.warn('Menggunakan fallback lokal untuk pengunjung:', error);
    
    // Sistem Fallback: Otomatis menambah hit lokal jika API terhalang CORS/Offline
    let localCount = parseInt(localStorage.getItem('fatur_local_visits') || BASE_VISITORS);
    localCount += 1;
    localStorage.setItem('fatur_local_visits', localCount);
    
    visitorElement.textContent = localCount.toLocaleString('id-ID');
  }
}

// Inisialisasi Aplikasi Saat Halaman Selesai Dimuat
document.addEventListener('DOMContentLoaded', () => {
  loadHadiths('bukhari');
  updateVisitorCount();
});


