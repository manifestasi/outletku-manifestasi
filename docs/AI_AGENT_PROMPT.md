# AI Agent Master Prompt — OutletKu

**Versi:** 1.5 (2026-06-16) — sinkronisasi stack proyek aktual: Laravel 13, PHP 8.3, Fortify, Inertia v3, React 19, Tailwind CSS v4, Vite 8, Wayfinder, TSX

Dokumen ini adalah **prompt utama** yang di-paste ke AI agent di IDE (Cursor, Windsurf, Claude Code, dll)
di awal sesi kerja. Berisi semua konteks yang dibutuhkan AI agar bisa langsung coding tanpa banyak penjelasan ulang.

---

## CARA PAKAI

1. Buka IDE dengan AI agent (Cursor / Windsurf / Claude Code)
2. Buka semua file `.md` di folder `docs/` sebagai konteks (drag ke chat, atau `@docs`)
3. Copy-paste prompt di bawah sebagai **pesan pertama** ke AI agent
4. Setelah itu, langsung kasih perintah task spesifik

---

## ═══════════════════════════════════════════
## MASTER PROMPT — PASTE INI KE AI AGENT
## ═══════════════════════════════════════════

```
Kamu adalah senior Laravel developer yang sedang membangun aplikasi SaaS bernama OutletKu.

## KONTEKS PROYEK

OutletKu adalah SaaS manajemen outlet untuk UMKM Indonesia (gerobak, warung, toko kecil).
Pemilik usaha bisa pantau stok, transaksi, dan keuangan semua outlet dari satu dashboard.

### Tech Stack
- Framework  : Laravel 13, PHP 8.3+
- Frontend   : Inertia.js v3 + React 19 + TypeScript + Tailwind CSS v4
- Database   : MySQL 8.0
- Auth       : Laravel Fortify + Inertia React starter kit; guard `web` untuk tenant, `super_admin` untuk operator
- Routing FE : Laravel Wayfinder (`@/actions` dan `@/routes`) untuk link/form React; hindari hardcoded URL jika route function sudah tersedia
- Package terpasang saat ini:
               inertiajs/inertia-laravel ^3.0, laravel/fortify ^1.37,
               laravel/framework ^13.7, laravel/wayfinder ^0.1,
               @inertiajs/react ^3.0, React 19, Tailwind CSS v4, Vite 8,
               @laravel/passkeys, lucide-react, sonner, Radix UI
- Package rencana fitur:
               spatie/laravel-permission untuk role, spatie/laravel-activitylog untuk audit,
               maatwebsite/excel untuk export Excel, barryvdh/laravel-dompdf untuk PDF,
               intervention/image untuk optimasi gambar, dan library chart jika dashboard/laporan butuh grafik

### Arsitektur Multi-Tenancy
- Single database, semua tabel tenant-owned punya kolom `business_id`
- Global Scope `BusinessScope` otomatis filter query berdasarkan `auth()->user()->business_id`
- JANGAN pernah query tanpa scope ini kecuali di Super Admin dan route publik kasir sebelum login
- Route publik kasir wajib memakai slug bisnis (`/kasir/{business:slug}`) dan validasi manual `business_id` pada outlet/user

### Roles (via package role/permission)
- `owner`   : akses penuh semua fitur dan semua outlet; kelola user (set/reset PIN kasir); void transaksi
- `manager` : akses laporan + operasional (restock, adjust, void); tidak bisa kelola user/setting bisnis
- `cashier` : POS + lihat stok outlet assigned (read-only); login via PIN; tidak restock/adjust/void/laporan

### Guard
- `web`         : untuk owner/manager (email + password) dan kasir setelah PIN valid
- `super_admin` : untuk kamu sendiri sebagai operator SaaS (panel /superadmin)
- Kasir tidak punya email/password. Mereka login via PIN 6 digit yang di-hash bcrypt.

---

## FITUR UTAMA

### 1. Manajemen Outlet
CRUD outlet. Setiap outlet bisa punya beberapa kasir (pivot `outlet_user`).
Outlet punya status aktif/non-aktif; `destroy` = nonaktifkan (`is_active = false`), bukan hard delete.

### 2. Produk & Stok
- Produk punya: nama, kategori, harga jual, harga modal (HPP), satuan, gambar
- Stok disimpan per-outlet di tabel `stocks` (bukan di tabel products)
- Setiap perubahan stok WAJIB lewat `StockService`, catat ke `stock_movements`
- Ada low stock alert jika quantity <= low_stock_threshold

### 3. Transaksi (POS)
- Kasir input transaksi saat shift aktif
- Saat simpan transaksi: stok otomatis berkurang via StockService
- Harga di-snapshot ke `transaction_items` (tidak berubah walau produk diedit)
- Transaksi kasir terikat ke shift aktif (`shift_id`); transaksi langsung owner/manager boleh `shift_id = NULL`
- Void transaksi (`is_void`) hanya owner/manager

### 4. Shift & PIN Kasir
ALUR LOGIN KASIR:
  /kasir/{business:slug} → pilih outlet → pilih nama kasir → input PIN keypad → buka shift (isi kas awal) → POS

- PIN di-hash dengan bcrypt, disimpan di kolom `users.pin`
- Salah 5x → locked 15 menit (kolom `pin_locked_until`)
- Shift harus aktif agar kasir bisa akses POS (cek via middleware `KasirShiftMiddleware`)
- Akses POS kasir maksimal 12 jam per shift; setelah itu arahkan kasir ke tutup shift
- Tutup shift: isi kas akhir, hitung selisih, simpan ringkasan

### 5. Keuangan *(Fase 2 — Sprint 4)*
- Pengeluaran input manual (sewa, listrik, bahan baku, dll) per outlet
- Transfer kas antar outlet / setoran ke owner dicatat di `cash_transfers`
- Laporan L/R = pendapatan - HPP - pengeluaran operasional
- Semua agregat pendapatan/omzet pakai `transactions.total` dan exclude transaksi `is_void=true`; HPP (COGS) juga exclude transaksi `is_void=true`
- FinanceService: getDailySummary(), getProfitLoss()
- Pemasukan dari penjualan otomatis dari transaksi MVP (Sprint 3), bukan input manual

### 6. Laporan *(Fase 2 — Sprint 5)*
- Laporan penjualan, stok, pengeluaran, laba rugi
- Filter: by outlet, by tanggal range
- Export: Excel (maatwebsite/excel) dan PDF (dompdf) setelah package export dipasang

### 7. Super Admin Panel (/superadmin) *(Fase 3 — Sprint 7)*
- Guard terpisah `super_admin`, model `SuperAdmin`
- Auth/session terpisah dari user tenant
- Hanya controller Super Admin yang boleh query lintas tenant untuk monitoring/support
- Fitur: monitoring tenant, statistik platform, churn detection, impersonate tenant
- Semua aksi dicatat di activity log

### 8. Audit Log Tenant *(Fase 3 — Sprint 7)*
- Gunakan `spatie/laravel-activitylog` untuk aksi tenant sensitif setelah package audit dipasang
- Catat create/update/nonaktifkan produk, stok adjustment, void transaksi, reset PIN, dan create/update/nonaktifkan user/outlet
- Owner/manager hanya boleh melihat audit log bisnis sendiri

---

## DESAIN UI

### Nuansa
Bersih, profesional, seperti Accurate / Moka POS. Tidak terlalu colorful.

### Layout
- Sidebar gelap slate-900 (#0f172a) + area konten putih/abu muda
- Warna primer: Indigo (#6366f1)
- Super Admin sidebar lebih gelap (#020617) dengan aksen merah
- POS screen: split view — kiri produk, kanan keranjang
- PIN screen: full dark, keypad besar (mobile-friendly)

### Rules Tailwind
- Gunakan utility class di komponen React, mobile-first
- Card: bg-white border border-gray-100 rounded-xl shadow-sm
- Button primary: bg-indigo-600 hover:bg-indigo-700 text-white
- Badge hijau: bg-emerald-50 text-emerald-700
- Badge kuning: bg-amber-50 text-amber-700
- Badge merah: bg-red-50 text-red-700
- Sidebar nav active: bg-indigo-500/20 text-white
- Sidebar nav inactive: text-white/50 hover:text-white/80

---

## STRUKTUR FOLDER PENTING

Struktur di bawah adalah target akhir setelah semua sprint terkait selesai. Proyek memakai Inertia React TypeScript dengan folder frontend lowercase. Ikuti urutan sprint: `kasir-layout.tsx` boleh dibuat di Sprint 0 sebagai layout dasar, sedangkan controller/page/middleware kasir & shift dibuat saat Sprint 3. File Super Admin dibuat saat Sprint 7.

```
app/
├── Http/Controllers/
│   ├── Auth/
│   ├── Dashboard/DashboardController.php
│   ├── Outlet/OutletController.php
│   ├── User/UserController.php
│   ├── Product/ProductController.php
│   ├── Product/CategoryController.php
│   ├── Stock/StockController.php
│   ├── Transaction/TransactionController.php
│   ├── Finance/ExpenseController.php
│   ├── Finance/CashTransferController.php
│   ├── Finance/FinanceController.php
│   ├── Report/ReportController.php
│   ├── Notification/NotificationController.php
│   ├── AuditLog/AuditLogController.php    ← Sprint 7
│   ├── Kasir/KasirAuthController.php    ← PIN login
│   ├── Shift/ShiftController.php
│   └── SuperAdmin/                      ← panel operator
├── Http/Middleware/
│   ├── SetActiveBusiness.php
│   ├── CheckOutletAccess.php
│   ├── KasirShiftMiddleware.php
│   └── SuperAdminAuth.php
├── Models/
│   ├── Business.php, User.php, Outlet.php
│   ├── Product.php, Category.php
│   ├── Stock.php, StockMovement.php
│   ├── Transaction.php, TransactionItem.php
│   ├── Shift.php
│   ├── Expense.php, ExpenseCategory.php
│   ├── CashTransfer.php
│   ├── Notification.php
│   └── SuperAdmin.php
└── Services/
    ├── StockService.php
    ├── FinanceService.php
    ├── ReportService.php
    └── DashboardService.php

