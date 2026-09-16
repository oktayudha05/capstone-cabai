# Dashboard pemantauan tanaman cabai

Dashboard web untuk memantau tanaman cabai: kelembapan tanah, kelembapan udara, dan status aktuator (kipas, pompa air).

Dashboard ini **hanya membaca**. Keputusan on/off aktuator dijalankan di mikrokontroler, jadi web tidak mengirim perintah apa pun, hanya menampilkan status yang dilaporkan perangkat.

Data bisa berasal dari simulasi lokal atau langsung dari broker MQTT.

## Stack

- React 18 + Vite
- mqtt.js untuk WebSocket ke broker pihak ketiga (HiveMQ public broker)
- Vitest untuk unit test
- Tanpa pustaka komponen atau grafik. Grafik digambar sebagai SVG di komponen sendiri, supaya tidak ada satu dependensi besar hanya untuk satu grafik.

## Menjalankan

```bash
npm install
cp .env.example .env
npm run dev
```

Lain:

```bash
npm test        # unit test parser, simulator, reducer, grafik, format
npm run build   # build produksi
npm run preview # jalankan hasil build
```

Mengakses dari HP di jaringan yang sama:

```bash
npm run dev -- --host 0.0.0.0 --port 5180
# lalu buka http://<IP-laptop>:5180 dari HP
```

Cek IP laptop dengan `ip -4 addr show`. Mode uji tampilan ada di [`.env.testing.md`](.env.testing.md): keadaan kosong, dua varian panel galat, dan pengujian MQTT dengan prefix topik terpisah.

## Sumber data

Diatur lewat `VITE_DATA_SOURCE` di `.env`.

- `dummy` (default): simulator lokal di browser, nilai berfluktuasi tiap detik. Dipakai sebelum integrasi.
- `mqtt`: subscribe ke broker dari `VITE_MQTT_URL`.

Variabel lain: `VITE_MQTT_URL`, `VITE_MQTT_USERNAME`, `VITE_MQTT_PASSWORD`, `VITE_MQTT_TOPIC_PREFIX`.

Detail topik, format payload, dan contoh firmware ada di [docs/mqtt-contract.md](docs/mqtt-contract.md).

## Deploy

Produksi: **https://capstone-seven-fawn.vercel.app**

