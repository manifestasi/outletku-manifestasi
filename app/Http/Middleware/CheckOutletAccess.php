<?php

namespace App\Http\Middleware;

use App\Models\Outlet;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckOutletAccess
{
    /**
     * Handle an incoming request.
     *
     * Ensures the user can only access outlets that belong to their business.
     * For cashiers, also verifies the outlet is assigned to them.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if (! $user) {
            return $next($request);
        }

        // Check if the route has an outlet parameter
        $outlet = $request->route('outlet');

        if ($outlet instanceof Outlet) {
            // Ensure the outlet belongs to the same business as the user
            if ($outlet->business_id !== $user->business_id) {
                abort(403, 'Access denied: outlet does not belong to your business.');
            }

            // For cashiers, also check they are assigned to the outlet
            if ($user->hasRole('cashier') && ! $user->outlets()->where('outlets.id', $outlet->id)->exists()) {
                abort(403, 'Access denied: you are not assigned to this outlet.');
            }
        }

        return $next($request);
    }
}