resources/js/
├── layouts/
│   ├── app-layout.tsx
│   ├── auth-layout.tsx
│   ├── kasir-layout.tsx
│   └── super-admin-layout.tsx
├── components/
│   ├── ui/
│   ├── app-sidebar.tsx
│   ├── app-header.tsx
│   └── flash-message.tsx
└── pages/
    ├── auth/
    ├── dashboard/
    ├── outlets/
    ├── users/
    ├── products/
    ├── stocks/
    ├── transactions/
    ├── finance/
    ├── reports/
    ├── notifications/
    ├── audit-logs/
    ├── kasir/
    ├── shifts/
    └── super-admin/
```

---

## ATURAN WAJIB SAAT CODING

1. SELALU ada `business_id` filter — jangan pernah query lintas tenant
2. SELALU cek permission/role sebelum aksi sensitif
3. SELALU gunakan `StockService` untuk ubah stok, jangan update langsung
4. SELALU gunakan `DB::transaction()` untuk operasi multi-tabel
5. SELALU snapshot harga ke `transaction_items` (bukan ambil dari produk saat render)
6. SELALU hash PIN dengan `bcrypt`, TIDAK PERNAH simpan plain text
7. SELALU gunakan Form Request untuk validasi input
8. GUNAKAN `DECIMAL(12,2)` untuk semua field uang dan quantity
9. Guard `super_admin` hanya boleh akses data tenant melalui panel Super Admin yang diaudit; tenant tidak boleh akses route Super Admin
10. Semua aksi di Super Admin dicatat via `spatie/laravel-activitylog` setelah package audit dipasang
11. Mulai Sprint 7, semua aksi tenant sensitif dicatat di audit log dan tetap scoped ke `business_id`
```

