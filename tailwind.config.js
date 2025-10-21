// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Canlı Vurgu Paleti
        primary: '#cbf078',       // Açık Yeşil (Ana aksiyon, onay)
        secondary: '#f8f398',     // Açık Sarı (İkincil vurgu, bilgilendirici uyarı)
        tertiary: '#f1b963',      // Açık Turuncu/Amber (Sıcak tonlu vurgu, ikincil aksiyon)
        error: '#e46161',         // Kırmızımsı/Mercan (Hata, kritik uyarı)

        // Nötr Temel Palet
        'text-dark': '#333333',     // Koyu Gri (Ana metin)
        'text-medium': '#666666',   // Orta Gri (İkincil metin)
        'background-light': '#f8f8f8', // Çok Açık Gri (Ana sayfa arka planı)
        'background-white': '#ffffff', // Beyaz (İçerik kartları/paneller)
        divider: '#e0e0e0',         // Açık Gri (Ayırıcı çizgiler, kenarlıklar)
      },
    },
  },
  plugins: [],
}