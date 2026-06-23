<?php

namespace App\Http\Controllers\AuditLog;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Spatie\Activitylog\Models\Activity;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $businessId = Auth::user()->business_id;

        // Only show logs caused by users within this business
        $userIds = \App\Models\User::where('business_id', $businessId)->pluck('id');

        $query = Activity::with(['causer:id,name', 'subject'])
            ->whereIn('causer_id', $userIds)
            ->where('causer_type', \App\Models\User::class);

        if ($request->filled('log_name')) {
            $query->where('log_name', $request->log_name);
        }

        if ($request->filled('causer_id')) {
            $query->where('causer_id', $request->causer_id);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $logs = $query->latest()->paginate(25)->withQueryString();

        $users = \App\Models\User::where('business_id', $businessId)
            ->orderBy('name')
            ->get(['id', 'name']);

        $logNames = Activity::whereIn('causer_id', $userIds)
            ->where('causer_type', \App\Models\User::class)
            ->distinct()
            ->pluck('log_name')
            ->sort()
            ->values();

        return Inertia::render('AuditLog/Index', [
            'logs'     => $logs,
            'users'    => $users,
            'logNames' => $logNames,
            'filters'  => $request->only(['log_name', 'causer_id', 'date_from', 'date_to']),
        ]);
    }
}
