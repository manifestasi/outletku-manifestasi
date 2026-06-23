<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $today       = now()->toDateString();
        $startOfMonth = now()->startOfMonth();

        $totalBusinesses  = Business::count();
        $activeBusinesses = Business::where('is_active', true)->count();
        $totalUsers       = User::count();

        $todayTransactions = Transaction::where('is_void', false)
            ->whereDate('transaction_date', $today)
            ->count();

        $todayRevenue = (float) Transaction::where('is_void', false)
            ->whereDate('transaction_date', $today)
            ->sum('total');

        $monthRevenue = (float) Transaction::where('is_void', false)
            ->whereDate('transaction_date', '>=', $startOfMonth)
            ->sum('total');

        // New businesses this month
        $newBusinessesThisMonth = Business::whereDate('created_at', '>=', $startOfMonth)->count();

        // Revenue last 7 days (global)
        $revenueChart = collect();
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();
            $rev  = (float) Transaction::where('is_void', false)
                ->whereDate('transaction_date', $date)
                ->sum('total');
            $cnt  = Transaction::where('is_void', false)
                ->whereDate('transaction_date', $date)
                ->count();
            $revenueChart->push(['date' => $date, 'revenue' => $rev, 'count' => $cnt]);
        }

        // Top 5 businesses by revenue all-time
        $topBusinesses = Business::select('businesses.id', 'businesses.name', 'businesses.slug', 'businesses.is_active')
            ->leftJoin('transactions', function ($j) {
                $j->on('transactions.business_id', '=', 'businesses.id')
                  ->where('transactions.is_void', false);
            })
            ->selectRaw('COALESCE(SUM(transactions.total), 0) as total_revenue, COUNT(CASE WHEN transactions.id IS NOT NULL THEN 1 END) as total_trx')
            ->groupBy('businesses.id', 'businesses.name', 'businesses.slug', 'businesses.is_active')
            ->orderByDesc('total_revenue')
            ->limit(5)
            ->get();

        // Recent 5 businesses
        $recentBusinesses = Business::latest()->limit(5)->get(['id', 'name', 'slug', 'owner_name', 'is_active', 'created_at', 'last_activity_at']);

        return Inertia::render('SuperAdmin/Dashboard', [
            'stats' => [
                'totalBusinesses'       => $totalBusinesses,
                'activeBusinesses'      => $activeBusinesses,
                'totalUsers'            => $totalUsers,
                'todayTransactions'     => $todayTransactions,
                'todayRevenue'          => $todayRevenue,
                'monthRevenue'          => $monthRevenue,
                'newBusinessesThisMonth'=> $newBusinessesThisMonth,
            ],
            'revenueChart'     => $revenueChart,
            'topBusinesses'    => $topBusinesses,
            'recentBusinesses' => $recentBusinesses,
        ]);
    }
}
