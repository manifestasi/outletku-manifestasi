<?php

namespace App\Http\Middleware;

use App\Models\Shift;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class KasirShiftMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();
        if (!$user) {
            return redirect('/');
        }

        $activeOutletId = session('active_outlet_id');

        if (!$activeOutletId) {
            // Jika tidak ada active outlet, asumsikan bukan dari alur Kasir
            return redirect('/'); 
        }

        // Cek shift yang sedang open (belum ended)
        $activeShift = Shift::where('user_id', $user->id)
            ->where('outlet_id', $activeOutletId)
            ->whereNull('ended_at')
            ->first();

        if (!$activeShift) {
            return redirect()->route('shift.showOpen');
        }

        // Set attributes on request for easy access
        $request->attributes->set('active_shift_id', $activeShift->id);
        $request->attributes->set('active_outlet_id', $activeOutletId);

        return $next($request);
    }
}
