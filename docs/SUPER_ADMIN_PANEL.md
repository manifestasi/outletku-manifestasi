# Super Admin Panel — OutletKu

**Versi:** 1.5 (2026-06-16) — sinkronisasi stack proyek aktual: Laravel 13, PHP 8.3, Fortify, Inertia v3, React 19, Tailwind CSS v4, Vite 8, Wayfinder, TSX

Panel khusus untuk kamu sebagai developer/operator SaaS.
Terpisah dari auth/session tenant — guard berbeda, route berbeda, layout berbeda.
Panel ini tetap boleh membaca/mengelola data tenant untuk kebutuhan monitoring dan support.

---

## Akses

```
URL    : /superadmin
Guard  : super_admin (bukan web)
Seeder : SuperAdminSeeder → email: admin@outletku.id / password: [set sendiri]
```

---

## Arsitektur Guard Terpisah

```php
// config/auth.php
'guards' => [
    'web' => [                          // untuk owner/manager/kasir
        'driver'   => 'session',
        'provider' => 'users',
    ],
    'super_admin' => [                  // untuk kamu saja
        'driver'   => 'session',
        'provider' => 'super_admins',
    ],
],

'providers' => [
    'users'        => ['driver' => 'eloquent', 'model' => App\Models\User::class],
    'super_admins' => ['driver' => 'eloquent', 'model' => App\Models\SuperAdmin::class],
],
```

---

## Route List Super Admin

```php
// routes/superadmin.php — URL publik memakai prefix /superadmin
// Daftar di bawah menampilkan URL penuh; implementasi boleh memakai Route::prefix('superadmin').
// Login route publik/guest; route lain memakai middleware auth:super_admin.
// Daftarkan file ini di bootstrap/app.php (Laravel 13), contoh:
// ->withRouting(web: __DIR__.'/../routes/web.php', then: function () {
//        Route::middleware('web')->group(base_path('routes/superadmin.php'));
//    })

// Auth
GET       /superadmin/login              SuperAdmin\AuthController@showLogin
POST      /superadmin/login              SuperAdmin\AuthController@login
POST      /superadmin/logout             SuperAdmin\AuthController@logout

// Dashboard utama
GET       /superadmin                    SuperAdmin\DashboardController@index

// Tenant Management
GET       /superadmin/tenants            SuperAdmin\TenantController@index
GET       /superadmin/tenants/{id}       SuperAdmin\TenantController@show
PATCH     /superadmin/tenants/{id}/toggle-active    SuperAdmin\TenantController@toggleActive
POST      /superadmin/tenants/{id}/reset-password   SuperAdmin\TenantController@resetPassword
DELETE    /superadmin/tenants/{id}       SuperAdmin\TenantController@destroy
POST      /superadmin/tenants/{id}/impersonate      SuperAdmin\TenantController@impersonate
POST      /superadmin/impersonate/stop              SuperAdmin\TenantController@stopImpersonate

// Analytics & Stats
GET       /superadmin/analytics          SuperAdmin\AnalyticsController@index
GET       /superadmin/analytics/growth   SuperAdmin\AnalyticsController@growth
GET       /superadmin/analytics/activity SuperAdmin\AnalyticsController@activity
GET       /superadmin/analytics/churn    SuperAdmin\AnalyticsController@churn

// System
GET       /superadmin/system             SuperAdmin\SystemController@index
GET       /superadmin/system/logs        SuperAdmin\SystemController@logs
GET       /superadmin/system/queues      SuperAdmin\SystemController@queues
```

---

## Halaman & Widget Dashboard Super Admin

### 1. `/superadmin` — Overview Dashboard

