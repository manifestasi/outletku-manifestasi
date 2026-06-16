# PRD — OutletKu: Sistem Manajemen Outlet & Akuntansi untuk UMKM

**Versi:** 1.5 (2026-06-16) — sinkronisasi stack proyek aktual: Laravel 13, PHP 8.3, Fortify, Inertia v3, React 19, Tailwind CSS v4, Vite 8, Wayfinder, TSX
**Tanggal:** 2026-06-16  
**Status:** Ready for Development  
**Tech Stack:** Laravel 13, PHP 8.3+, Inertia.js v3 + React 19 + TypeScript + Tailwind CSS v4, MySQL 8.0, Laravel Fortify + Inertia React starter kit, Laravel Wayfinder  
**Model Bisnis:** SaaS — Gratis (fase awal), Freemium (rencana jangka panjang)

---

## 1. Ringkasan Produk

**OutletKu** adalah aplikasi web SaaS berbasis Laravel yang membantu pemilik
usaha kecil (UMKM) seperti gerobak kebab, minuman, gorengan, dan sejenisnya
untuk mengelola:

- Cabang / outlet mereka
- Stok & inventori barang
- Keuangan (pemasukan & pengeluaran)
- Laporan harian, mingguan, dan bulanan

Fokus utama: **mudah dipakai**, **ringan di HP**, dan **tidak perlu keahlian
akuntansi**.

---

## 2. Masalah yang Diselesaikan

| Masalah                                  | Solusi OutletKu                     |
| ---------------------------------------- | ----------------------------------- |
| Pemilik tidak tahu stok tiap outlet      | Dashboard ringkasan stok kritis (Sprint 2); alert stok menipis per outlet + produk (Sprint 6) |
| Catatan keuangan manual di buku / kertas | Pencatatan digital otomatis         |
| Tidak bisa pantau omzet semua cabang     | Laporan omzet terpusat              |
| Pegawai curang / barang hilang           | Histori transaksi tercatat          |
| Tidak ada laporan laba rugi              | Laporan L/R otomatis                |
| Login email/password ribet buat kasir    | Login PIN 6 digit + sistem shift    |

---

## 3. Target Pengguna

### Primary User: Pemilik Usaha (Owner)

- Usia 25–50 tahun
- Punya 1–10 outlet/gerobak
- Tidak ahli akuntansi
- Akses via HP (mobile-first)
- Login dengan email/password (standar)

### Secondary User: Karyawan / Kasir Outlet

- Bertugas input transaksi harian via POS
- Login cukup dengan PIN 6 digit yang ditetapkan owner
- Akses POS + lihat stok outlet yang di-assign (untuk cek ketersediaan di kasir)
- Tidak punya akses laporan keuangan, restock/adjust stok, void transaksi, user management, atau setting bisnis
- Hanya akses outlet yang ditugaskan
- Wajib buka/tutup shift setiap hari

### Super Admin (Developer / Operator SaaS)

- Hanya kamu sendiri sebagai developer/operator
- Panel terpisah: `/superadmin`
- Pantau semua tenant, registrasi, aktivitas platform

---

## 4. Fitur Utama (Feature List)

### 4.1 Manajemen Outlet

- Tambah, edit, nonaktifkan outlet/gerobak
- Info outlet: nama, alamat, nomor, foto
- Assign karyawan ke outlet tertentu
- Status outlet: aktif / non-aktif

### 4.2 Manajemen Produk & Stok

- CRUD produk (nama, harga jual, harga modal, satuan); `destroy` = nonaktifkan (`is_active=false`), bukan hard delete
- Stok per outlet (stok bisa berbeda tiap cabang)
- Input stok masuk / restock (owner/manager ke outlet)
- Peringatan stok menipis (low stock alert)
- Kategori produk

### 4.3 Transaksi Penjualan (Point of Sale sederhana)

- Input penjualan harian (kasir/karyawan)
- Pilih produk + qty → hitung otomatis
- Stok otomatis berkurang setelah transaksi
- Riwayat transaksi per hari per outlet
- Void transaksi (soft void via `is_void`, stok dikembalikan; agregat omzet pakai `transactions.total`, HPP/laba rugi exclude void) — **hanya owner dan manager**

