<?php

namespace App\Http\Controllers\Kasir;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\Outlet;
use App\Models\Shift;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class KasirAuthController extends Controller
{
    public function selectOutlet(Business $business)
    {
        $outlets = $business->outlets()->where('is_active', true)->get();

        return Inertia::render('Kasir/SelectOutlet', [
            'business' => [
                'name' => $business->name,
                'slug' => $business->slug,
            ],
            'outlets' => $outlets,
        ]);
    }

    public function selectUser(Business $business, Outlet $outlet)
    {
        if ($outlet->business_id !== $business->id) {
            abort(404);
        }

        $users = $outlet->users()
            ->where('users.is_active', true)
            ->whereHas('roles', fn ($q) => $q->where('name', 'cashier'))
            ->get(['users.id', 'name', 'avatar']);

        return Inertia::render('Kasir/SelectUser', [
            'business' => [
                'name' => $business->name,
                'slug' => $business->slug,
            ],
            'outlet' => [
                'id' => $outlet->id,
                'name' => $outlet->name,
            ],
            'users' => $users,
        ]);
    }

    public function showPin(Business $business, Outlet $outlet, User $user)
    {
        if ($outlet->business_id !== $business->id || $user->business_id !== $business->id) {
            abort(404);
        }

        if (! $user->hasRole('cashier')) {
            abort(403);
        }

        if (! $outlet->users()->whereKey($user->id)->exists()) {
            abort(404);
        }

        return Inertia::render('Kasir/PinEntry', [
            'business' => [
                'name' => $business->name,
                'slug' => $business->slug,
            ],
            'outlet' => [
                'id' => $outlet->id,
                'name' => $outlet->name,
            ],
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'avatar' => $user->avatar,
            ],
            'isLocked' => $user->isPinLocked(),
            'lockedUntil' => $user->pin_locked_until?->toIso8601String(),
        ]);
    }

    public function verifyPin(Request $request, Business $business, Outlet $outlet, User $user)
    {
        $request->validate([
            'pin' => ['required', 'string', 'size:6'],
        ]);

        if ($outlet->business_id !== $business->id || $user->business_id !== $business->id) {
            abort(404);
        }

        if (! $user->hasRole('cashier')) {
            abort(403);
        }

        if (! $outlet->users()->whereKey($user->id)->exists()) {
            abort(404);
        }

        if (! $user->pin) {
            return back()->withErrors(['pin' => 'PIN belum diatur. Hubungi owner bisnis.']);
        }

        if ($user->isPinLocked()) {
            $minutes = now()->diffInMinutes($user->pin_locked_until);

            return back()->withErrors(['pin' => "Akun terkunci. Coba lagi {$minutes} menit lagi."]);
        }

        if (! Hash::check($request->pin, $user->pin)) {
            $user->incrementPinFailure();
            $user->refresh();

            if ($user->isPinLocked()) {
                return back()->withErrors(['pin' => 'Terlalu banyak percobaan. Akun terkunci 15 menit.']);
            }

            $remaining = 5 - $user->pin_failed_attempts;

            return back()->withErrors(['pin' => "PIN salah. Sisa {$remaining} percobaan."]);
        }

        $user->resetPinFailures();

        Auth::login($user);

        session([
            'active_outlet_id' => $outlet->id,
            'active_business_slug' => $business->slug,
        ]);

        return redirect()->route('shift.showOpen');
    }

    public function logout(Request $request)
    {
        $user = Auth::user();
        $activeOutletId = session('active_outlet_id');
        $businessSlug = session('active_business_slug');

        if ($user && $activeOutletId) {
            $activeShift = Shift::where('user_id', $user->id)
                ->where('outlet_id', $activeOutletId)
                ->whereNull('ended_at')
                ->first();

            if ($activeShift) {
                return redirect()->route('shift.showClose')
                    ->with('warning', 'Harap tutup shift terlebih dahulu sebelum logout.');
            }
        }

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        if ($businessSlug) {
            return redirect()->route('kasir.outlets', $businessSlug);
        }

        return redirect('/');
    }
}