```
┌─────────────────────────────────────────────────────────┐
│  OUTLETKU — Super Admin Panel                           │
├──────────┬──────────┬──────────┬───────────────────────┤
│ Total    │ Baru     │ Tenant   │ Churn Risk            │
│ Tenant   │ Hari Ini │ Aktif    │ (>30 hari, is_active=true) │
│  142     │   +2     │ (30 hari)│   21                  │
│          │ Minggu:+5│   98     │                       │
│          │ Bulan:+12│          │                       │
├──────────┴──────────┴──────────┴───────────────────────┤
│ Registrasi Baru — Grafik 30 Hari (library chart saat fitur dibuat) │
│ ████████████████████████████████████████████████████  │
├─────────────────────────────────────────────────────────┤
│ Aktivitas Platform Hari Ini                             │
│  Trx Valid: 1,247  │  User Aktif (7 hari): 312  │  Total Outlet: 203  │
├─────────────────────────────────────────────────────────┤
│ 5 Tenant Terbaru Daftar        │ 5 Tenant Paling Aktif │
│ - Kebab Mas Bro (Solo)         │ - Warung Pak Joko     │
│ - Minuman Segar Bu Ani         │ - Gerobak Maju Jaya   │
│ ...                            │ ...                   │
└─────────────────────────────────────────────────────────┘
```

### 2. `/superadmin/tenants` — Daftar Tenant

Tabel dengan kolom:
- Nama Bisnis
- Email Owner
- Jumlah Outlet
- Jumlah User
- Total Transaksi Valid (all time, exclude void)
- Terakhir Aktif
- Tanggal Daftar
- Status (badge: Aktif / Non-aktif — dari `businesses.is_active`)
- Aksi: Detail | Nonaktifkan | Impersonate

Filter: Status bisnis (Semua/Aktif/Non-aktif) | Churn Risk (`last_activity_at` NULL atau tidak ada aktivitas dalam 30 hari terakhir, tenant `is_active=true`) | Tanggal daftar | Search nama/email

### 3. `/superadmin/tenants/{id}` — Detail Tenant

```
Nama Bisnis    : Kebab Pak Joko
Owner          : Joko Santoso (joko@email.com)
Daftar         : 12 Maret 2026
Terakhir Aktif : 2 hari yang lalu   -- dari businesses.last_activity_at
Status         : Aktif

Statistik:
  Outlet   : 3    Products : 15    Users : 6
  Transaksi Valid: 1,240   Total Omzet Valid: Rp 18,400,000
  Total Omzet Valid = sum(transactions.total) WHERE is_void=false (all-time, per tenant)

Daftar Outlet:
  [tabel outlet milik bisnis ini]

Daftar User:
  [tabel user milik bisnis ini + role masing-masing]

10 Transaksi Valid Terakhir:
  [tabel transaksi valid terbaru]

Aksi Berbahaya:
  [Reset Password Owner]  [Nonaktifkan Bisnis]  [Hapus Bisnis]
```

### 4. `/superadmin/analytics` — Analytics Detail

- **Grafik Pertumbuhan Registrasi**: line chart harian/mingguan/bulanan (toggle)
- **Registrasi per Periode**: tabel bulan ini vs bulan lalu vs 3 bulan lalu
- **Funnel Aktivitas**:
  - Total registrasi
  - Pernah login > 1x
  - Pernah input transaksi
  - Aktif 7 hari terakhir
  - Aktif 30 hari terakhir
- **Churn Risk**: tenant `is_active=true` yang `last_activity_at` NULL atau tidak ada aktivitas dalam 30 hari terakhir (tabel + export daftar kontak untuk follow-up)
- **Grafik Aktivitas Harian**: transaksi valid + login tenant; install library chart saat dibutuhkan; agregat transaksi exclude `is_void=true`; agregat transaksi harian memakai `transaction_date`
- **Distribusi Outlet per Tenant**: berapa banyak tenant yang punya 1, 2–5, >5 outlet
- **Statistik Platform**: total outlet terdaftar, total produk terdaftar, total transaksi valid all-time (exclude void), rata-rata outlet per tenant

### 5. `/superadmin/system` — Status Sistem

- Versi aplikasi (dari `config/app.php` atau `.env APP_VERSION`)
- Total jobs di queue (pending, failed)
- 20 error log terbaru (dari `storage/logs/laravel.log`)
- Link ke Laravel Telescope (jika dev mode)
- Statistik platform (alternatif tampilan): total outlet terdaftar, total produk, total trx valid all-time, rata-rata outlet per tenant