### 4.4 Keuangan & Akuntansi (Sederhana)

**MVP (Fase 1 — otomatis dari transaksi):**
- Pencatatan pemasukan (uang masuk dari penjualan) — otomatis saat transaksi POS tersimpan

**Fase 2 (Sprint 4):**
- Pencatatan pengeluaran (sewa, listrik, bahan baku, dll)
- Kategori pengeluaran (operasional, bahan baku, gaji, lain-lain)
- Ringkasan kas harian per outlet
- Laporan laba rugi sederhana (pendapatan - HPP - biaya operasional)
- Transfer uang antar outlet / setoran ke owner

### 4.5 Laporan *(Fase 2 — Sprint 5)*

- Laporan omzet harian / mingguan / bulanan (pakai `transactions.total`, exclude void, filter periode memakai `transaction_date`)
- Laporan stok (masuk, keluar, sisa)
- Laporan pengeluaran per kategori
- Laporan laba rugi per outlet dan semua outlet
- Export laporan ke PDF / Excel; rekap shift kasir diexport PDF

### 4.6 Manajemen Pengguna & Akses

- Role: Owner, Manajer, Kasir
- Multi-tenant: setiap owner punya data terpisah
- **Owner:** akses penuh semua fitur dan outlet; kelola user (termasuk set/reset PIN kasir) & setting bisnis; void transaksi
- **Manajer:** akses laporan + operasional (restock, adjust stok, void transaksi); tidak bisa kelola user/setting bisnis
- **Kasir:** POS + lihat stok outlet yang di-assign; login via PIN; tidak bisa restock/adjust/void/laporan keuangan

### 4.7 Notifikasi

- Alert stok menipis di dashboard *(MVP — Sprint 2)*
- Job `CheckLowStock` (scheduler harian): notifikasi in-app ke **owner + manager** jika `quantity <= low_stock_threshold` *(Fase 2 — Sprint 6)*
- Ringkasan omzet harian in-app ke **owner + manager** (pakai `transactions.total`, exclude void, filter hari memakai `transaction_date`) *(Fase 2 — Sprint 6)*
- Notifikasi selisih kas shift (absolut >= Rp 10.000) ke owner saat tutup shift *(Fase 2 — Sprint 6)*
- Notifikasi in-app (bell icon, daftar notifikasi) *(Fase 2 — Sprint 6)*
- Email digest *(opsional, fase lanjut)*

### 4.8 Dashboard (Owner/Manager)

**MVP (Fase 1 — Sprint 2–3):**
- Sprint 2: ringkasan stok kritis
- Sprint 3: total omzet hari ini (pakai `transactions.total`, exclude `is_void=true`, filter hari memakai `transaction_date`) + jumlah transaksi valid (exclude `is_void=true`, filter hari memakai `transaction_date`) setelah POS tersedia

**Fase 2 (Sprint 6 — dashboard lanjutan):**
- Stat card outlet aktif (`outlets.is_active = true` dalam bisnis tenant)
- 5 produk terlaris bulan ini (rank by `sum(transaction_items.quantity)` dari transaksi valid `is_void=false`, filter bulan memakai `transaction_date`)
- Tabel 5 transaksi valid terbaru (exclude `is_void=true`)
- Grafik omzet 7 hari terakhir (harian; agregat harian memakai `transaction_date`; agregat mingguan/bulanan ada di halaman Laporan Sprint 5)
- Ringkasan per outlet (status shift, transaksi & omzet hari ini; filter hari memakai `transaction_date`)
- Banner/alert produk stok menipis (per outlet + produk)
- Laba bersih hari ini — tampil hanya jika modul keuangan Sprint 4 sudah tersedia

### 4.9 Audit Log Tenant *(Fase 3 — Sprint 7)*

- Catat aksi sensitif: create/update/nonaktifkan produk, stok adjustment, void transaksi, reset PIN, create/update/nonaktifkan user/outlet
- **Owner dan manager** dapat melihat audit log bisnis sendiri (scoped `business_id`)

