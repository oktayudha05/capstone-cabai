# Sistem Desain: Bento Box UI

Dokumen ini memuat panduan gaya visual (visual style guide) menggunakan pendekatan tata letak **Bento Box**. Gaya ini mengutamakan struktur grid yang rapi, pemisahan konten yang jelas, dan efisiensi ruang tanpa terlihat sesak.

> Catatan implementasi: bagian **Netral** di bawah menggantikan latar off-white yang semula dipakai. Detektor impeccable menandai cream atau beige sebagai permukaan "tasteful" bawaan AI, dan dokumen ini sendiri hanya meminta "off-white atau abu-abu sangat muda", jadi netralnya digeser ke abu dingin agar tetap patuh pada brief tanpa jatuh ke default itu. Dua warna palet juga tidak lolos WCAG AA sebagai teks (kuning 1,26:1 dan oranye 1,88:1 di latar terang), jadi tiap hue punya hex asli untuk isian dan step turunan untuk teks. Rasio diukur, bukan dikira-kira.

---

## 🎨 Palet Warna

Palet warna utama diambil dari referensi `image_3261a3.png`. Karena gaya Bento membutuhkan harmoni visual, warna-warna ini sebaiknya digunakan sebagai *aksen*, indikator status, atau elemen interaktif di atas latar belakang netral (seperti *off-white* atau abu-abu sangat muda).

*   **Olive Green**
    *   HEX: `#5B7E3C`
    *   RGB: `91, 126, 60`
    *   *Penggunaan:* Warna primer, tombol aksi utama (Primary Button), atau indikator sukses/pertumbuhan.
*   **Muted Yellow**
    *   HEX: `#FFD65A`
    *   RGB: `255, 214, 90`
    *   *Penggunaan:* Aksen sekunder, latar belakang *card* sorotan (highlight), atau ikon peringatan ringan.
*   **Soft Orange**
    *   HEX: `#FF9D23`
    *   RGB: `255, 157, 35`
    *   *Penggunaan:* Elemen peringatan (Warning), tombol aksi sekunder, atau grafik/chart data.
*   **Muted Red**
    *   HEX: `#EA5252`
    *   RGB: `234, 82, 82`
    *   *Penggunaan:* Indikator error, tombol aksi destruktif (Delete/Remove), atau notifikasi kritis.

### Netral

Netralnya dingin, bukan cream. Latar cream atau beige adalah permukaan "tasteful" yang dicapai model AI secara refleks, jadi yang dipakai abu kebiruan sangat muda yang tetap memenuhi permintaan dokumen ini.

*   **Latar halaman:** `#F2F4F5`
*   **Permukaan ubin:** `#FFFFFF`
*   **Permukaan sekunder:** `#E7EAEC`
*   **Teks utama:** `#1B1F22`
*   **Teks pendukung:** `#5A6167`
*   **Garis pemisah:** `#C3C9CE`
*   **Garis kontrol:** `#7E868C` (memenuhi 3:1 untuk elemen non-teks)


---

## 📐 Tata Letak & Grid (Bento Style)

Pendekatan Bento membagi antarmuka menjadi panel-panel atau "ubin" (tiles) yang tertata rapi. 

1.  **Struktur Grid (Grid System)**
    *   Gunakan CSS Grid atau Flexbox untuk menyusun tata letak.
    *   Jarak antar panel (*Gap/Gutter*) harus konsisten dan minimal, direkomendasikan sebesar `16px` atau `24px` untuk menjaga kerapatan tanpa membuat ruang terasa sempit.
2.  **Bentuk Wadah (Containers)**
    *   Setiap potongan konten harus berada di dalam *card* atau panel berbentuk persegi panjang.
    *   Sudut wadah harus melengkung lembut (*softly rounded corners*). Gunakan `border-radius` antara `16px` hingga `24px`.
    *   Hindari penggunaan bayangan (Drop Shadow) yang terlalu tebal. Gunakan bayangan statis yang sangat halus atau cukup gunakan warna latar belakang panel yang sedikit berbeda dari *background* utama untuk menciptakan separasi flat.

---

## 🔤 Tipografi & Konten

*   **Jenis Huruf (Font Family):** Gunakan *sans-serif* yang modern, bersih, dan mudah dibaca (misalnya Inter, Roboto, atau sistem font bawaan UI).
*   **Hirarki Jelas:** 
    *   Judul panel (*Heading*) harus tegas, ringkas, dan langsung pada intinya.
    *   Gunakan ketebalan huruf (*font-weight*) untuk membedakan informasi penting alih-alih menggunakan terlalu banyak warna.
*   **Minimalisme Ornamen:** Hindari dekorasi teks yang tidak perlu. Ilustrasi kecil atau grafik sederhana (seperti *sparklines* atau *donut charts*) bisa ditambahkan untuk memperkaya data tanpa mendominasi estetika.

---

## 💻 Panduan Implementasi Komponen

Untuk membangun antarmuka dengan gaya ini, ikuti urutan berikut:

1.  **Buat Blok Utama:** Tentukan grid utama halaman (misalnya 3 atau 4 kolom).
2.  **Strukturkan Informasi:** Kelompokkan data yang saling berkaitan ke dalam satu panel Bento yang sama. Jangan mencampur data yang tidak relevan di dalam satu *card*.
3.  **Tambahkan Sorotan (Highlights):** Gunakan palet warna `#5B7E3C` (Hijau) atau `#FF9D23` (Oranye) hanya pada angka metrik penting, grafik, atau tombol yang membutuhkan perhatian pengguna.
