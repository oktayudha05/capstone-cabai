# Produk: Dashboard pemantauan tanaman cabai

## Pengguna dan pekerjaan

Dosen penguji dan mahasiswa yang mengerjakan sistem IoT ini. Dipakai di dua situasi: demo di depan penguji pada layar proyektor, dan dipantau sendiri dari HP saat mengecek tanaman. Pekerjaannya satu: melihat apakah kelembapan tanah dan udara masih di rentang yang benar, dan apakah kipas serta pompa air menyala atau mati.

## Yang produk ini lakukan

Menampilkan pembacaan kelembapan tanah, kelembapan udara, dan status relay kipas serta pompa air, yang dilaporkan mikrokontroler lewat MQTT.

Mekanisme yang membedakannya dari dashboard biasa: **web ini tidak mengendalikan apa pun.** Keputusan on/off aktuator dijalankan di mikrokontroler, jadi dashboard hanya membaca. Tidak ada tombol nyala-mati di sini, dan itu memang batas sistemnya, bukan fitur yang belum selesai.

## Batasan yang harus dijaga

- Dashboard hanya membaca. Tidak ada perintah keluar dari web ke perangkat.
- Protokol MQTT pihak ketiga. Broker saat ini HiveMQ public broker.
- Nilai ambang batas kelembapan belum ditetapkan siapa pun, jadi tidak boleh ditampilkan sebagai angka.
- Data dummy dipakai sebelum integrasi perangkat selesai.
- Proyek kuliah: tidak ada anggaran untuk layanan berbayar, tidak ada backend sendiri.

## Platform

`web`. Responsif, dipakai di desktop untuk demo dan di HP untuk pemantauan.

## Suara

Istilah teknis Indonesia apa adanya (`kelembapan tanah`, `menyala`, `mati`). Nama status koneksi mengikuti keluaran pustaka MQTT (`connected`, `connecting`, `error`) karena cocok dengan log konsol.

## Yang belum diputuskan

- [REAL DATA] Angka ambang batas kelembapan tanah dan udara.
- [REAL DATA] Broker MQTT final dan topik yang dipakai perangkat sungguhan.
- [REAL DATA] Apakah data perlu disimpan untuk laporan (butuh backend atau ekspor berkas).
