<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SuperAdminAuth
{
    public function handle(Request $request, Closure $next): mixed
    {
        if (! Auth::guard('super_admin')->check()) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }

            return redirect()->route('super-admin.login');
        }

        if (! Auth::guard('super_admin')->user()->is_active) {
            Auth::guard('super_admin')->logout();
            return redirect()->route('super-admin.login')->with('error', 'Akun super admin telah dinonaktifkan.');
        }

        return $next($request);
    }
}