---

## 5. Fitur PIN Login & Shift

### 5.1 Konsep

Kasir **tidak perlu** ingat email/password. Cukup:

1. Owner share link kasir: `https://outletku.id/kasir/{business:slug}`
2. Pilih outlet dalam bisnis tersebut
3. Pilih nama mereka dari daftar kasir outlet tersebut
4. Masukkan PIN 6 digit
5. Masuk → buka shift (isi kas awal) → halaman POS

Owner/Manager tetap pakai email + password normal.

### 5.2 Alur Login PIN

```
[Halaman Awal]
     ↓
[Pilih: Login Owner/Manager] atau [Login Kasir via PIN]
     ↓                                    ↓
[Form Email/Password]           [Buka /kasir/{business:slug}]
     ↓                                    ↓
[Dashboard Owner]             [Pilih Outlet dalam bisnis]
                                          ↓
                                [Pilih nama kamu (kasir)]
                                          ↓
                                [Masukkan PIN 6 digit]
                                          ↓
                                [Buka Shift → halaman /shift/open:
                                 isi uang kas awal]
                                          ↓
                                [Halaman POS Kasir]
```

### 5.3 Fitur Shift

| Fitur         | Keterangan                                                         |
| ------------- | ------------------------------------------------------------------ |
| Buka Shift    | Input kas awal, catat waktu mulai                                  |
| Tutup Shift   | Input kas akhir, rekap penjualan shift; export PDF rekap shift *(Fase 2 — Sprint 5)* |
| Histori Shift | Owner dan manager dapat melihat histori shift (daftar, detail, force-close) per outlet |
| Shift aktif   | Kasir hanya bisa transaksi saat shift sedang aktif                 |
| Overlap check | Hanya 1 shift `open` per outlet (enforce di aplikasi)              |

### 5.4 Keamanan PIN

- PIN di-hash dengan bcrypt sebelum disimpan (sama seperti password)
- Maksimal 5x salah → locked 15 menit
- Owner bisa reset PIN kasir kapan saja (form user management Sprint 1)
- Session POS kasir berakhir setelah tutup shift; jika shift aktif lebih dari 12 jam,
  kasir diarahkan untuk tutup shift sebelum bisa lanjut transaksi

### 5.5 User Stories PIN & Shift

```
Sebagai kasir, saya ingin login hanya dengan PIN tanpa ribet email/password,
agar bisa mulai kerja dengan cepat saat outlet ramai.

Sebagai owner/manager, saya ingin melihat laporan per shift (buka jam berapa,
tutup jam berapa, total penjualan valid), agar bisa audit kinerja kasir.

Sebagai kasir, saya ingin input uang kas awal saat buka shift,
agar ada catatan uang yang ada di laci kas sejak awal.
```

---

## 6. Super Admin Panel *(Fase 3 — Sprint 7)*

### 6.1 Konsep

Panel khusus di `/superadmin` yang hanya bisa diakses oleh kamu sebagai
developer/operator SaaS. Auth/session terpisah dari user tenant, tetapi panel
ini boleh membaca dan mengelola data tenant untuk monitoring/support.

### 6.2 Fitur Super Admin

#### Monitoring Registrasi & Tenant

- Total bisnis/tenant terdaftar
- Registrasi baru hari ini / minggu ini / bulan ini
- Grafik pertumbuhan registrasi (chart)
- 5 tenant terbaru daftar (urut `created_at` DESC)
- Daftar semua tenant (nama bisnis, email owner, tanggal daftar, status)
- Filter tenant: status bisnis (`is_active`) / Churn Risk (`last_activity_at` NULL atau tidak ada aktivitas dalam 30 hari terakhir, tenant `is_active=true`) / tanggal daftar
- Search tenant by nama / email

#### Monitoring Aktivitas

