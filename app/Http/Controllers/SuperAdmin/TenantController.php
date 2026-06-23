<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;

class TenantController extends Controller
{
    public function index(Request $request)
    {
        $query = Business::withCount(['users', 'outlets'])
            ->withExists(['users as has_owner' => fn ($q) => $q->whereHas('roles', fn ($r) => $r->where('name', 'owner'))])
            ->when($request->filled('search'), fn ($q) => $q->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
                  ->orWhere('owner_name', 'like', "%{$request->search}%");
            }))
            ->when($request->filled('status'), fn ($q) => match ($request->status) {
                'active'   => $q->where('is_active', true),
                'inactive' => $q->where('is_active', false),
                default    => $q,
            })
            ->orderBy($request->get('sort', 'created_at'), $request->get('direction', 'desc'));

        $tenants = $query->paginate(15)->withQueryString();

        return Inertia::render('SuperAdmin/Tenants/Index', [
            'tenants' => $tenants,
            'filters' => $request->only(['search', 'status', 'sort', 'direction']),
        ]);
    }

    public function show(Business $business)
    {
        $business->loadCount(['users', 'outlets']);
        $business->load(['outlets:id,name,is_active,business_id']);

        $totalRevenue = (float) Transaction::where('business_id', $business->id)
            ->where('is_void', false)
            ->sum('total');

        $totalTransactions = Transaction::where('business_id', $business->id)
            ->where('is_void', false)
            ->count();

        // Revenue last 30 days
        $revenueChart = collect();
        for ($i = 29; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();
            $rev  = (float) Transaction::where('business_id', $business->id)
                ->where('is_void', false)
                ->whereDate('transaction_date', $date)
                ->sum('total');
            $revenueChart->push(['date' => $date, 'revenue' => $rev]);
        }

        $users = User::where('business_id', $business->id)
            ->with('roles:id,name')
            ->latest()
            ->get(['id', 'name', 'email', 'phone', 'is_active', 'last_login_at', 'created_at']);

        return Inertia::render('SuperAdmin/Tenants/Show', [
            'tenant'            => $business,
            'totalRevenue'      => $totalRevenue,
            'totalTransactions' => $totalTransactions,
            'revenueChart'      => $revenueChart,
            'users'             => $users,
        ]);
    }

    public function toggleActive(Business $business)
    {
        $business->update(['is_active' => ! $business->is_active]);

        $status = $business->is_active ? 'diaktifkan' : 'dinonaktifkan';
        return back()->with('success', "Bisnis \"{$business->name}\" berhasil {$status}.");
    }

    public function resetPassword(Business $business)
    {
        $owner = User::where('business_id', $business->id)
            ->whereHas('roles', fn ($q) => $q->where('name', 'owner'))
            ->first();

        if (! $owner) {
            return back()->with('error', 'Owner tidak ditemukan untuk bisnis ini.');
        }

        $newPassword = Str::random(12);
        $owner->update(['password' => Hash::make($newPassword)]);

        return back()->with('success', "Password owner berhasil direset. Password baru: {$newPassword}");
    }

    public function destroy(Business $business)
    {
        $business->delete();
        return redirect()->route('super-admin.tenants.index')
            ->with('success', "Bisnis \"{$business->name}\" berhasil dihapus.");
    }

    public function impersonate(Request $request, Business $business)
    {
        // Find owner of this business to impersonate
        $owner = User::where('business_id', $business->id)
            ->whereHas('roles', fn ($q) => $q->where('name', 'owner'))
            ->first();

        if (! $owner) {
            return back()->with('error', 'Owner tidak ditemukan untuk bisnis ini.');
        }

        // Store super admin impersonation state
        $request->session()->put('impersonating_super_admin_id', Auth::guard('super_admin')->id());
        $request->session()->put('impersonating_business_id', $business->id);

        // Login as the owner
        Auth::guard('web')->login($owner);
        $request->session()->put('active_business_id', $business->id);
        $request->session()->put('active_outlet_id', null);

        return redirect()->route('dashboard')
            ->with('info', "Anda sedang berada dalam mode impersonate sebagai {$owner->name} ({$business->name}).");
    }

    public function stopImpersonate(Request $request)
    {
        $superAdminId = $request->session()->pull('impersonating_super_admin_id');
        $request->session()->forget('impersonating_business_id');

        Auth::guard('web')->logout();

        // Re-login super admin
        if ($superAdminId) {
            $superAdmin = \App\Models\SuperAdmin::find($superAdminId);
            if ($superAdmin) {
                Auth::guard('super_admin')->login($superAdmin);
            }
        }

        return redirect()->route('super-admin.tenants.index')
            ->with('success', 'Mode impersonate diakhiri.');
    }
}
