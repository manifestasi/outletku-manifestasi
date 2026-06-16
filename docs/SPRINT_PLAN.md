# Sprint Plan & Development Roadmap — OutletKu

**Versi:** 1.5 (2026-06-16) — sinkronisasi stack proyek aktual: Laravel 13, PHP 8.3, Fortify, Inertia v3, React 19, Tailwind CSS v4, Vite 8, Wayfinder, TSX  
**Metodologi:** Agile Sprint (2 minggu per sprint)  
**Developer:** Solo / Tim Kecil  
**AI Agent:** Gunakan dokumen ini sebagai task list di IDE  

---

## Sprint 0 — Setup & Boilerplate (Minggu 1)

### Task List
- [ ] Gunakan project Laravel 13 yang sudah ada (`laravel/framework` ^13.7, PHP ^8.3)
- [ ] Gunakan Tailwind CSS v4 + Vite 8 yang sudah terpasang
- [ ] Gunakan Laravel Fortify + Inertia React starter kit yang sudah terpasang
- [ ] Gunakan Inertia v3 + React 19 + TypeScript
- [ ] Setup struktur `resources/js/pages`, `resources/js/layouts`, dan `resources/js/components`
- [ ] Install package role saat implementasi role: `composer require spatie/laravel-permission`
- [ ] Install package fitur saat dibutuhkan: maatwebsite/excel, barryvdh/laravel-dompdf, spatie/laravel-activitylog, intervention/image
- [ ] Gunakan npm yang sudah ada: lucide-react, sonner, Radix UI; install library chart saat fitur grafik dikerjakan
- [ ] Setup database MySQL, buat `.env`
- [ ] Buat layout utama: `resources/js/layouts/app-layout.tsx` (sidebar + topbar)
- [ ] Buat layout guest/auth: `resources/js/layouts/auth-layout.tsx`
- [ ] Buat layout kasir: `resources/js/layouts/kasir-layout.tsx` (minimalis, dark, untuk POS)
- [ ] Setup Roles: owner, manager, cashier (RolePermissionSeeder)
- [ ] Buat skeleton `BusinessScope` untuk multi-tenancy; aktifkan di model tenant setelah migration/model Sprint 1 dibuat
- [ ] Buat middleware: `SetActiveBusiness`, `CheckOutletAccess`
- [ ] Push ke Git repository

---

## Sprint 1 — Foundation: Auth + Business + Outlet (Minggu 2–3)

### Business Settings (wajib sebelum register)
- [ ] Model & Migration: `businesses` (termasuk kolom `slug`)
- [ ] Migration: tambah kolom `business_id` ke `users`

### Auth & Onboarding
- [ ] Halaman Register → auto-buat `Business` + assign role `owner`
  - Sync: `users.name` = `businesses.owner_name`, `businesses.email` = owner email, `slug` dari nama bisnis
- [ ] Halaman Login
- [ ] Redirect after login ke `/dashboard`
- [ ] Halaman Setup Bisnis (isi nama usaha, dll) jika belum lengkap

### Business Settings (lanjutan)
- [ ] Form update info bisnis (nama, logo, alamat)
- [ ] Upload logo bisnis
- [ ] Middleware/role gate: update bisnis **owner only**; manager tidak boleh akses halaman/form setting bisnis

### Outlet Management
- [ ] Migration: `outlets`, `outlet_user`
- [ ] Model: `Outlet` (dengan scope `business_id`)
- [ ] `OutletController`: index, create, store, show, edit, update, destroy (nonaktifkan outlet)
- [ ] Pages React Inertia TSX: daftar outlet (card/table), form tambah/edit outlet
- [ ] Assign user ke outlet (form + endpoint)
- [ ] Seeder: 3 outlet per bisnis demo (via `OutletSeeder`, lihat `DATABASE_SCHEMA.md` §Seeders)