Repo GitHub [oktayudha05/capstone-cabai](https://github.com/oktayudha05/capstone-cabai) tersambung ke project Vercel `capstone`, jadi tiap push ke `main` langsung membangun ulang situs produksi.

- Framework terdeteksi otomatis: Vite, perintah `vite build`, keluaran `dist`.
- `VITE_DATA_SOURCE=dummy` diset di environment Production dan Preview, jadi deploy selalu memakai simulator sampai integrasi MQTT siap.
- Saat integrasi tiba: ubah `VITE_DATA_SOURCE` jadi `mqtt` di dashboard Vercel, isi `VITE_MQTT_URL`, lalu deploy ulang. Tidak perlu ubah kode.
- Konfigurasi di [`vercel.json`](vercel.json) (header keamanan) dan [`.vercelignore`](.vercelignore) (`.hermes/` tidak diunggah).

Deploy manual dari laptop:

```bash
npx vercel deploy --prod   # butuh login sekali: npx vercel login
```

## Interaksi

- **Tahan / Lanjutkan**: membekukan pembacaan supaya angka bisa dibaca dan dicatat saat demo. Angka yang beku diredupkan, dan muncul pita kuning yang menyebut waktu pembekuannya.
- **Rentang waktu**: 1 menit, 5 menit, atau seluruh sesi. Mempengaruhi grafik dan ringkasan terendah/tertinggi. Pilihan disimpan di browser.
- **Sentuh grafik**: menampilkan nilai tanah dan udara pada titik yang disentuh atau diarahkan kursor. Bisa juga dengan papan tik: Tab ke grafik, lalu tombol panah kiri/kanan, Home, End, dan Escape.
- **Log kejadian aktuator**: mencatat tiap perubahan relay beserta waktunya, terbaru di atas.

## Struktur

```
src/
  App.jsx                    susunan ubin, panel galat, jam bersama
  components/                ubin sensor, ubin aktuator, grafik riwayat, log kejadian, kontrol, strip status
  hooks/usePlantFeed.js      sumber data, koneksi, tema, rentang waktu, tahan
  lib/topics.js              daftar topik MQTT
  lib/payload.js             parser payload firmware
  lib/mqttClient.js          koneksi dan subscribe MQTT
  lib/simulator.js           perangkat dummy untuk pengembangan
  lib/feedReducer.js         state sensor, aktuator, riwayat, log kejadian
  lib/chart.js               geometri grafik, potong celah data, cari titik terdekat
  lib/format.js              format angka, waktu, durasi, istilah status
  styles/tokens.css          token warna dan ukuran, tema terang dan gelap
  styles/app.css             tata letak ubin dan komponen
PRODUCT.md                   kebenaran produk: pengguna, pekerjaan, batasan
DESIGN.md                    arah visual
docs/mqtt-contract.md        kesepakatan topik dengan sisi mikrokontroler
```

## Keputusan desain

Arah visual dari [DESIGN.md](DESIGN.md): tata letak Bento, palet olive, kuning, oranye, merah, sudut 16 sampai 24 px, sans-serif sistem, tanpa bayangan tebal. Mode permukaan: **Operate** (pengguna sedang mengerjakan tugas memantau, bukan membaca promosi).

Dial: **ENERGY 1 / RHYTHM 3 / MOTION 1**.

Alasan tiap keputusan, satu baris masing-masing:

- **Bento mosaik, ukuran ubin ikut bobot data.** DESIGN.md meminta Bento, dan aturan antislop R-05 melarang mosaik bento sebagai tata letak bawaan. Konten di sini memang heterogen (dua metrik sensor, dua status aktuator, grafik, log kejadian, strip status), jadi mosaiknya berguna, bukan tempelan. Ubin tetap tersusun tanpa lubang dan tanpa ubin yang diregangkan. Keputusan ini dikonfirmasi pemilik arah desain, bukan diambil sendiri.
- **Netral dingin, bukan cream.** Latar cream ditandai detektor impeccable sebagai permukaan "tasteful" bawaan AI, dan DESIGN.md sendiri hanya meminta "off-white atau abu-abu sangat muda", jadi netralnya digeser ke abu kebiruan.
- **Ubin tanah jadi titik fokus lewat isian kuning dan angka terbesar.** Awalnya ubin tanah dibentang dua baris, tetapi bentang itu meregangkan isinya atau menyisakan rongga. Fokus dipindah ke kontras hierarki: isian sorotan dan ukuran angka.
- **Kuning hanya di ubin tanah.** DESIGN.md menugaskan kuning sebagai latar sorotan, dan satu titik fokus per layar butuh tepat satu sorotan. Kalau dipakai di dua ubin, tidak ada yang jadi fokus.
- **Hijau untuk tanah, oranye untuk udara dan garis grafik.** DESIGN.md menugaskan hijau untuk metrik utama dan pertumbuhan, oranye untuk data grafik. Udara adalah pembacaan pendukung, jadi dapat oranye.
- **Merah hanya untuk keadaan galat.** DESIGN.md menugaskannya untuk galat kritis. Merah tidak dipakai untuk menghias apa pun.
- **Tiap hue punya dua langkah warna.** Kuning `#FFD65A` hanya 1,26:1 di latar terang dan oranye `#FF9D23` hanya 1,88:1, jadi keduanya tidak layak jadi teks. Hex asli dipakai untuk isian, versi turunan untuk teks, masing-masing terukur di atas 4,5:1 di ketiga permukaan.
- **Teks di atas kuning memakai shade dari hue kuning, bukan abu-abu.** Abu di atas latar berwarna terlihat pudar dan ditandai detektor sebagai `gray-on-color`. Shade kuningnya 5,14:1 dan tetap satu keluarga warna dengan latarnya.
- **Gauge lingkaran dan sparkline dibuang, diganti angka ringkas.** Aturan craft-floor impeccable menyebut sparkline dan cincin progres sebagai pengganti konten, bukan konten. Nilai terendah, tertinggi, dan jumlah bacaan memberi informasi yang sama tanpa bentuk dekoratif.
- **Skala tipe tetap, bukan fluid.** Mode Operate dilihat pada DPI yang konsisten, dan judul yang mengecil di dalam ubin terlihat lebih buruk. Langkah terbesar 1,31x, cukup untuk hierarki yang terbaca.
- **Satu motion yang ditulis: cincin saat relay berubah.** Keadaan relay adalah inti produk ini, jadi perubahannya yang dapat sorotan. Tidak ada animasi masuk berjeda, karena pengguna mode Operate tidak perlu menonton halaman memuat. Gerakan ini mati saat `prefers-reduced-motion`.
- **Grafik memotong garis saat ada celah data.** Saat feed dijeda atau perangkat diam, garis putus alih-alih menarik segmen lurus melintasi waktu yang tidak punya pembacaan.
- **Grafik bisa dibaca per titik dengan sentuhan dan papan tik.** Titik yang dipilih bertahan sampai pengguna memilih yang lain, jadi angka tidak berubah di bawah jari saat sedang dibaca.
- **Riwayat 300 sampel di memori, tanpa database.** Cukup untuk pemilihan rentang 1 menit, 5 menit, dan seluruh sesi, tanpa menambah backend.
- **Jam tunggal untuk semua durasi dan label "sekarang".** Ubin tidak boleh berbeda pendapat soal jam berapa sekarang.
- **Log kejadian mencatat perubahan relay, bukan laporan pertama.** Laporan pertama adalah garis dasar, bukan peristiwa.
- **Ambang batas ditandai `[REAL DATA]`.** Angka ambang penyiraman dan pengipasan belum ditetapkan, jadi ditulis apa adanya sebagai placeholder. Tidak ada zona kering, ideal, basah yang dikarang.
- **Aktuator tanpa tombol on/off.** Keputusan on/off ada di mikrokontroler, jadi tombol di web hanya akan jadi kontrol mati.
- **Tema terang dan gelap, keduanya diuji.** Dashboard dipantau siang dan malam. Karena tidak ada alasan kuat untuk mengunci satu tema, tombol tema dibangun dan kedua tema diperiksa kontrasnya.
- **Keadaan kosong dan galat menyebut sebab dan langkah berikutnya.** Panel galat membedakan dua sebab: konfigurasi belum diisi, atau broker tidak bisa dijangkau.
- **Permukaan browser ikut didesain.** Warna seleksi teks dan kotak gulir log kejadian memakai palet, bukan bawaan peramban.

## Catatan yang diketahui

- Peluncuran `scripts/mqtt-publish-test.mjs` dan `.env.mqtttest` memakai prefix topik uji terpisah supaya tidak bentrok dengan perangkat lain di broker publik. Ganti prefix saat integrasi.
- Broker publik HiveMQ tidak memakai autentikasi dan topiknya bisa dibaca siapa saja. Jangan mengirim data pribadi atau kredensial lewat topik ini.
- Nama status koneksi memakai istilah pustaka MQTT (`connected`, `connecting`, `error`) karena cocok dengan keluaran pustaka dan log konsol.
- Batas kolom mengikuti tempat konten mulai rusak: satu kolom di ponsel, dua kolom saat ubin sensor terlalu lebar ditumpuk (40rem), empat kolom saat tata letak melebar (64rem). Sudah diperiksa pada 320, 375, 600, 768, 900, 1024, 1280, dan 1600 px, plus teks 200%, tanpa overflow horizontal.
- Tooling desain [impeccable](https://github.com/pbakaus/impeccable) terpasang project-scoped di `.hermes/skills/impeccable`. Detektornya dijalankan dengan `.hermes/skills/impeccable/scripts/impeccable detect <target>`; mesinnya mengunduh dirinya sekali ke `~/.impeccable/bin/0.1.5/` saat pertama dipakai.
