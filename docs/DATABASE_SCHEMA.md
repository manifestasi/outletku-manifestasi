# Database Schema — OutletKu

**Database:** MySQL 8.0  
**ORM:** Laravel Eloquent  
**Versi:** 1.5 (2026-06-16) — sinkronisasi stack proyek aktual: Laravel 13, PHP 8.3, Fortify, Inertia v3, React 19, Tailwind CSS v4, Vite 8, Wayfinder, TSX

---

## ERD Overview

```
super_admins (terpisah dari users)

businesses ──< users
businesses ──< outlets
businesses ──< products
businesses ──< categories
businesses ──< expense_categories
businesses ──< shifts
businesses ──< stocks
businesses ──< stock_movements
businesses ──< transactions
businesses ──< transaction_items
businesses ──< expenses
businesses ──< cash_transfers
businesses ──< notifications

outlets ──< outlet_user (pivot: user ↔ outlet)
outlets ──< stocks
outlets ──< stock_movements
outlets ──< transactions
outlets ──< expenses
outlets ──< cash_transfers
outlets ──< shifts

users ──< shifts                ← kasir yang buka shift
shifts ──< transactions         ← wajib untuk transaksi kasir; NULL untuk transaksi langsung owner/manager

transactions ──< transaction_items
```

---

## Migration & Schema Detail

### `super_admins` *(Fase 3 — Sprint 7; terpisah dari users biasa)*
```sql
id                  BIGINT PK
name                VARCHAR(100)
email               VARCHAR(100) UNIQUE
password            VARCHAR(255)
remember_token
last_login_at       TIMESTAMP NULL
created_at, updated_at

-- Guard: 'super_admin' (Guard Laravel terpisah)
```

### `businesses` (Tenant)
```sql
id                  BIGINT PK
name                VARCHAR(100)
slug                VARCHAR(50) UNIQUE          -- untuk URL kasir: /kasir/{business:slug}; generate dari name saat register
owner_name          VARCHAR(100)                -- sync dari users.name owner saat register
phone               VARCHAR(20)
email               VARCHAR(100)
address             TEXT NULL
logo                VARCHAR(255) NULL
is_active           BOOLEAN DEFAULT true
last_activity_at    TIMESTAMP NULL      -- update saat login tenant atau transaksi valid
deleted_at          TIMESTAMP NULL      -- soft delete tenant (Super Admin)
created_at, updated_at
```

### `users`
```sql
id                  BIGINT PK
business_id         BIGINT FK → businesses.id
name                VARCHAR(100)
email               VARCHAR(100) UNIQUE NULL   -- NULL untuk kasir (login via PIN)
password            VARCHAR(255) NULL          -- NULL untuk kasir
pin                 VARCHAR(255) NULL          -- bcrypt hash, hanya untuk kasir
pin_failed_attempts TINYINT DEFAULT 0
pin_locked_until    TIMESTAMP NULL             -- locked jika salah 5x
phone               VARCHAR(20) NULL
avatar              VARCHAR(255) NULL
is_active           BOOLEAN DEFAULT true
remember_token      VARCHAR(100) NULL
email_verified_at   TIMESTAMP NULL
last_login_at       TIMESTAMP NULL
created_at, updated_at

-- Role via package role/permission (rencana: spatie/laravel-permission)
-- roles: owner | manager | cashier

INDEX: (business_id), (email)
```

### `outlets`
```sql
id                  BIGINT PK
business_id         BIGINT FK → businesses.id
name                VARCHAR(100)
address             TEXT NULL
phone               VARCHAR(20) NULL
photo               VARCHAR(255) NULL
is_active           BOOLEAN DEFAULT true
created_at, updated_at

INDEX: (business_id)
```

### `outlet_user` (Pivot)
```sql
outlet_id           BIGINT FK
user_id             BIGINT FK
created_at, updated_at

PRIMARY KEY (outlet_id, user_id)
```