- Total transaksi valid platform hari ini (exclude void, filter hari memakai `transaction_date`)
- Total user aktif (login dalam 7 hari terakhir)
- Jumlah tenant dengan aktivitas dalam 30 hari terakhir (`last_activity_at >= now()-30d`)
- 5 tenant paling aktif by transaksi valid bulan ini (exclude void, filter bulan memakai `transaction_date`)
- Total outlet terdaftar di seluruh platform
- Tenant Churn Risk: tenant `is_active=true` yang `last_activity_at` NULL atau tidak ada aktivitas dalam 30 hari terakhir
- Grafik aktivitas harian platform (transaksi valid + login tenant) di `/superadmin/analytics` via endpoint `activity`; library chart dipilih/diinstall saat implementasi; agregat transaksi exclude `is_void=true`; agregat transaksi harian memakai `transaction_date`

#### Manajemen Tenant

- Lihat detail tenant (info bisnis, jumlah outlet, user, transaksi)
- Aktifkan / nonaktifkan tenant
- Reset password owner tenant
- Hapus tenant (soft delete)
- Impersonate: masuk sebagai tenant tertentu untuk support (wajib Sprint 7)

#### Sistem & Health

- Status server (uptime, disk, memory) — opsional via shell
- Log error terbaru (via Laravel Telescope atau log viewer)
- Antrian job (queue) — berapa job pending/gagal
- Versi aplikasi yang sedang berjalan

#### Statistik Platform *(ditampilkan di `/superadmin/analytics` atau `/superadmin/system`)*

- Total outlet terdaftar di seluruh platform
- Total produk terdaftar
- Total transaksi valid sepanjang waktu (exclude void)
- Rata-rata outlet per tenant

### 6.3 User Stories Super Admin

```
Sebagai operator SaaS, saya ingin melihat berapa tenant baru yang daftar
hari ini, agar bisa tahu apakah marketing/word-of-mouth bekerja.

Sebagai operator SaaS, saya ingin tahu tenant mana yang sudah tidak aktif
lebih dari 30 hari, agar bisa follow-up atau kirim email re-engagement.

Sebagai operator SaaS, saya ingin bisa masuk ke akun tenant tertentu
untuk troubleshooting, tanpa harus minta password mereka.
```

---

## 7. Fitur yang TIDAK Ada di Versi 1.0 (Out of Scope)

- Integrasi printer struk / POS hardware
- Pembayaran online / payment gateway
- Fitur hutang piutang (receivable/payable kompleks)
- Multi-currency
- Akuntansi double-entry penuh
- Mobile app native (iOS/Android)
- Marketplace produk

---

## 8. Persyaratan Non-Fungsional

| Aspek           | Target                                        |
| --------------- | --------------------------------------------- |
| Performa        | Halaman load < 2 detik                        |
| Mobile-friendly | Responsive, bisa dipakai di HP                |
| Keamanan        | Auth Laravel + role-based access + PIN hashed |
| Super Admin     | Akses hanya dari IP whitelist (opsional)      |
| Reliabilitas    | Uptime 99% (pakai hosting terpercaya)         |
| Skalabilitas    | Support sampai 500 tenant awal                |

---

## 9. Metrik Keberhasilan (Success Metrics)

- 100 tenant aktif dalam 3 bulan pertama
- Retention rate > 60% setelah 30 hari
- NPS > 7 dari survey pengguna
- Rata-rata input transaksi < 30 detik per sesi
- Rata-rata waktu login kasir via PIN < 10 detik

---

## 10. Roadmap Fase

| Fase             | Fitur                                                       | Target    |
| ---------------- | ----------------------------------------------------------- | --------- |
| **MVP (Fase 1)** | Outlet, Produk, Stok, Transaksi dasar, PIN Login, buka/tutup shift dasar, Dashboard dasar | Bulan 1–2 |
| **Fase 2**       | Laporan shift lanjutan, Keuangan, Transfer antar outlet, Laporan, Export PDF/Excel, Dashboard lanjutan, Notifikasi in-app | Bulan 3   |
| **Fase 3**       | Super Admin Panel, Audit log tenant (viewer: owner/manager) | Bulan 4   |
| **Fase 4**       | Freemium plan, onboarding lanjutan/self-service, landing page marketing penuh | Bulan 5–6 |