---

## ═══════════════════════════════════════════
## PROMPT PER TASK — GUNAKAN SESUAI KEBUTUHAN
## ═══════════════════════════════════════════

Setelah paste Master Prompt di atas, gunakan task prompt di bawah ini.
Langsung copy dan kirim ke AI agent.

---

### 🏗️ SETUP & BOILERPLATE

```
Buatkan setup awal project OutletKu:
1. Install semua package yang dibutuhkan (lihat tech stack di atas)
2. Buat skeleton BusinessScope (Global Scope Eloquent untuk multi-tenancy); aktifkan di model tenant setelah migration/model bisnis tersedia
3. Buat middleware: SetActiveBusiness, CheckOutletAccess
4. Setup RolePermissionSeeder dengan 3 role: owner, manager, cashier
5. Buat layout utama: resources/js/layouts/app-layout.tsx (sidebar gelap + topbar + main content)
6. Buat resources/js/layouts/auth-layout.tsx
7. Buat resources/js/layouts/kasir-layout.tsx (minimalis, dark, untuk POS)
8. Pastikan controller render halaman memakai Inertia::render()

Catatan urutan sprint:
- KasirShiftMiddleware dibuat saat Sprint 3 (PIN + Shift).
- Guard `super_admin`, SuperAdminAuth, dan SuperAdminLayout dibuat saat Sprint 7 (Super Admin Panel).

Gunakan Tailwind CSS v4. Konfigurasi tema/custom token memakai CSS-first `@theme` jika dibutuhkan. Sidebar app: `slate-900` (#0f172a); accent indigo-600. Super Admin: `slate-950` (#020617).
```