### User Management
- [ ] Migration: tambah kolom `pin`, `pin_failed_attempts`, `pin_locked_until` ke `users` (NULL untuk non-kasir)
- [ ] `UserController`: CRUD user (owner only)
- [ ] `UserController@destroy` = nonaktifkan user (`is_active=false`), bukan hard delete
- [ ] Form tambah user + pilih role + assign outlet
- [ ] Form kasir: set/reset PIN (bcrypt); field PIN wajib saat create kasir
- [ ] Seeder: `BusinessSeeder` (2 bisnis demo), `UserSeeder` (4 user per bisnis: 1 owner, 1 manager, 2 cashier)

---

## Sprint 2 — Produk & Stok (Minggu 4–5)

### Kategori Produk
- [ ] Migration: `categories`
- [ ] Model + Controller: CRUD kategori (`CategoryController`)

### Produk
- [ ] Migration: `products`
- [ ] Model: `Product`
- [ ] `ProductController`: index, create, store, edit, update, destroy (nonaktifkan produk `is_active=false`)
- [ ] Pages React Inertia TSX: daftar produk (dengan filter kategori), form produk
- [ ] Upload gambar produk (opsional)
- [ ] Seeder: `CategorySeeder` (5 kategori per bisnis), `ProductSeeder` (10 produk per bisnis demo)

### Stok
- [ ] Migration: `stocks`, `stock_movements`
- [ ] Model: `Stock`, `StockMovement`
- [ ] `StockService`: `increaseStock()`, `decreaseStock()`, `adjustStock()`
- [ ] `StockController`: 
  - index (lihat semua stok semua outlet)
  - byOutlet (stok per outlet)
  - restock (form + proses tambah stok)
  - adjust (koreksi manual)
  - movements (histori)
  - lowAlert (daftar stok menipis)
- [ ] Role gate: restock/adjust/index penuh → owner/manager; kasir hanya `byOutlet` outlet assigned (read-only)
- [ ] Pages React Inertia TSX: tabel stok, form restock, histori pergerakan stok
- [ ] Badge/alert untuk stok menipis
- [ ] Seeder: `StockSeeder` (isi stok awal untuk semua outlet)

### Dashboard Stok Dasar (ringkas)
- [ ] `DashboardService`: widget stok kritis
- [ ] Page React Inertia dashboard stok dasar (stat card + alert stok menipis)

---

## Sprint 3 — PIN Login, Shift & Transaksi POS (Minggu 6–7)

### PIN Login & Shift (wajib sebelum POS)
- [ ] Migration: tabel `shifts` (dengan `business_id`)
- [ ] Model: `Shift` dengan relationships ke `Outlet`, `User`, `Transaction`
- [ ] `KasirAuthController`: selectOutlet, selectUser, showPin, verifyPin, logout
- [ ] `ShiftController`: openForm, open, closeForm, close, forceClose
- [ ] Middleware: `KasirShiftMiddleware`
- [ ] Pages React Inertia TSX:
  - `/kasir/{business:slug}` — halaman pilih outlet (card grid, mobile-friendly)
  - `/kasir/{business:slug}/{outlet}` — pilih nama kasir (avatar + nama)
  - `/kasir/{business:slug}/{outlet}/{user}/pin` — keypad PIN (React state)
  - `/shift/open` — form input kas awal
  - `/shift/close` — form tutup shift + rekap

### Transaksi Penjualan
- [ ] Migration: `transactions` (termasuk `is_void`, `voided_at`), `transaction_items`
- [ ] Model: `Transaction`, `TransactionItem`
- [ ] `TransactionController`: index, create, store, show, destroy (void via `is_void`; **owner/manager only**)
- [ ] Route owner/manager:
  - `GET /transactions` → `TransactionController@index`
  - `GET /transactions/create` → `TransactionController@create`
  - `POST /transactions` → `TransactionController@store` (`shift_id` NULL)
  - `GET /transactions/{transaction}` → `TransactionController@show`
  - `DELETE /transactions/{transaction}` → `TransactionController@destroy` (void)
