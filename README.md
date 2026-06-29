# 🔧 Bengkelin — Sistem Manajemen Bengkel Digital

> Platform booking & tracking servis kendaraan berbasis web untuk **Bisnis**

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat&logo=vite)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=flat&logo=supabase)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38BDF8?style=flat&logo=tailwindcss)
![Deploy](https://img.shields.io/badge/Deploy-GitHub%20Pages-222?style=flat&logo=github)

**🌐 Live Demo:** [yugata-dev.github.io/bengkelin](https://yugata-dev.github.io/bengkelin)

---

## 📋 Daftar Isi

- [Tentang Proyek](#tentang-proyek)
- [Fitur](#fitur)
- [Tech Stack](#tech-stack)
- [Struktur Proyek](#struktur-proyek)
- [Cara Menjalankan](#cara-menjalankan)
- [Setup Supabase](#setup-supabase)
- [Panduan Penggunaan](#panduan-penggunaan)
- [Deploy](#deploy)

---

## 📖 Tentang Proyek

Bengkelin adalah sistem digital bengkel yang menggabungkan **branding profesional**, **booking online**, **tracking real-time**, dan **panel admin** dalam satu platform. Dibangun untuk membantu bengkel mobil memodernisasi operasional tanpa memerlukan aplikasi mobile terpisah.

---

## ✨ Fitur

### Untuk Pelanggan
- 📅 **Booking Online** — Daftarkan kendaraan untuk servis dengan validasi nomor HP, plat nomor, dan tanggal otomatis
- 🔍 **Track Status** — Lacak progres servis kendaraan secara real-time menggunakan plat nomor
- 📊 **Antrian Live** — Lihat antrian aktif bengkel hari ini
- ⭐ **Review & Feedback** — Kirim ulasan langsung dari website dengan sistem anti-spam

### Untuk Admin
- 🛠️ **Panel Admin** — Dashboard lengkap untuk mengelola seluruh operasional bengkel
- 📋 **Kelola Antrian** — Update status booking (Booking → Proses → Quality Check → Selesai)
- 💰 **Kelola Layanan & Harga** — CRUD layanan secara dinamis tanpa ubah kode
- 👨‍🔧 **Status Mekanik** — Atur jumlah mekanik standby dan status bengkel
- 💬 **Moderasi Ulasan** — Kelola ulasan pelanggan
- ⚠️ **Notif Overdue** — Peringatan otomatis jika ada booking yang melewati estimasi selesai
- 📱 **WhatsApp Notifikasi** — Kirim notif otomatis ke pelanggan saat status berubah

### Sistem
- ⚡ **Realtime** — Data antrian dan status mekanik update otomatis tanpa refresh
- 🔐 **Auth Guard** — Panel admin dilindungi autentikasi Supabase
- 🛡️ **Anti-spam** — Honeypot + cooldown pada form booking & review
- 📱 **Responsive** — Tampilan optimal di desktop dan mobile

---

## 🧰 Tech Stack

| Teknologi | Kegunaan |
|---|---|
| React 19 | UI Framework |
| Vite 8 | Build Tool |
| Tailwind CSS 4 | Styling |
| Framer Motion | Animasi |
| Supabase | Database, Auth, Realtime |
| React Router v7 | Routing |
| gh-pages | Deployment |

---

## 📁 Struktur Proyek

```
src/
├── assets/          # Gambar & aset statis
├── components/
│   ├── AdminRow.jsx         # Baris tabel admin dengan edit inline
│   ├── DesktopNavbar.jsx    # Navbar desktop
│   ├── MobileNavbar.jsx     # Navbar mobile
│   └── MechanicStandBy.jsx  # Komponen status mekanik
├── pages/
│   ├── Home.jsx     # Landing page + status bengkel + review
│   ├── Booking.jsx  # Form booking servis
│   ├── History.jsx  # Halaman antrian publik
│   ├── Track.jsx    # Tracking status by plat nomor
│   ├── Admin.jsx    # Panel admin (auth-guarded)
│   └── Login.jsx    # Halaman login admin
├── utils/
│   ├── hitungJamSelesai.jsx  # Helper hitung estimasi selesai
│   └── formatDurasi.js       # Helper format menit → jam
├── useTrack.jsx        # Hook fetch + realtime data booking
├── useMekanik.js       # Hook fetch + realtime status mekanik
├── useInputBooking.js  # Hook form booking dengan useReducer
└── supabaseClient.js   # Inisialisasi Supabase client
```

---

## 🚀 Cara Menjalankan

### Prerequisites
- Node.js 18+
- Akun Supabase

### Instalasi

```bash
# Clone repo
git clone https://github.com/yugata-dev/bengkelin.git
cd bengkelin

# Install dependencies
npm install

# Buat file .env
cp .env.example .env
# Isi VITE_ADMIN_EMAIL di file .env

# Jalankan development server
npm run dev
```

---

## 🗄️ Setup Supabase

### 1. Buat Project Baru di Supabase

### 2. Buat Tabel

**Tabel `booking-table`:**
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

**Tabel `layanan`:**
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

**Tabel `mekanik`:**
```sql
CREATE TABLE mekanik (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  total_mekanik integer DEFAULT 5,
  mekanik_standby integer DEFAULT 3,
  status_bengkel text DEFAULT 'Buka'
);
```

**Tabel `form-comment`:**
```sql
CREATE TABLE "form-comment" (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text,
  message text,
  rating integer,
  created_at timestamp DEFAULT now()
);
```

### 3. Aktifkan Realtime

Di Supabase Dashboard → Database → Replication → aktifkan untuk tabel `booking-table` dan `mekanik`.

### 4. Setup Auth

- Authentication → Users → Add user
- Masukkan email admin kamu

### 5. Isi Environment Variable

```env
VITE_ADMIN_EMAIL=email_admin_kamu@gmail.com
```

---

## 📖 Panduan Penggunaan

### Untuk Pelanggan

#### Booking Servis
1. Klik **"Booking Services"** di navbar atau hero section
2. Isi form:
   - Nama pelanggan
   - No. HP / WhatsApp (format: 08xx atau +62xx)
   - Jenis/Merk mobil
   - Plat nomor (format: B 1234 ABC)
   - Pilih layanan dari dropdown
   - Jam masuk & tanggal
3. Klik **"Tambah Antrean Bengkel"**
4. Simpan plat nomor untuk tracking

#### Cek Status Kendaraan
1. Klik **"Track Status"** di navbar
2. Masukkan plat nomor kendaraan
3. Klik **"Lacak"**
4. Lihat status dan estimasi selesai

#### Lihat Antrian
1. Klik **"Antrian"** di navbar
2. Filter berdasarkan status (Semua / Proses / Booking / Nunggu Part)

---

### Untuk Admin

#### Login
1. Klik **"Dashboard Admin"** di navbar
2. Masukkan email dan password admin
3. Klik **"Login"**

#### Update Status Booking
1. Buka Panel Admin
2. Scroll ke tabel antrian bawah
3. Klik dropdown status di kolom **"Status"**
4. Pilih status baru → WhatsApp otomatis terbuka untuk kirim notif ke pelanggan

#### Status yang Tersedia
| Status | Arti |
|---|---|
| 🕒 Booking | Customer sudah booking, belum datang |
| 🔧 Proses | Kendaraan sedang dikerjakan |
| 📦 Menunggu Part | Menunggu spare part |
| 🔍 Quality Check | Pengecekan kualitas akhir |
| ✅ Selesai | Servis selesai, siap diambil |
| ❌ Batal | Booking dibatalkan |

#### Edit Data Booking
1. Klik tombol **"EDIT"** di baris booking
2. Ubah jam mulai servis, estimasi, atau kategori servis
3. Klik **"SAVE"**

#### Kelola Layanan & Harga
1. Di Panel Admin, scroll ke bagian **"Kelola Layanan & Harga"**
2. Isi form → klik **"Tambah Layanan"**
3. Untuk edit: klik **"EDIT"** di baris layanan
4. Untuk nonaktifkan: klik tombol **AKTIF/NONAKTIF**

#### Atur Status Mekanik
1. Di Panel Admin, bagian **"Atur Status Mekanik & Bengkel"**
2. Ubah total mekanik, mekanik standby, dan status bengkel
3. Klik **"Update Status"**
4. Status akan langsung tampil di halaman utama

#### Notifikasi WhatsApp
Saat admin mengubah status booking, browser otomatis membuka WhatsApp Web dengan pesan yang sudah terisi. Admin tinggal klik **Send**.

> ⚠️ Pastikan WhatsApp Web sudah login dengan nomor admin sebelum mengubah status.

---

## 🚢 Deploy

```bash
# Deploy ke GitHub Pages
npm run deploy
```

Pastikan `vite.config.js` sudah memiliki:
```js
base: '/bengkelin/'
```

Dan `package.json`:
```json
"homepage": "https://yugata-dev.github.io/bengkelin"
```

---

## 👨‍💻 Developer

**Yugata Halimawan**
- GitHub: [@yugata-dev](https://github.com/yugata-dev)

---

## 📄 Lisensi

Project ini dibuat untuk keperluan portofolio dan klien bengkel. Silakan gunakan sebagai referensi dengan mencantumkan kredit.