---

### 🔐 AUTH & ONBOARDING

```
Buatkan fitur registrasi dan login OutletKu:

REGISTRASI OWNER:
- Form: nama bisnis, nama pemilik, email, password, phone
- Saat register: auto-create Business + assign role 'owner' ke user baru
- Sync: `users.name` = `businesses.owner_name`, `businesses.email` = owner email, `slug` unik dari nama bisnis
- Redirect ke halaman setup bisnis jika logo/info belum lengkap

LOGIN OWNER/MANAGER:
- Standard Laravel Fortify (email + password) dengan view Inertia React dari starter kit
- Redirect ke /dashboard setelah login

LOGIN KASIR (PIN):
Route: GET /kasir/{business:slug} → pilih outlet dalam bisnis itu
Route: GET /kasir/{business:slug}/{outlet} → tampil daftar kasir outlet itu
Route: GET /kasir/{business:slug}/{outlet}/{user}/pin → tampil keypad PIN
Route: POST /kasir/{business:slug}/{outlet}/{user}/pin → verifikasi PIN
- Validasi: outlet & user harus milik `business` yang sama; user wajib role `cashier` dan ter-assign ke outlet
- Keypad 0-9 dengan React state (auto-submit saat 6 digit masuk via Inertia form); action URL pakai Wayfinder jika route sudah digenerate
- Jika salah: increment pin_failed_attempts, lock 15 menit setelah 5x salah
- Jika benar: Auth::login($user), simpan `active_outlet_id` + `active_business_slug` di session, redirect ke /shift/open

LOGIN SUPER ADMIN:
Route: GET /superadmin/login → tampil form login
Route: POST /superadmin/login → proses login dengan guard `super_admin`
- Redirect ke /superadmin setelah login
```

---

### 📦 PRODUK & KATEGORI

```
Buatkan fitur manajemen produk dan kategori:

MODEL:
- Product: business_id, category_id, name, sku, unit, selling_price, cost_price, image, is_active
- Category: business_id, name

CONTROLLER ProductController (resource):
- index: tabel produk dengan filter kategori + search nama
- create/store: form tambah produk, upload gambar; gunakan intervention/image hanya setelah package dipasang
- edit/update: form edit, bisa ganti gambar
- destroy: nonaktifkan produk (`is_active = false`), jangan hard delete

CONTROLLER CategoryController:
- CRUD simple (modal/inline, tidak perlu halaman terpisah)

PAGE (Inertia React):
- Tabel produk: kolom nama, kategori, harga jual, HPP, stok total semua outlet, status
- Badge kategori berwarna
- Tombol tambah produk di kanan atas
- Mobile responsive
```

---

### 📊 STOK

```
Buatkan fitur manajemen stok:

SERVICE StockService:
- increaseStock(outletId, productId, quantity, referenceType, referenceId, note)
- decreaseStock(outletId, productId, quantity, referenceType, referenceId)
- adjustStock(outletId, productId, newQuantity, note) → hitung selisih, catat ke movements
- triggerLowStockAlert(stock) → Sprint 2: flag di dashboard saja; Sprint 6: buat record `notifications` per outlet+produk via job `CheckLowStock`

Semua method: update tabel stocks + insert ke stock_movements (with quantity_before & after)

CONTROLLER StockController:
- index: tabel stok semua outlet (group by outlet, filter by produk)
- byOutlet: stok khusus satu outlet
- restock: form + proses tambah stok masuk (pakai increaseStock)
- adjust: form koreksi manual
- movements: histori pergerakan stok (filter by outlet, produk, tanggal)
- lowAlert: daftar produk yang quantity <= low_stock_threshold

Role gate:
- owner/manager: index, restock, adjust, movements, lowAlert
- cashier: byOutlet saja (read-only, outlet assigned)

PAGE (Inertia React):
- Tabel stok dengan badge merah jika stok kritis
- Form restock: pilih outlet, pilih produk, input qty, keterangan
```

---

### 💳 TRANSAKSI POS