- [ ] Form POS (create):
  - Kasir: `/pos`, outlet otomatis dari `active_outlet_id`
  - Owner/manager: `/transactions/create`, pilih outlet, `shift_id` NULL
  - Search & tambah produk ke keranjang
  - Hitung subtotal & total otomatis dengan React state
  - Input diskon (nominal / % — simpan nilai nominal final ke kolom `discount`)
  - Pilih metode bayar: cash/tunai, transfer, other/lainnya
  - Submit → simpan + kurangi stok
- [ ] Pages React Inertia TSX: daftar transaksi (filter by outlet/tanggal), detail transaksi
- [ ] Generate invoice number otomatis
- [ ] Print struk sederhana (browser print CSS)
- [ ] Update `TransactionController@store` → otomatis isi `shift_id` (wajib untuk kasir)
- [ ] Update dashboard dasar: omzet hari ini (pakai `transactions.total`, exclude `is_void=true`, filter hari memakai `transaction_date`) + jumlah transaksi valid (exclude `is_void=true`, filter hari memakai `transaction_date`)
- [ ] Halaman daftar & detail shift untuk owner/manager
- [ ] Route shift owner/manager:
  - `GET /shifts` → `ShiftController@index`
  - `GET /shifts/{shift}` → `ShiftController@show`
  - `POST /shifts/{shift}/force-close` → `ShiftController@forceClose`
- [ ] Seeder: `ShiftSeeder` (shift & transaksi demo 7 hari)

---

## Sprint 4 — Keuangan (Minggu 8–9)

### Pengeluaran
- [ ] Migration: `expense_categories`, `expenses`, `cash_transfers`
- [ ] Model + Controller: CRUD expense, kategori pengeluaran (via `ExpenseController`), cash transfer, dan `FinanceController` (ringkasan harian + L/R)
- [ ] Form input pengeluaran (outlet, kategori, jumlah, tanggal, deskripsi, foto struk)
- [ ] Form transfer kas (outlet → outlet, outlet → owner, owner → outlet)
- [ ] Pages React Inertia TSX: daftar pengeluaran (filter by outlet/kategori/tanggal)
- [ ] Seeder: `ExpenseCategorySeeder` (kategori default: Operasional, Bahan Baku, Gaji, Lain-lain), `ExpenseSeeder` (record pengeluaran demo), `CashTransferSeeder` (transfer demo)

### Ringkasan Keuangan
- [ ] `FinanceService`:
  - Semua agregat pendapatan/omzet pakai `transactions.total` dan exclude transaksi `is_void=true`; HPP (COGS) juga exclude transaksi `is_void=true`
  - `getDailySummary(outletId, date)` → keys `{ income, expense, netCash, totalTransactions }`; `income` pakai `transactions.total`, `totalTransactions` hanya transaksi valid (`is_void=false`), filter tanggal memakai `transaction_date`
  - `getProfitLoss(?outletId, startDate, endDate)` → pendapatan (`transactions.total`), HPP, gross profit, biaya (`expense_date` [AND `outlet_id` jika outlet dipilih]), net profit; filter transaksi memakai `transaction_date`, exclude `is_void=true`, dan `outletId = null` berarti agregat semua outlet dalam bisnis tenant
- [ ] Halaman ringkasan keuangan harian per outlet
- [ ] Halaman laporan L/R (form pilih periode + outlet)

---

## Sprint 5 — Laporan & Export (Minggu 10–11)

### Laporan
- [ ] `ReportController` + `ReportService` (agregat penjualan/omzet pakai `transactions.total`; exclude transaksi `is_void=true`; filter periode transaksi memakai `transaction_date`):
  - Laporan Penjualan (filter tanggal memakai `transaction_date`, outlet)
  - Laporan Stok (masuk, keluar, sisa)
  - Laporan Pengeluaran per kategori
  - Laporan Laba Rugi
- [ ] Pages React Inertia TSX: tabel laporan yang bisa difilter
- [ ] Grafik omzet mingguan/bulanan: install library chart saat implementasi (mis. `recharts`) atau tampilkan tabel/stat card dulu; agregat transaksi memakai `transaction_date` (bukan `created_at`)

