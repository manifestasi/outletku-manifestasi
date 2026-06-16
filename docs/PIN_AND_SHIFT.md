# PIN Login & Shift Management — OutletKu

**Versi:** 1.5 (2026-06-16) — sinkronisasi stack proyek aktual: Laravel 13, PHP 8.3, Fortify, Inertia v3, React 19, Tailwind CSS v4, Vite 8, Wayfinder, TSX

Detail implementasi fitur login PIN untuk kasir dan manajemen shift.

---

## Alur Lengkap Login Kasir

```
1. Kasir buka URL bisnis: https://outletku.id/kasir/{business:slug}
   (owner share link ini ke kasir — tiap bisnis punya slug unik)

2. Halaman: Pilih Outlet (dropdown / card)
   → Kasir pilih outlet tempat mereka bertugas

3. Halaman: Pilih Nama Kasir
   → Tampil daftar kasir yang di-assign ke outlet itu
   → Kasir klik nama mereka

4. Halaman: Input PIN
   → Keypad 0–9 (lebih mudah di HP daripada keyboard)
   → Masukkan PIN 6 digit
   → Tekan OK

5. Jika PIN benar:
   → Redirect ke halaman `/shift/open` (Buka Shift)
   → Input kas awal (uang di laci)
   → Klik "Mulai Shift"
   → Redirect ke halaman POS kasir

6. Jika PIN salah:
   → Tampil error "PIN salah, sisa X percobaan"
   → Setelah 5x: "Akun terkunci 15 menit"
```

---

## Routes PIN & Shift

```php
// routes/web.php — akses publik (guest), khusus kasir

Route::prefix('kasir')->name('kasir.')->group(function () {
    GET  /{business:slug}               KasirAuthController@selectOutlet
    GET  /{business:slug}/{outlet}      KasirAuthController@selectUser
    GET  /{business:slug}/{outlet}/{user}/pin  KasirAuthController@showPin
    POST /{business:slug}/{outlet}/{user}/pin  KasirAuthController@verifyPin
});

// Route setelah PIN valid, sebelum shift aktif (khusus kasir)
Route::middleware(['auth', 'role:cashier'])->group(function () {
    GET  /shift/open             ShiftController@openForm
    POST /shift/open             ShiftController@open
    POST /kasir/logout           KasirAuthController@logout
});

// Route yang butuh kasir login + shift aktif
Route::middleware(['auth', 'role:cashier', 'kasir.shift'])->group(function () {
    GET  /pos                    TransactionController@create
    POST /pos                    TransactionController@store

    GET  /shift/close            ShiftController@closeForm
    POST /shift/close            ShiftController@close
});

// Owner/Manager — transaksi langsung (tanpa shift)
Route::middleware(['auth', 'role:owner|manager'])->group(function () {
    GET  /transactions/create      TransactionController@create
    POST /transactions             TransactionController@store
    GET  /transactions             TransactionController@index
    GET  /transactions/{transaction} TransactionController@show
    DELETE /transactions/{transaction} TransactionController@destroy  // void, owner/manager only
});

// Owner/Manager — manajemen shift
Route::middleware(['auth', 'role:owner|manager'])->group(function () {
    GET  /shifts                 ShiftController@index
    GET  /shifts/{shift}         ShiftController@show
    POST /shifts/{shift}/force-close  ShiftController@forceClose
});

// Kasir: `/pos` (middleware `role:cashier` + `kasir.shift`).
// Owner/manager: `/transactions/create` + `POST /transactions` (shift_id NULL, pilih outlet).
```

---

## Controller: KasirAuthController