```
Buatkan fitur transaksi POS untuk kasir:

CONTROLLER TransactionController:
- create: halaman POS (hanya bisa diakses jika shift aktif)
- store: simpan transaksi
  1. Buat Transaction (outlet_id, `shift_id` dari session untuk kasir, invoice_number, total, dll)
  2. Loop items: buat TransactionItem (snapshot nama + harga saat ini)
  3. Panggil StockService::decreaseStock() untuk setiap item
  4. Jika transaksi dibuat kasir, pastikan `shift_id` dari session aktif tersimpan
  5. Total shift final (`total_transactions`, `total_sales`) dihitung ulang saat tutup shift agar void transaksi tidak menggandakan counter
  Semua dalam DB::transaction()
- index: daftar transaksi (filter by outlet, shift, tanggal)
- show: detail transaksi + struk (bisa di-print via browser)
- destroy: void transaksi (kembalikan stok via increaseStock, set `is_void=true` + `voided_at`) — **owner/manager only**

Catatan akses & route:
- Kasir: `GET/POST /pos` (middleware `role:cashier` + `kasir.shift`), wajib shift aktif
- Owner/manager:
  - `GET /transactions` → daftar transaksi
  - `GET /transactions/create` → form transaksi langsung
  - `POST /transactions` → simpan transaksi langsung, pilih outlet, `shift_id` NULL
  - `GET /transactions/{transaction}` → detail transaksi
- Void: `DELETE /transactions/{transaction}` — owner/manager only
- Kolom `discount` menyimpan nilai nominal final; input % dihitung di UI/backend sebelum simpan

PAGE create (Inertia React POS):
- Layout split: kiri grid produk (3 kolom), kanan panel keranjang
- Search produk (filter real-time dengan React state)
- Klik produk → tambah ke keranjang
- Keranjang: nama, qty (+/-), subtotal per item, hapus
- Footer keranjang: subtotal, input diskon, total, pilih metode bayar (tunai/cash, transfer, lainnya/other)
- Tombol "Bayar" besar di bawah
- Badge "Stok tipis" di kartu produk jika stok <= threshold
```

---

### ⏱️ SHIFT

```
Buatkan fitur shift management:

CONTROLLER ShiftController:
- openForm: form buka shift (input kas awal)
- open: proses buka shift
  - Cek tidak ada shift lain aktif di outlet yang sama
  - Create Shift (business_id, outlet_id, user_id, opened_at=now(), opening_cash, status='open')
  - Simpan shift->id ke session('active_shift_id')
  - Redirect ke /pos
- closeForm: tampil ringkasan shift (total trx valid, total penjualan valid, hitungan kas)
- close: proses tutup shift
  - Hitung expected_cash = opening_cash + total penjualan cash (exclude `is_void=true`)
  - Simpan closing_cash, cash_difference, total_transactions, total_sales, closed_at
  - Set status = 'closed', Auth::logout(), hapus session kasir, redirect ke /kasir/{business:slug}
- index (owner/manager): `GET /shifts` — daftar semua shift, filter by outlet/kasir/tanggal
- show (owner/manager): `GET /shifts/{shift}` — detail shift + daftar transaksi di shift itu
- forceClose (owner/manager): `POST /shifts/{shift}/force-close` — tutup shift paksa jika kasir lupa

PAGE (Inertia React):
- openForm: halaman minimalis dark, form kas awal, tombol "Mulai Shift"
- closeForm: kartu ringkasan shift (jam buka-tutup, total transaksi valid, kas awal-akhir-selisih)
  - Selisih = 0: badge hijau. Nilai absolut selisih > 0 dan < 10rb: badge kuning. Nilai absolut selisih >= 10rb: badge merah
- Daftar shift: tabel dengan kolom kasir, buka, tutup, total, selisih, status
```

---

### 💰 KEUANGAN