### Export
- [ ] Export Excel (install maatwebsite/excel saat Sprint 5 jika belum terpasang):
  - Laporan penjualan
  - Laporan L/R
  - Laporan stok
- [ ] Export PDF (install dompdf saat Sprint 5 jika belum terpasang):
  - Laporan L/R format rapi
  - Laporan penjualan
  - Laporan shift (rekap per shift kasir)

---

## Sprint 6 — Dashboard Lanjutan & Notifikasi (Minggu 12–13)

### Dashboard Lanjutan
- [ ] `DashboardService`: ambil semua data widget
- [ ] Widget cards: omzet hari ini (pakai `transactions.total`, filter tanggal memakai `transaction_date`), total transaksi valid (exclude `is_void=true`, filter hari memakai `transaction_date`), outlet aktif (`is_active=true`), stok kritis
- [ ] Card laba bersih hari ini — tampil hanya jika modul keuangan Sprint 4 sudah live
- [ ] Grafik: omzet 7 hari terakhir (harian); install library chart saat implementasi jika dibutuhkan; agregat harian memakai `transaction_date` (bukan `created_at`)
- [ ] Tabel: 5 transaksi valid terbaru (exclude `is_void=true`)
- [ ] Tabel: 5 produk terlaris bulan ini (rank by `sum(transaction_items.quantity)` dari transaksi `is_void=false`, filter bulan memakai `transaction_date`)
- [ ] Tabel: ringkasan per outlet (shift, trx hari ini, omzet hari ini; filter hari memakai `transaction_date`)
- [ ] Banner/alert produk stok menipis (per outlet + produk, `quantity <= low_stock_threshold`)

### Notifikasi
- [ ] Migration: `notifications`
- [ ] `NotificationController`: index, markRead, markAllRead
- [ ] Job: `CheckLowStock` (scheduler harian) → notifikasi in-app ke owner + manager jika `quantity <= low_stock_threshold`
- [ ] Job: `SendDailyRevenueSummary` — ringkasan omzet harian in-app ke owner + manager (scheduler malam; pakai `transactions.total`, exclude `is_void=true`, filter hari memakai `transaction_date`)
- [ ] Trigger notifikasi selisih kas absolut >= Rp 10.000 ke owner (saat tutup shift)
- [ ] Bell icon + badge di topbar React
- [ ] Halaman React Inertia daftar notifikasi (mark as read)
- [ ] Laravel Scheduler setup di `routes/console.php` (Laravel 13)

---

## Sprint 7 — Super Admin Panel & Audit Log (Minggu 14–15)

### Super Admin Panel
- [ ] Migration: tabel `super_admins`
- [ ] Model: `SuperAdmin` (guard: `super_admin`)
- [ ] Setup guard di `config/auth.php`
- [ ] Register route file `routes/superadmin.php` di `bootstrap/app.php` (Laravel 13)
- [ ] Middleware: `SuperAdminAuth`
- [ ] Layout: `resources/js/layouts/super-admin-layout.tsx` (sidebar berbeda dari tenant)
- [ ] `SuperAdmin\AuthController`: showLogin, login, logout
- [ ] `SuperAdmin\DashboardController`: index (semua widget statistik, exclude transaksi `is_void=true`)
- [ ] `SuperAdmin\TenantController`: index, show, toggleActive, resetPassword, destroy, impersonate, stopImpersonate
- [ ] `SuperAdmin\AnalyticsController`: index, growth, activity, churn (`activity` = grafik aktivitas harian platform: transaksi valid + login tenant; install library chart saat dibutuhkan; agregat transaksi exclude `is_void=true`; agregat transaksi harian memakai `transaction_date`)
- [ ] `SuperAdmin\SystemController`: index, logs, queues
- [ ] Pages React Inertia TSX semua halaman super admin
- [ ] Seeder: `SuperAdminSeeder`
- [ ] Update `Business` model: Observer/Listener untuk update `last_activity_at` saat login tenant atau transaksi valid
- [ ] Test: pastikan super admin hanya bisa akses route tenant lewat mode impersonate yang diaudit, dan tenant tidak bisa akses route super admin