### `shifts` (manajemen shift kasir)
```sql
id                  BIGINT PK
business_id         BIGINT FK → businesses.id
outlet_id           BIGINT FK → outlets.id
user_id             BIGINT FK → users.id     -- kasir yang buka shift
opened_at           TIMESTAMP                -- waktu buka shift
closed_at           TIMESTAMP NULL           -- NULL = shift masih aktif
opening_cash        DECIMAL(12,2) DEFAULT 0  -- uang kas awal
closing_cash        DECIMAL(12,2) NULL       -- uang kas akhir saat tutup
expected_cash       DECIMAL(12,2) NULL       -- kas awal + total penjualan cash
cash_difference     DECIMAL(12,2) NULL       -- closing_cash - expected_cash
total_transactions  INT DEFAULT 0            -- jumlah transaksi valid dalam shift
total_sales         DECIMAL(12,2) DEFAULT 0  -- total penjualan valid dalam shift
notes               TEXT NULL                -- catatan saat tutup shift
status              ENUM('open','closed') DEFAULT 'open'
created_at, updated_at

INDEX: (business_id), (outlet_id, status), (user_id), (opened_at)
APP RULE: hanya boleh ada 1 shift `open` per outlet
-- MySQL tidak punya partial unique index native; enforce via validasi aplikasi/transaction lock.
```

### `categories`
```sql
id                  BIGINT PK
business_id         BIGINT FK
name                VARCHAR(100)
created_at, updated_at
```

### `products`
```sql
id                  BIGINT PK
business_id         BIGINT FK
category_id         BIGINT FK NULL
name                VARCHAR(150)
sku                 VARCHAR(50) NULL
unit                VARCHAR(20)
selling_price       DECIMAL(12,2)
cost_price          DECIMAL(12,2)
image               VARCHAR(255) NULL
is_active           BOOLEAN DEFAULT true
created_at, updated_at

INDEX: (business_id), (category_id)
```

### `stocks`
```sql
id                  BIGINT PK
business_id         BIGINT FK → businesses.id
outlet_id           BIGINT FK
product_id          BIGINT FK
quantity            DECIMAL(12,2) DEFAULT 0
low_stock_threshold DECIMAL(12,2) DEFAULT 5
updated_at

UNIQUE KEY (outlet_id, product_id)
INDEX: (business_id)
```

### `stock_movements`
```sql
id                  BIGINT PK
business_id         BIGINT FK → businesses.id
outlet_id           BIGINT FK
product_id          BIGINT FK
type                ENUM('in','out','adjustment')
quantity            DECIMAL(12,2)
quantity_before     DECIMAL(12,2)
quantity_after      DECIMAL(12,2)
reference_type      VARCHAR(50) NULL
reference_id        BIGINT NULL
note                TEXT NULL
created_by          BIGINT FK → users.id
created_at

INDEX: (business_id), (outlet_id, product_id), (created_at)
```

### `transactions`
```sql
id                  BIGINT PK
business_id         BIGINT FK → businesses.id
outlet_id           BIGINT FK
shift_id            BIGINT FK NULL → shifts.id    -- wajib untuk kasir; NULL untuk transaksi langsung owner/manager
invoice_number      VARCHAR(50)
transaction_date    DATE
subtotal            DECIMAL(12,2)
discount            DECIMAL(12,2) DEFAULT 0    -- nilai nominal final; input % dihitung di UI/backend sebelum simpan
total               DECIMAL(12,2)
payment_method      ENUM('cash','transfer','other') DEFAULT 'cash'
is_void             BOOLEAN DEFAULT false       -- true jika transaksi dibatalkan
voided_at           TIMESTAMP NULL
note                TEXT NULL
created_by          BIGINT FK → users.id
created_at, updated_at

UNIQUE KEY (business_id, invoice_number)
INDEX: (business_id), (outlet_id), (shift_id), (transaction_date)
```

### `transaction_items`
```sql
id                  BIGINT PK
business_id         BIGINT FK → businesses.id
transaction_id      BIGINT FK
product_id          BIGINT FK
product_name        VARCHAR(150)
selling_price       DECIMAL(12,2)
cost_price          DECIMAL(12,2)
quantity            DECIMAL(12,2)
subtotal            DECIMAL(12,2)
created_at

INDEX: (business_id), (transaction_id)
```

### `expense_categories` *(Fase 2 — Sprint 4)*
```sql
id                  BIGINT PK
business_id         BIGINT FK
name                VARCHAR(100)
created_at, updated_at
```

### `expenses` *(Fase 2 — Sprint 4)*
```sql
id                  BIGINT PK
business_id         BIGINT FK → businesses.id
outlet_id           BIGINT FK NULL
expense_category_id BIGINT FK NULL
amount              DECIMAL(12,2)
expense_date        DATE
description         TEXT NULL
attachment          VARCHAR(255) NULL
created_by          BIGINT FK → users.id
created_at, updated_at

INDEX: (business_id), (outlet_id), (expense_date)
```