---

## Implementasi Impersonate (Login sebagai Tenant)

Fitur ini memungkinkan kamu masuk sebagai owner tenant tertentu untuk support/troubleshooting tanpa perlu password mereka.

```php
// SuperAdmin\TenantController@impersonate
public function impersonate(Business $business)
{
    $owner = $business->users()->role('owner')->first();

    // Simpan ID super admin di session untuk bisa kembali
    session(['impersonating_from_superadmin' => true]);

    // Login sebagai owner tenant tersebut (guard web)
    Auth::guard('web')->login($owner);

    // Log aktivitas ini
    activity('super_admin')
        ->causedBy(Auth::guard('super_admin')->user())
        ->performedOn($business)
        ->log('Impersonate bisnis: ' . $business->name);

    return redirect()->route('dashboard')
        ->with('impersonating', 'Kamu sedang masuk sebagai ' . $owner->name);
}

// Tombol "Kembali ke Super Admin" — tampil jika session impersonating aktif
public function stopImpersonate()
{
    Auth::guard('web')->logout();
    session()->forget('impersonating_from_superadmin');
    return redirect('/superadmin/tenants');
}
```

---

## Middleware Super Admin

```php
// app/Http/Middleware/SuperAdminAuth.php
public function handle(Request $request, Closure $next)
{
    if (!Auth::guard('super_admin')->check()) {
        return redirect('/superadmin/login');
    }
    return $next($request);
}
```

---

## Statistik yang Ditampilkan (Query Reference)

```php
// DashboardService (Super Admin)

// Total tenant
Business::count();

// Tenant baru hari ini / minggu ini / bulan ini
Business::whereDate('created_at', today())->count();
Business::where('created_at', '>=', now()->startOfWeek())->count();
Business::whereMonth('created_at', now()->month)->whereYear('created_at', now()->year)->count();

// Tenant dengan aktivitas dalam 30 hari (bukan sama dengan is_active)
Business::where('last_activity_at', '>=', now()->subDays(30))->count();

// Churn Risk (tenant is_active=true, last_activity_at NULL atau tidak ada aktivitas dalam 30 hari terakhir)
Business::where('is_active', true)
         ->where(function ($q) {
             $q->where('last_activity_at', '<', now()->subDays(30))
               ->orWhereNull('last_activity_at');
         })
         ->count();

// Total user aktif platform (login dalam 7 hari)
User::where('last_login_at', '>=', now()->subDays(7))->count();

// Total outlet terdaftar di seluruh platform
Outlet::count();

// Statistik platform (tampil di /superadmin/analytics atau /superadmin/system)
Product::count();
Transaction::where('is_void', false)->count();
Outlet::count() / max(Business::count(), 1);  // rata-rata outlet per tenant

// Total transaksi valid hari ini (semua tenant)
Transaction::where('is_void', false)
           ->whereDate('transaction_date', today())
           ->count();

// Grafik registrasi 30 hari
Business::selectRaw('DATE(created_at) as date, COUNT(*) as count')
         ->where('created_at', '>=', now()->subDays(30))
         ->groupBy('date')
         ->get();

// Tenant paling aktif (by transaksi valid bulan ini)
// Transaction punya business_id, jadi relasi Business hasMany(Transaction) cukup.
Business::withCount(['transactions' => fn($q) =>
             $q->where('is_void', false)
               ->whereMonth('transaction_date', now()->month)
               ->whereYear('transaction_date', now()->year)])
         ->orderByDesc('transactions_count')
         ->take(5)
         ->get();
```

---

## Keamanan Super Admin

1. **Guard terpisah** — tidak ada overlap dengan session tenant
2. **IP Whitelist** (opsional) — middleware cek IP jika diaktifkan
3. **Semua aksi dicatat** — via `spatie/laravel-activitylog` dengan guard `super_admin` setelah package audit dipasang
4. **Impersonate dicatat** — log siapa di-impersonate, kapan, oleh siapa
5. **Password super admin** — wajib kuat, tidak bisa di-reset via UI (hanya via Artisan/Tinker)