### Audit Log Tenant
- [ ] Install dan konfigurasi `spatie/laravel-activitylog` untuk aksi tenant sensitif jika belum terpasang
- [ ] Catat create/update/nonaktifkan produk, stok adjustment, void transaksi, reset PIN, dan create/update/nonaktifkan user/outlet
- [ ] `AuditLogController` + page owner/manager untuk melihat audit log tenant sendiri (filter user, aksi, tanggal)

---

## Sprint 8 — Polish, QA & Launch (Minggu 16–17)

### UI/UX Polish
- [ ] Responsive check semua halaman (mobile/tablet/desktop)
- [ ] Loading state (spinner, disabled button saat submit)
- [ ] Flash message sukses/error konsisten
- [ ] Empty state UI (saat belum ada data)
- [ ] Konfirmasi hapus (modal/dialog)

### Quality Assurance
- [ ] Manual testing semua fitur
- [ ] Test edge case stok negatif (validasi)
- [ ] Test multi-tenant (pastikan data tidak bocor antar tenant)
- [ ] Test role permission (kasir tidak bisa akses halaman owner)

### Deployment
- [ ] Setup VPS (Nginx + PHP 8.3+ + MySQL)
- [ ] Setup domain + SSL
- [ ] Deploy via Git + Envoyer atau manual
- [ ] Buat user demo / akun demo publik
- [ ] Setup halaman root sederhana yang mengarah ke login/demo (landing page marketing penuh masuk Fase 4)

---

## Sprint 9+ — Fase 4 Backlog (Bulan 5–6)

### Freemium & Monetisasi
- [ ] Model plan/limit freemium (jumlah outlet, user, produk, transaksi)
- [ ] UI pemilihan plan dan halaman upgrade/downgrade
- [ ] Enforcement limit fitur sesuai plan

### Onboarding Lanjutan / Self-Service
- [ ] Wizard onboarding bisnis, outlet pertama, produk awal, dan user kasir
- [ ] Checklist onboarding di dashboard owner
- [ ] Demo data reset/self-service untuk akun demo

### Marketing
- [ ] Landing page marketing penuh (fitur, pricing, FAQ, CTA register/demo)
- [ ] Halaman root produksi mengarah ke landing page marketing penuh

---

## Checklist AI Agent (untuk IDE)

Gunakan daftar di bawah sebagai prompt ke AI agent saat coding:

```
Buat migration untuk tabel [nama_tabel] sesuai DATABASE_SCHEMA.md
Buat Model [NamaModel] dengan relationships dan Business scope
Buat Controller [NamaController] dengan method [list_method]
Buat Form Request [NamaRequest] dengan validasi
Buat Page/Component React Inertia [nama_page] dengan Tailwind (mobile responsive)
Buat Seeder [NamaSeeder] dengan data dummy realistis
```

---

## Estimasi Total Waktu

| Sprint | Durasi | Output |
|---|---|---|
| Sprint 0 | 1 minggu | Setup & boilerplate |
| Sprint 1 | 2 minggu | Auth, bisnis, outlet, user |
| Sprint 2 | 2 minggu | Produk, stok, dashboard stok dasar |
| Sprint 3 | 2 minggu | PIN login, shift, transaksi POS |
| Sprint 4 | 2 minggu | Keuangan & L/R |
| Sprint 5 | 2 minggu | Laporan & export |
| Sprint 6 | 2 minggu | Dashboard lanjutan & notifikasi |
| Sprint 7 | 2 minggu | Super Admin Panel & audit log |
| Sprint 8 | 2 minggu | Polish & launch |
| Sprint 9+ | 4–8 minggu | Fase 4: freemium, onboarding lanjutan, landing page marketing penuh |
| **Total hingga launch** | **~17 minggu** | **Production launch setelah Sprint 8** |
| **Total termasuk Fase 4** | **~21–25 minggu** | **Fase 4 selesai setelah Sprint 9+** |