### `cash_transfers` *(Fase 2 — Sprint 4; migration boleh dibuat lebih awal, UI aktif Sprint 4)*
```sql
id                  BIGINT PK
business_id         BIGINT FK → businesses.id
from_outlet_id      BIGINT FK NULL → outlets.id   -- NULL jika dari owner
to_outlet_id        BIGINT FK NULL → outlets.id   -- NULL jika setoran ke owner
amount              DECIMAL(12,2)
transfer_date       DATE
type                ENUM('outlet_to_outlet','outlet_to_owner','owner_to_outlet')
description         TEXT NULL
created_by          BIGINT FK → users.id
created_at, updated_at

INDEX: (business_id), (from_outlet_id), (to_outlet_id), (transfer_date)
```

### `notifications` *(Fase 2 — Sprint 6)*
```sql
id                  BIGINT PK
business_id         BIGINT FK → businesses.id
user_id             BIGINT FK
type                VARCHAR(100)
title               VARCHAR(200)
body                TEXT
data                JSON NULL
is_read             BOOLEAN DEFAULT false
read_at             TIMESTAMP NULL
created_at

INDEX: (business_id), (user_id, is_read)
```

---

## Seeders

```
DatabaseSeeder
├── SuperAdminSeeder            -- 1 super admin (Fase 3)
├── RolePermissionSeeder        -- roles: owner, manager, cashier
├── BusinessSeeder              -- 2 bisnis demo
├── UserSeeder                  -- owner + manager + 2 kasir per bisnis
├── OutletSeeder                -- 3 outlet per bisnis
├── CategorySeeder              -- 5 kategori per bisnis
├── ProductSeeder               -- 10 produk per bisnis
├── StockSeeder                 -- stok awal
├── ExpenseCategorySeeder       -- kategori pengeluaran default: Operasional, Bahan Baku, Gaji, Lain-lain (Fase 2)
├── ExpenseSeeder               -- record pengeluaran demo (Fase 2)
├── CashTransferSeeder          -- transfer kas demo (Fase 2)
└── ShiftSeeder                 -- 7 hari shift demo dengan transaksi
```

---

## Catatan Penting

1. **PIN hashed** dengan `bcrypt` — tidak pernah simpan plain text.
2. **Kasir tidak punya email/password** — kolom `email` dan `password` NULL, hanya ada `pin`.
3. **`business_id` wajib di tabel tenant-owned** — termasuk data operasional seperti shift, stok, transaksi, pengeluaran, transfer kas, dan notifikasi agar Global Scope multi-tenancy konsisten.
4. **Route publik kasir sebelum login** — tidak bisa mengandalkan `auth()->user()->business_id`; gunakan slug bisnis (`/kasir/{business:slug}`) dan validasi manual outlet/user terhadap bisnis tersebut.
5. **`shift_id` di `transactions`** — wajib diisi jika transaksi dibuat oleh kasir. Bisa NULL jika dibuat owner/manager langsung.
6. **`super_admins` guard terpisah** — gunakan `Auth::guard('super_admin')`, bukan `Auth::guard('web')`. Super admin hanya boleh masuk route tenant lewat mode impersonate yang diaudit, dan tenant tidak boleh akses route super admin.
7. **`last_activity_at` di `businesses`** — update via Listener/Observer saat user tenant login atau ada transaksi valid baru (`is_void=false`), untuk monitoring churn di super admin panel.
8. **Snapshot harga** di `transaction_items` — harga tidak berubah meski produk diedit.
9. Gunakan `DECIMAL(12,2)` untuk semua field uang/qty.
10. **`invoice_number` unik per bisnis** — jangan pakai UNIQUE global, gunakan UNIQUE `(business_id, invoice_number)`.
11. **Void transaksi** — gunakan kolom `is_void` + `voided_at`, bukan hapus fisik. Stok dikembalikan via `StockService`. **Hanya owner/manager** yang boleh void. Pencatatan audit void via `spatie/laravel-activitylog` aktif setelah modul audit log tenant (Sprint 7) dan package audit dipasang.
12. **Agregat omzet/pendapatan dan HPP (COGS)** — semua query laporan, dashboard, shift close, dan FinanceService wajib `WHERE is_void = false`. Gunakan `transactions.total` untuk omzet/pendapatan (bukan item subtotal) agar konsisten dengan diskon, dashboard, laporan, dan rekap shift. Filter periode transaksi pakai `transaction_date`, bukan `created_at`.
13. **Registrasi owner** — saat register: set `users.name` = `businesses.owner_name`, `businesses.email` = owner `users.email`, generate `slug` unik dari `businesses.name`.
14. **Akses stok kasir** — kasir hanya read-only stok outlet assigned (`StockController@byOutlet`); restock/adjust/index penuh untuk owner/manager.
