# 🚀 Panduan Setup — Bengkelin

> **Sistem Manajemen Bengkel Digital** berbasis React + Vite + Supabase

---

## 📋 Daftar Isi

- [1. Prasyarat](#1-prasyarat)
- [2. Ekstrak & Buka Folder Proyek](#2-ekstrak--buka-folder-proyek)
- [3. Install Dependency](#3-install-dependency)
- [4. Konfigurasi Environment](#4-konfigurasi-environment)
- [5. Jalankan Aplikasi](#5-jalankan-aplikasi)
- [6. Setup Supabase (Database & Auth)](#6-setup-supabase-database--auth)
- [7. Catatan Tambahan](#7-catatan-tambahan)

---

## 1. Prasyarat

Pastikan laptop/komputer Anda sudah memiliki:

- [x] **Node.js** versi 18 atau lebih baru
  - Cek dengan membuka **Command Prompt** / **Terminal** lalu ketik:
    ```bash
    node --version
    ```
  - Jika belum ada, download dan install dari [https://nodejs.org](https://nodejs.org)
- [x] **NPM** (biasanya sudah termasuk saat install Node.js)
  - Cek dengan:
    ```bash
    npm --version
    ```
- [x] **Koneksi internet** (untuk download dependency dan akses Supabase)

---

## 2. Ekstrak & Buka Folder Proyek

Jika Anda menerima file ini dalam bentuk ZIP:

1. **Ekstrak** file ZIP ke folder yang Anda inginkan (contoh: `D:\Proyek\bengkelin`)
2. **Buka terminal / command prompt**
3. **Masuk ke folder proyek**:
   ```bash
   cd D:\Proyek\bengkelin
   ```
   > _Sesuaikan path dengan lokasi folder Anda._

---

## 3. Install Dependency

Jalankan perintah berikut untuk mengunduh semua library yang dibutuhkan:

```bash
npm install
```

Proses ini akan membaca file `package.json` dan menginstall semua dependency (React, Vite, Supabase, Framer Motion, Tailwind CSS, dll) ke folder `node_modules`.

> ⏳ Tunggu hingga proses selesai. Jika muncul peringatan (warning) abaikan saja selama tidak ada error merah.

---

## 4. Konfigurasi Environment

Aplikasi ini membutuhkan koneksi ke **Supabase** (database & autentikasi). Anda harus menyiapkan project Supabase sendiri.

### 4.1 Buat File `.env`

Di dalam folder proyek, **duplikat** file `.env.example` menjadi `.env`:

**Cara manual:**

- Klik kanan file `.env.example` → **Copy**
- Klik kanan di area kosong → **Paste**
- Rename hasil salinan menjadi `.env` (hapus `.example`)

**Atau via terminal:**

```bash
cp .env.example .env
```

### 4.2 Isi Kredensial Supabase

Buka file `.env` dengan text editor (Notepad, VS Code, dll). Isi ketiga variabel berikut:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_ADMIN_EMAIL=admin@example.com
```

#### Cara mendapatkan kredensial dari Supabase:

1. **Buat akun** di [https://supabase.com](https://supabase.com) (gratis)
2. **Buat project baru** → beri nama (contoh: `bengkelin`)
3. Tunggu beberapa saat hingga project selesai dibuat
4. Buka **Project Settings** → **API**
5. Salin:
   - **`Project URL`** → isi ke `VITE_SUPABASE_URL`
   - **`anon public key`** → isi ke `VITE_SUPABASE_ANON_KEY`
6. Untuk `VITE_ADMIN_EMAIL`, isi dengan **email yang akan Anda gunakan sebagai admin** (misalnya email pribadi Anda)

> ⚠️ **Penting:** File `.env` sudah otomatis terdaftar di `.gitignore`, jadi kredensial Anda **tidak akan ikut terupload** ke GitHub. Aman!

---

## 5. Jalankan Aplikasi

Setelah semua dependency terinstall dan `.env` terisi, jalankan:

```bash
npm run dev
```

Jika berhasil, Anda akan melihat output seperti ini:

```
VITE v8.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

Buka browser dan akses: **http://localhost:5173/**

🎉 **Selamat! Aplikasi Bengkelin sudah berjalan di lokal Anda!**

---

## 6. Setup Supabase (Database & Auth)

Agar fitur booking, tracking, dan komentar berfungsi, Anda perlu membuat tabel-tabel berikut di Supabase.

### 6.1 Buka SQL Editor

Di dashboard Supabase → **SQL Editor** → **New Query**

### 6.2 Jalankan SQL Berikut

Salin dan jalankan satu per satu:

**Tabel `booking-table`** — untuk menyimpan data booking servis:

```sql
CREATE TABLE "booking-table" (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nama text,
  notelepon text,
  namamobil text,
  platno text,
  kategoriservis text,
  status text DEFAULT 'Booking',
  jam text,
  jam_mulai text,
  date text,
  estimasi integer,
  harga integer,
  created_at timestamp DEFAULT now()
);
```

**Tabel `layanan`** — untuk daftar layanan & harga:

```sql
CREATE TABLE layanan (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nama_layanan text,
  deskripsi text,
  harga integer,
  estimasi_menit integer,
  kategori text,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now()
);
```

**Tabel `mekanik`** — untuk status bengkel & jumlah mekanik:

```sql
CREATE TABLE mekanik (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  total_mekanik integer DEFAULT 5,
  mekanik_standby integer DEFAULT 3,
  status_bengkel text DEFAULT 'Buka'
);
```

**Tabel `form-comment`** — untuk menyimpan ulasan pelanggan:

```sql
CREATE TABLE "form-comment" (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text,
  message text,
  rating integer,
  created_at timestamp DEFAULT now()
);
```

### 6.3 Aktifkan Realtime

Agar data booking dan status bengkel bisa update otomatis tanpa refresh:

1. Di dashboard Supabase → **Database** → **Replication**
2. Aktifkan **Realtime** untuk tabel `booking-table` dan `mekanik`

### 6.4 Setup Autentikasi (untuk Panel Admin)

1. Di dashboard Supabase → **Authentication** → **Users**
2. Klik **Add User**
3. Masukkan **email & password** yang akan digunakan untuk login ke panel admin
4. Pastikan email tersebut **sama dengan** `VITE_ADMIN_EMAIL` yang Anda isi di file `.env`

### 6.5 (Opsional) Isi Data Awal

Jalankan query berikut untuk mengisi data contoh layanan:

```sql
INSERT INTO layanan (nama_layanan, deskripsi, harga, estimasi_menit, kategori) VALUES
('Servis Ringan', 'Ganti oli mesin + filter oli', 150000, 30, 'Servis Ringan'),
('Servis Sedang', 'Servis ringan + tune up + busi', 350000, 60, 'Servis Sedang'),
('Servis Besar', 'Servis sedang + ganti kampas rem + cairan', 650000, 120, 'Servis Besar');
```

Dan data awal untuk status bengkel:

```sql
INSERT INTO mekanik (total_mekanik, mekanik_standby, status_bengkel) VALUES (5, 3, 'Buka');
```

---

## 7. Catatan Tambahan

### 🔒 Validation Guard (Pengaman Environment)

Aplikasi ini dilengkapi **sistem pengaman otomatis**. Jika Anda lupa mengisi file `.env` lalu menjalankan aplikasi, maka:

- Di **console browser** (F12 → Console) akan muncul pesan peringatan berwarna kuning:
  ```
  ⚠️ Supabase belum dikonfigurasi!
  ```
- Lengkap dengan **petunjuk langkah demi langkah** cara setup.
- Aplikasi tetap berjalan, namun fitur yang membutuhkan database tidak akan berfungsi sampai `.env` diisi.

Jadi Anda tidak perlu khawatir mengalami error abstrak yang membingungkan. 😊

### 📁 Struktur File Penting

| File                    | Fungsi                                        |
| ----------------------- | --------------------------------------------- |
| `.env`                  | Kredensial Supabase & admin (jangan di-share) |
| `.env.example`          | Template untuk membuat `.env`                 |
| `src/supabaseClient.js` | Koneksi ke Supabase (membaca dari `.env`)     |

### 🐛 Mengalami Masalah?

Jika ada kendala, coba langkah berikut:

1. **Pastikan Node.js sudah terinstall** — ketik `node --version` di terminal
2. **Pastikan sudah `npm install`** — folder `node_modules` harus ada
3. **Pastikan file `.env` sudah terisi** — bukan `.env.example`
4. **Restart server** — matikan terminal (Ctrl+C) lalu `npm run dev` lagi
5. **Cek console browser** (F12) — lihat apakah ada pesan error

---

Selamat menggunakan **Bengkelin**! 🚀

_Jika ada pertanyaan, jangan ragu untuk menghubungi developer._
