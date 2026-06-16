<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class SetActiveBusiness
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check() && Auth::user()->business_id) {
            // The BusinessScope automatically handles query filtering via business_id.
            // This middleware can be used for additional request-level context if needed.
            $request->merge(['active_business_id' => Auth::user()->business_id]);
        }

        return $next($request);
    }
}