```
Buatkan fitur keuangan (pengeluaran & laporan L/R):

MODEL:
- Expense: business_id, outlet_id, expense_category_id, amount, expense_date, description, attachment
- ExpenseCategory: business_id, name (Operasional, Bahan Baku, Gaji, Lain-lain)
- CashTransfer: business_id, from_outlet_id, to_outlet_id, amount, transfer_date, type, description

SERVICE FinanceService:
- Semua agregat pendapatan/omzet pakai `transactions.total` dan exclude transaksi `is_void=true`; HPP (COGS) juga exclude transaksi `is_void=true`
- getDailySummary(outletId, date):
  return { income, expense, netCash, totalTransactions }
  - income = sum(`transactions.total`) WHERE `is_void=false` dan filter tanggal memakai `transaction_date`
  - totalTransactions = count transaksi valid WHERE `is_void=false` dan filter tanggal memakai `transaction_date`
- getProfitLoss(?outletId, startDate, endDate):
  - `outletId = null` berarti agregat semua outlet dalam bisnis tenant (tetap scoped `business_id`)
  return {
    revenue        : sum(transactions.total) WHERE transactions.is_void=false AND transaction_date BETWEEN startDate AND endDate [AND outlet_id = outletId jika ada],
    cogs           : sum(transaction_items.cost_price * quantity) JOIN transactions WHERE transactions.is_void=false AND transaction_date BETWEEN startDate AND endDate [AND outlet_id = outletId jika ada],   // HPP
    grossProfit    : revenue - cogs,
    totalExpense   : sum(expenses.amount) WHERE expense_date BETWEEN startDate AND endDate [AND outlet_id = outletId jika ada],
    netProfit      : grossProfit - totalExpense
  }

CONTROLLER:
- ExpenseController: CRUD pengeluaran + kelola kategori pengeluaran (inline/modal)
- CashTransferController: catat transfer outlet→outlet, outlet→owner, owner→outlet
- FinanceController: halaman ringkasan harian + laporan L/R (form pilih periode)

PAGE (Inertia React):
- Form pengeluaran: pilih outlet, kategori, jumlah, tanggal, deskripsi, upload foto struk
- Form transfer kas: pilih sumber, tujuan, jumlah, tanggal, deskripsi
- Laporan L/R: kartu-kartu (Revenue, HPP, Gross Profit, Biaya Operasional, Net Profit)
  dengan breakdown tabel di bawahnya
```

---

### 📈 LAPORAN & EXPORT

```
Buatkan fitur laporan dan export:

SERVICE ReportService:
- Semua agregat penjualan/omzet: pakai `transactions.total` dan exclude transaksi `is_void=true`
- Filter periode penjualan/omzet memakai `transaction_date` (bukan `created_at`)
- getSalesReport(businessId, outletId|null, startDate, endDate):
  return data penjualan per hari + per produk; agregat memakai `transaction_date`
- getStockReport(businessId, outletId|null):
  return stok masuk, keluar, sisa per produk
- getExpenseReport(businessId, outletId|null, startDate, endDate):
  return pengeluaran per kategori
- getProfitLossReport: delegate ke FinanceService

CONTROLLER ReportController:
- sales: tampilkan laporan penjualan dengan filter
- stock: laporan stok
- expense: laporan pengeluaran
- profitLoss: laporan L/R

EXPORT:
- exportSalesExcel: gunakan maatwebsite/excel, class SalesExport setelah package export dipasang
- exportProfitLossExcel: gunakan maatwebsite/excel, class ProfitLossExport setelah package export dipasang
- exportStockExcel: gunakan maatwebsite/excel, class StockExport setelah package export dipasang
- exportSalesPdf: gunakan dompdf untuk laporan penjualan setelah package PDF dipasang
- exportProfitLossPdf: gunakan dompdf dengan template HTML khusus export
  (format rapi: header bisnis, periode, tabel L/R, footer tanda tangan)
- exportShiftPdf: gunakan dompdf untuk rekap shift kasir setelah package PDF dipasang

PAGE (Inertia React):
- Semua laporan punya: form filter (outlet, tanggal range), tabel hasil, tombol export Excel + PDF
- Grafik omzet: package chart belum terpasang; pilih dan install library chart saat implementasi (mis. `recharts`) atau tampilkan tabel/stat card dulu
```

---

### 🏠 DASHBOARD OWNER