```php
class KasirAuthController extends Controller
{
    // Step 1: Tampil daftar outlet dalam bisnis tertentu
    public function selectOutlet(Business $business)
    {
        $outlets = $business->outlets()->active()->get();
        return Inertia::render('Kasir/SelectOutlet', [
            'business' => $business,
            'outlets' => $outlets,
        ]);
    }

    // Step 2: Tampil daftar kasir di outlet ini
    public function selectUser(Business $business, Outlet $outlet)
    {
        abort_unless($outlet->business_id === $business->id, 404);

        $kasirs = $outlet->users()
            ->where('business_id', $business->id)
            ->role('cashier')
            ->active()
            ->get();
        return Inertia::render('Kasir/SelectUser', [
            'business' => $business,
            'outlet' => $outlet,
            'kasirs' => $kasirs,
        ]);
    }

    // Step 3: Tampil keypad PIN untuk kasir terpilih
    public function showPin(Business $business, Outlet $outlet, User $user)
    {
        abort_unless($outlet->business_id === $business->id, 404);
        abort_unless($user->business_id === $business->id, 404);
        abort_unless($user->hasRole('cashier'), 403);
        abort_unless($outlet->users()->whereKey($user->id)->exists(), 404);

        return Inertia::render('Kasir/Pin', [
            'business' => $business,
            'outlet' => $outlet,
            'user' => $user,
        ]);
    }

    // Step 4: Verifikasi PIN
    public function verifyPin(Request $request, Business $business, Outlet $outlet, User $user)
    {
        $request->validate([
            'pin' => 'required|digits:6',
        ]);

        abort_unless($outlet->business_id === $business->id, 404);
        abort_unless($user->business_id === $business->id, 404);
        abort_unless($user->hasRole('cashier'), 403);
        abort_unless($outlet->users()->whereKey($user->id)->exists(), 404);

        // Cek apakah terkunci
        if ($user->pin_locked_until && now()->lt($user->pin_locked_until)) {
            $menit = now()->diffInMinutes($user->pin_locked_until);
            return back()->withErrors(['pin' => "Akun terkunci. Coba lagi {$menit} menit lagi."]);
        }

        // Verifikasi PIN
        if (!Hash::check($request->pin, $user->pin)) {
            $user->increment('pin_failed_attempts');

            if ($user->pin_failed_attempts >= 5) {
                $user->update(['pin_locked_until' => now()->addMinutes(15)]);
                return back()->withErrors(['pin' => 'Terlalu banyak percobaan. Akun terkunci 15 menit.']);
            }

            $sisa = 5 - $user->pin_failed_attempts;
            return back()->withErrors(['pin' => "PIN salah. Sisa {$sisa} percobaan."]);
        }

        // PIN benar — reset counter, login
        $user->update(['pin_failed_attempts' => 0, 'pin_locked_until' => null, 'last_login_at' => now()]);
        Auth::login($user);
        session(['active_outlet_id' => $outlet->id, 'active_business_slug' => $business->slug]);

        return redirect('/shift/open');
    }

    public function logout()
    {
        // Cek apakah shift masih aktif — paksa tutup atau warn
        $activeShift = Shift::where('business_id', auth()->user()->business_id)
                            ->where('user_id', auth()->id())
                            ->where('outlet_id', session('active_outlet_id'))
                            ->where('status', 'open')
                            ->first();

        if ($activeShift) {
            return redirect('/shift/close')
                ->with('warning', 'Harap tutup shift terlebih dahulu sebelum logout.');
        }

        $businessSlug = session('active_business_slug');
        Auth::logout();
        session()->forget(['active_outlet_id', 'active_shift_id', 'active_business_slug']);
        return redirect("/kasir/{$businessSlug}");
    }
}
```

---

## Controller: ShiftController

> Contoh di bawah fokus alur kasir (open/close). Method owner/manager (`index`, `show`, `forceClose`) ada di route list di atas dan diimplementasi terpisah dengan cek role `owner|manager`.

```php
class ShiftController extends Controller
{
    // Helper: ambil shift aktif kasir dengan validasi tenant + outlet
    private function activeShiftOrFail(): Shift
    {
        $shift = Shift::whereKey(session('active_shift_id'))
            ->where('business_id', auth()->user()->business_id)
            ->where('outlet_id', session('active_outlet_id'))
            ->where('user_id', auth()->id())
            ->where('status', 'open')
            ->firstOrFail();

        return $shift;
    }

    // Form buka shift (setelah PIN verified)
    public function openForm()
    {
        return Inertia::render('Shift/Open');
    }

    // Proses buka shift
    public function open(Request $request)
    {
        $request->validate([
            'opening_cash' => 'required|numeric|min:0',
        ]);

        // Cek jika ada shift lain yang aktif di outlet ini
        $outletId = session('active_outlet_id');
        $outlet = Outlet::whereKey($outletId)
            ->where('business_id', auth()->user()->business_id)
            ->firstOrFail();
        $existingShift = Shift::where('business_id', $outlet->business_id)
                               ->where('outlet_id', $outletId)
                               ->where('status', 'open')
                               ->exists();

        if ($existingShift) {
            return back()->withErrors(['shift' => 'Ada shift yang masih aktif di outlet ini.']);
        }

        $shift = Shift::create([
            'business_id'  => $outlet->business_id,
            'outlet_id'    => $outletId,
            'user_id'      => auth()->id(),
            'opened_at'    => now(),
            'opening_cash' => $request->opening_cash,
            'status'       => 'open',
        ]);

        session(['active_shift_id' => $shift->id]);

        return redirect('/pos');
    }

    // Form tutup shift
    public function closeForm()
    {
        $shift = $this->activeShiftOrFail();

        // Hitung total penjualan cash dalam shift ini
        $totalCash = $shift->transactions()
                           ->where('is_void', false)
                           ->where('payment_method', 'cash')
                           ->sum('total');

        $expectedCash = $shift->opening_cash + $totalCash;

        return Inertia::render('Shift/Close', [
            'shift' => $shift,
            'expectedCash' => $expectedCash,
        ]);
    }

    // Proses tutup shift
    public function close(Request $request)
    {
        $request->validate([
            'closing_cash' => 'required|numeric|min:0',
            'notes'        => 'nullable|string|max:500',
        ]);

        $shift = $this->activeShiftOrFail();

        $totalCash    = $shift->transactions()
                              ->where('is_void', false)
                              ->where('payment_method', 'cash')
                              ->sum('total');
        $expectedCash = $shift->opening_cash + $totalCash;

        $shift->update([
            'closed_at'          => now(),
            'closing_cash'       => $request->closing_cash,
            'expected_cash'      => $expectedCash,
            'cash_difference'    => $request->closing_cash - $expectedCash,
            'total_transactions' => $shift->transactions()->where('is_void', false)->count(),
            'total_sales'        => $shift->transactions()->where('is_void', false)->sum('total'),
            'notes'              => $request->notes,
            'status'             => 'closed',
        ]);

        // Sprint 6: jika abs(cash_difference) >= 10000, buat notifikasi in-app ke owner bisnis

        $businessSlug = $shift->outlet->business->slug;
        Auth::logout();
        session()->forget(['active_shift_id', 'active_outlet_id', 'active_business_slug']);

        return redirect("/kasir/{$businessSlug}")
            ->with('success', 'Shift berhasil ditutup. Terima kasih!');
    }
}
```

