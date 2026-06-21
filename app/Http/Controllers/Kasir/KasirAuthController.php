<?php

namespace App\Http\Controllers\Kasir;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\Outlet;
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

        $users = $outlet->users()->where('is_active', true)->get(['users.id', 'name', 'avatar']);
        
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
        ]);
    }

    public function verifyPin(Request $request, Business $business, Outlet $outlet, User $user)
    {
        $request->validate([
            'pin' => ['required', 'string', 'size:6'],
        ]);

        if (Hash::check($request->pin, $user->pin)) {
            Auth::login($user);
            
            // Set session so we know which outlet they are operating in
            session(['active_outlet_id' => $outlet->id]);

            return redirect()->route('pos.index');
        }

        return back()->withErrors(['pin' => 'PIN salah. Silakan coba lagi.']);
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