```
Buatkan dashboard owner/manager OutletKu (implementasi bertahap):

FASE 1 — Dashboard dasar (Sprint 2–3):
- Sprint 2: DashboardService::getStockWidgets(businessId)
  return { lowStockAlerts }
- Sprint 3: DashboardService::getBasicWidgets(businessId, date=today)
  return { todayRevenue, todayTransactions, lowStockAlerts }
  - todayRevenue: `sum(transactions.total)` exclude transaksi `is_void=true`, filter hari memakai `transaction_date`; todayTransactions: exclude transaksi `is_void=true`, filter hari memakai `transaction_date`

FASE 2 — Dashboard lanjutan (Sprint 6):
SERVICE DashboardService::getWidgets(businessId, date=today):
  return {
    todayRevenue, todayTransactions, activeOutlets,  // outlet dengan is_active=true
    todayNetProfit,  // null jika modul keuangan Sprint 4 belum live
    weeklyRevenueChart (7 data points harian; agregat harian memakai `transaction_date`),
    topProducts (5 produk terlaris bulan ini; rank by `sum(transaction_items.quantity)` dari transaksi `is_void=false`, filter bulan memakai `transaction_date`),
    recentTransactions (5 transaksi valid terbaru, exclude is_void),
    outletSummaries (list outlet: nama, kasir aktif, trx hari ini, omzet hari ini; filter hari memakai `transaction_date`, status shift),
    lowStockAlerts (list produk stok menipis per outlet)
  }
  - Semua agregat omzet: pakai `transactions.total`, exclude `is_void=true`, dan filter periode transaksi memakai `transaction_date`; semua agregat transaksi juga exclude `is_void=true`

PAGE resources/js/pages/dashboard/index.tsx:
- Sprint 2: render dashboard dasar (stok kritis).
- Sprint 3: tambah card omzet hari ini + jumlah transaksi valid setelah transaksi POS tersedia.
- Sprint 6: tambah widget lanjutan di bawah ini.
- Row 1: stat cards (Omzet Hari Ini, Transaksi, Outlet Aktif) + Laba Bersih Hari Ini jika Sprint 4 sudah live
- Row 2: grafik omzet 7 hari harian (install library chart saat dibutuhkan) + tabel 5 produk terlaris bulan ini
- Row 3: tabel 5 transaksi valid terbaru + tabel ringkasan outlet (per outlet: shift, trx, omzet, status)
- Jika ada low stock → banner alert kuning di atas
- Semua data dari DashboardService (inject via controller)
- Refresh data via Inertia reload setiap 5 menit (atau tombol refresh manual)
```

---

### 🔴 SUPER ADMIN PANEL

```
Buatkan Super Admin Panel OutletKu di route /superadmin:

GUARD: super_admin (model SuperAdmin, tabel super_admins)
MIDDLEWARE: SuperAdminAuth (redirect ke /superadmin/login jika belum auth)

CONTROLLERS (semua di namespace App\Http\Controllers\SuperAdmin):

AuthController:
- showLogin (GET): form login super admin
- login (POST): proses login dengan guard super_admin
- logout: POST

DashboardController@index:
Ambil statistik platform:
- Total tenant, registrasi baru (hari ini / minggu ini / bulan ini)
- Tenant aktivitas 30 hari, Churn Risk (tenant `is_active=true`, `last_activity_at` NULL atau tidak ada aktivitas dalam 30 hari terakhir)
- Total user aktif platform (login 7 hari): `User::where('last_login_at', '>=', now()->subDays(7))->count()`
- Total transaksi hari ini (lintas semua tenant, exclude `is_void=true`, `whereDate(transaction_date, today())`)
- Total outlet terdaftar di seluruh platform
- Grafik registrasi 30 hari
- 5 tenant terbaru daftar (urut `created_at` DESC) + 5 tenant paling aktif (by trx valid bulan ini, exclude `is_void=true`, filter bulan memakai `transaction_date`)
- Funnel aktivitas tenant ada di AnalyticsController (bukan widget utama dashboard)

TenantController:
- index: tabel semua tenant (filter: status bisnis aktif/non-aktif, Churn Risk, tanggal daftar, search nama/email)
  kolom: nama bisnis, email owner, jumlah outlet, jumlah user, total trx valid, Terakhir Aktif, tanggal daftar, status, aksi
- show: detail tenant lengkap
- toggleActive: aktifkan/nonaktifkan tenant
- resetPassword: reset password owner tenant (kirim email baru)
- destroy: soft delete tenant
- impersonate: login sebagai owner tenant untuk support
  (simpan flag di session, tampil banner "Sedang impersonate", ada tombol stop)
- stopImpersonate: kembali ke super admin

AnalyticsController:
- index: funnel aktivitas tenant (daftar → login >1x → ada transaksi → aktif 7 hari → aktif 30 hari) + analytics overview
- growth: `GET /superadmin/analytics/growth` — grafik pertumbuhan registrasi
- activity: `GET /superadmin/analytics/activity` — grafik aktivitas harian platform (transaksi valid + login tenant); install library chart saat dibutuhkan; agregat transaksi exclude `is_void=true`; agregat transaksi harian memakai `transaction_date`
- churn: `GET /superadmin/analytics/churn` — daftar Churn Risk + export
- statistik platform: total outlet terdaftar, total produk terdaftar, total trx valid all-time (exclude void), rata-rata outlet per tenant

SystemController:
- index: versi app, queue stats, link ke log viewer, statistik platform (alternatif tampilan)

PAGE (Inertia React):
- Layout sidebar gelap (#020617) dengan aksen merah
- Semua tabel punya search + filter + pagination
- Tabel tenant: badge Status Aktif/Non-aktif (dari `is_active`); badge Churn Risk terpisah jika `last_activity_at` NULL atau tidak ada aktivitas dalam 30 hari terakhir
- Aksi impersonate tampil banner merah di atas app saat aktif: 
  "⚠ Kamu sedang masuk sebagai [Nama Bisnis] — [Kembali ke Super Admin]"
```