---

## Middleware: KasirShiftMiddleware

```php
// Pastikan kasir punya shift aktif sebelum bisa akses POS
class KasirShiftMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (!session('active_shift_id')) {
            return redirect('/shift/open')
                ->with('warning', 'Harap buka shift terlebih dahulu.');
        }

        $shift = Shift::whereKey(session('active_shift_id'))
            ->where('business_id', auth()->user()->business_id)
            ->where('outlet_id', session('active_outlet_id'))
            ->where('user_id', auth()->id())
            ->first();
        if (!$shift || $shift->status !== 'open') {
            session()->forget('active_shift_id');
            return redirect('/shift/open');
        }

        if ($shift->opened_at->lt(now()->subHours(12))) {
            return redirect('/shift/close')
                ->with('warning', 'Shift sudah lebih dari 12 jam. Harap tutup shift terlebih dahulu.');
        }

        return $next($request);
    }
}
```

---

## Page: Keypad PIN (Inertia React TSX + Wayfinder)

```jsx
// resources/js/pages/kasir/pin.tsx
import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { verifyPin } from '@/actions/App/Http/Controllers/Kasir/KasirAuthController';

export default function Pin({ business, outlet, user }) {
    const { data, setData, post, processing, errors } = useForm({
        pin: '',
    });

    useEffect(() => {
        if (data.pin.length === 6 && !processing) {
            post(verifyPin({ business: business.slug, outlet: outlet.id, user: user.id }), {
                preserveScroll: true,
                onError: () => setData('pin', ''),
            });
        }
    }, [data.pin]);

    const pressKey = (key) => {
        if (key === 'backspace') {
            setData('pin', data.pin.slice(0, -1));
            return;
        }

        if (data.pin.length < 6) {
            setData('pin', `${data.pin}${key}`);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 p-6">
            <div className="mb-4 flex gap-3">
                {Array.from({ length: 6 }).map((_, index) => (
                    <div
                        key={index}
                        className={`h-10 w-10 rounded-full border-2 ${
                            data.pin.length > index
                                ? 'border-indigo-600 bg-indigo-600'
                                : 'border-gray-300'
                        }`}
                    />
                ))}
            </div>

            {errors.pin && <p className="text-sm text-red-600">{errors.pin}</p>}

            <div className="grid w-full max-w-xs grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'backspace'].map((key, index) => (
                    <button
                        key={index}
                        type="button"
                        disabled={key === null || processing}
                        onClick={() => key !== null && pressKey(key)}
                        className="h-16 rounded-xl bg-gray-100 text-xl font-semibold transition hover:bg-gray-200 active:scale-95 disabled:invisible"
                    >
                        {key === 'backspace' ? '⌫' : key}
                    </button>
                ))}
            </div>
        </div>
    );
}
```

---

## Laporan Shift (untuk Owner/Manager)

> Tampilan daftar/detail shift: Sprint 3. Export PDF rekap shift: Sprint 5.

### Konten Laporan Shift
```
LAPORAN SHIFT
Outlet   : Gerobak Kebab Pasar Legi
Kasir    : Budi Santoso
Buka     : Senin, 30 Mei 2026 pukul 08:30
Tutup    : Senin, 30 Mei 2026 pukul 20:15
Durasi   : 11 jam 45 menit

RINGKASAN PENJUALAN
Total Transaksi Valid : 47
Total Penjualan Valid : Rp 1,240,000

Penjualan per Metode Bayar:
  Cash      : Rp   980,000  (40 transaksi)
  Transfer  : Rp   260,000  (7 transaksi)

LAPORAN KAS
Kas Awal        : Rp  200,000
+ Penjualan Cash: Rp  980,000
= Ekspektasi Kas: Rp 1,180,000
Kas Aktual      : Rp 1,175,000
Selisih         : Rp    -5,000  ⚠️

Catatan: "Tadi ada kembalian salah hitung"
```

### Alert Selisih Kas
- Selisih 0 → badge hijau ✅
- Selisih absolut > 0 dan < Rp 10.000 → badge kuning ⚠️
- Selisih absolut >= Rp 10.000 → badge merah 🚨
- *(Fase 2 — Sprint 6: kirim notifikasi in-app ke owner jika selisih absolut >= Rp 10.000)*
