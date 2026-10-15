# Aplikasi Uji Petik Fiber Optik (Tarakan)
### Quality Control & Audit Instalasi Fiber Optik: Pasang Baru (PSB) & Gangguan

Aplikasi web modern berbasis **Next.js** dan **Database MySQL** untuk pencatatan, upload data tiket, dan rekapan hasil uji petik pekerjaan teknisi lapangan di wilayah Tarakan.

---

## 🌟 Fitur Utama

### 1. 📤 Menu Upload & Master Data WO (PSB & Gangguan) *(BARU)*
- **Upload Berkas Excel / CSV**: Mendukung format `.xlsx`, `.xls`, dan `.csv`.
- **Deteksi Header Kolom Fleksibel**: Otomatis mendeteksi kolom:
  - `Nomor WO` / `No WO`
  - `Pekerjaan` (PSB / GANGGUAN)
  - `Nama Pelanggan`
  - `Nomor Telepon` / WhatsApp
  - `Nama Teknisi`
  - `Panjang Kabel` / Tarikan
  - `Alamat`
- **Unduh Template Spreadsheet**: Dilengkapi tombol unduh template Excel contoh agar format pengisian seragam.
- **Tambah WO Manual**: Memungkinkan penambahan data tiket individual secara langsung lewat modal input.
- **Filter Sub-Tab**: Memisahkan tampilan *Semua*, *Data PSB*, dan *Data Gangguan*.
- **Status Validasi**: Menandai apakah suatu nomor WO *Sudah Di-uji Petik* atau *Belum Di-uji*.
- **Tombol Pintas Audit**: Tombol "Input Form Uji Petik" pada baris data WO yang langsung membuka formulir dengan data terisi lengkap.

---

### 2. 📝 Formulir Input Uji Petik & Auto-Fill Cerdas
- **Pengisian Otomatis dari Nomor WO**:
  - Saat teknisi/auditor mengetik atau memilih nomor WO, sistem langsung memunculkan saran pencarian secara real-time.
  - Saat nomor WO dipilih, kolom berikut **terisi otomatis**:
    - **Jenis Pekerjaan**: Otomatis berpindah ke PSB atau GANGGUAN.
    - **Panjang Kabel**: Otomatis terisi (meter).
    - **Nama Pelanggan**: Otomatis terisi.
    - **Nomor Telepon**: Otomatis terisi.
    - **Nama Teknisi**: Otomatis terisi.
  - Terdapat tombol **"Cari di Master WO"** untuk membuka modal pemilih tiket dengan pencarian cepat.
  - Semua field tetap dapat disesuaikan manual jika kondisi aktual di lapangan berbeda dari data tiket.
- **Timestamp Otomatis**: Mencatat tanggal, bulan, tahun, jam, dan menit secara otomatis (WITA).
- **7 Poin Ceklist Instalasi & Bukti Foto**:
  1. ✅ **ODP** - Foto kerapian ODP, splitter, konektor, dan pintu ODP terkunci.
  2. ✅ **Label DC** - Foto label nomor dropcore / port yang jelas.
  3. ✅ **S-Clamp** - Foto penambat kabel di tiang distribusi.
  4. ✅ **Stoper** - Foto pengunci/penahan tarikan dropcore.
  5. ✅ **Clamp Pelanggan** - Foto bracket penambat di dinding rumah pelanggan.
  6. ✅ **IKR** - Foto instalasi kabel rumah, pelindung ducting/klem, dan roset optik.
  7. ✅ **Dropcore Baru** - Foto fisik bentangan kabel dropcore baru.
  - Setiap item dilengkapi status **Sesuai** / **Tidak Sesuai**, fitur **Ambil Foto (Kamera Langsung HP / Upload File)**, kompresi otomatis gambar, dan pratinjau zoom.
- **Hasil & Evaluasi Audit**: Pilihan status (*Lolos Uji Petik*, *Perlu Perbaikan*, *Tidak Lolos*) dan catatan evaluator.

---

### 3. 📊 Menu Rekapan Data Uji Petik
- **Ringkasan KPI & Statistik**: Total Pekerjaan, Total PSB vs Gangguan, Lolos vs Perlu Perbaikan.
- **Pencarian & Filter Multi-Parameter**: Nomor WO, Nama Pelanggan, Teknisi, Jenis Pekerjaan, dan Status Kelayakan.
- **Tampilan Responsif**: Tabel lengkap untuk Desktop & kartu rapi untuk Mobile/Tablet.
- **Cetak Berita Acara Resmi (PDF)**: Lembar laporan formal Uji Petik standar telekomunikasi lengkap dengan kop dokumen, tabel pemeriksaan, foto bukti fisik, dan kolom tanda tangan (Teknisi, Auditor QC, Team Leader/Asman).
- **Export ke Excel / CSV**: Unduh seluruh data rekapan ke berkas CSV yang kompatibel dengan Microsoft Excel.

---

## 🗄️ Konfigurasi Database MySQL

Konfigurasi database terdapat pada file `.env.local`:

```env
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=isi_password_mysql_anda
MYSQL_DATABASE=uji_petik_db
```

### Inisialisasi Database Otomatis:
Jalankan perintah ini di terminal:
```bash
npm run db:init
```
Perintah ini akan membuat database `uji_petik_db` beserta tabel `uji_petik` dan `master_workorder` secara otomatis di MySQL Anda.

> **Catatan:** Jika MySQL belum diaktifkan atau password belum diatur, aplikasi memiliki sistem **fail-safe cerdas** yang otomatis menggunakan penyimpanan cadangan lokal ([data/](file:///Users/mac/Documents/UJI_PETIK_TARAKAN/data/)) sehingga Anda tetap dapat menggunakan seluruh fitur aplikasi tanpa kendala.

---

## 🚀 Cara Menjalankan Aplikasi

1. **Jalankan di Mode Pengembangan (Development)**:
   ```bash
   npm run dev
   ```

2. **Jalankan di Mode Produksi**:
   ```bash
   npm run build
   npm run start
   ```

Aplikasi aktif dan dapat diakses di: **[http://localhost:3000](http://localhost:3000)**

### Penyajian foto di server production

Foto disimpan di `public/uploads` dan dibaca saat diminta melalui
`/api/uploads/[filename]`, dengan `Cache-Control: no-store`. URL lama
`/uploads/[filename]` diarahkan ke endpoint yang sama melalui rewrite Next.js.
Ini memungkinkan foto yang diunggah setelah build/server berjalan langsung dibaca.

Setelah memperbarui kode, jalankan build dan restart proses aplikasi. Jika memakai
Nginx/CDN, pastikan `/api/uploads/*` diteruskan ke Next.js tanpa cache. Agar URL lama
ikut memakai perbaikan ini, `/uploads/*` juga harus diteruskan ke Next.js, bukan
dilayani oleh aturan static-file terpisah; bersihkan cache 404 lama jika ada.
Folder `public/uploads` harus tetap tersimpan saat deploy dan digunakan bersama
oleh semua instance aplikasi jika server menjalankan lebih dari satu instance.