---

### 🔔 NOTIFIKASI

```
Buatkan sistem notifikasi in-app:

MODEL Notification: business_id, user_id, type, title, body, data (JSON), is_read, read_at

JOB CheckLowStock (jalankan via scheduler harian jam 07:00):
- Loop semua business aktif
- Cek semua outlet, semua produk
- Jika quantity <= low_stock_threshold: buat Notification ke owner + manager bisnis itu dengan `data` berisi `outlet_id`, `product_id`, dan `stock_id`
- Skip jika notifikasi serupa sudah dibuat hari ini (cek by type + data->outlet_id + data->product_id)

JOB SendDailyRevenueSummary (scheduler malam, mis. 21:00):
- Loop semua business aktif
- Hitung omzet hari ini dari `transactions.total` (exclude `is_void=true`, filter hari memakai `transaction_date`) per bisnis
- Buat Notification ke owner + manager: ringkasan omzet harian in-app

Trigger saat tutup shift (ShiftController@close):
- Jika selisih kas absolut >= Rp 10.000: buat Notification ke owner bisnis

CONTROLLER NotificationController:
- index: halaman daftar notifikasi (paginated)
- markRead: POST mark satu notifikasi sebagai dibaca
- markAllRead: POST mark semua sebagai dibaca

PAGE (Inertia React):
- Bell icon di topbar dengan badge angka (notif belum dibaca)
- Dropdown mini (5 notif terbaru) saat klik bell (React state)
- Halaman /notifications: tabel lengkap dengan filter by type
- Notif low stock: warna kuning, icon warning
- Notif lain: warna default
```

---

## CHECKLIST SEBELUM COMMIT

Tempel ini ke AI agent setelah selesai satu fitur:

```
Review kode yang baru dibuat, pastikan semua checklist ini terpenuhi:

KEAMANAN MULTI-TENANCY:
[ ] Semua query ada filter business_id (via GlobalScope atau manual where)
[ ] Route publik kasir sebelum login memakai slug bisnis (`{business:slug}`) dan validasi outlet/user di bisnis yang sama
[ ] Tidak ada celah lintas tenant (cek semua findOrFail, all(), dll)
[ ] Owner/manager tidak bisa akses data bisnis lain

PERMISSION & ROLE:
[ ] Halaman owner-only ada cek role/middleware
[ ] Kasir tidak bisa akses route laporan, setting, restock/adjust stok, atau void transaksi
[ ] Super admin route ada middleware SuperAdminAuth
[ ] Guard super_admin tidak bisa akses route tenant kecuali lewat mode impersonate yang diaudit, dan tenant tidak bisa akses route super admin

VALIDASI INPUT:
[ ] Semua store/update pakai Form Request
[ ] Validasi ada rule exists: yang filter ke business_id milik sendiri
[ ] Input uang: numeric, min:0
[ ] Upload file: mimes, max size

DATABASE:
[ ] Operasi multi-tabel dalam DB::transaction()
[ ] Stok diubah via StockService (bukan update langsung)
[ ] Field uang pakai DECIMAL (bukan FLOAT)
[ ] Snapshot harga di transaction_items
[ ] Void transaksi pakai is_void (bukan hapus fisik)

UI/UX:
[ ] Ada flash message sukses/error
[ ] Ada konfirmasi sebelum hapus (modal atau dialog)
[ ] Responsive di mobile (cek grid/flex)
[ ] Loading state saat submit (button disabled)
[ ] Empty state jika data kosong
```
