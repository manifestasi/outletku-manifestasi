<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AnalyticsController extends Controller
{
    public function index(Request $request)
    {
        $days = (int) $request->get('days', 30);
        $start = now()->subDays($days - 1)->startOfDay();

        // Daily platform activity: valid transactions + users joined
        $dailyTrx = Transaction::where('is_void', false)
            ->whereDate('transaction_date', '>=', $start)
            ->selectRaw('DATE(transaction_date) as date, COUNT(*) as count, SUM(total) as revenue')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $dailySignups = Business::whereDate('created_at', '>=', $start)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $activityChart = collect();
        for ($i = $days - 1; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();
            $activityChart->push([
                'date'     => $date,
                'trx'      => $dailyTrx->has($date) ? (int) $dailyTrx[$date]->count : 0,
                'revenue'  => $dailyTrx->has($date) ? (float) $dailyTrx[$date]->revenue : 0.0,
                'signups'  => $dailySignups->has($date) ? (int) $dailySignups[$date]->count : 0,
            ]);
        }

        return Inertia::render('SuperAdmin/Analytics/Index', [
            'activityChart' => $activityChart,
            'days'          => $days,
        ]);
    }

    public function growth(Request $request)
    {
        // Monthly business growth (last 12 months)
        $growthData = Business::selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as new_businesses")
            ->where('created_at', '>=', now()->subMonths(11)->startOfMonth())
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Active vs inactive ratio per month
        $totalByMonth = Business::selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, SUM(is_active) as active, COUNT(*) - SUM(is_active) as inactive")
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return Inertia::render('SuperAdmin/Analytics/Growth', [
            'growthData'    => $growthData,
            'totalByMonth'  => $totalByMonth,
        ]);
    }

    public function activity(Request $request)
    {
        $days = (int) $request->get('days', 30);
        $start = now()->subDays($days - 1)->startOfDay();

        $activityByBusiness = Business::select('businesses.id', 'businesses.name', 'businesses.slug')
            ->leftJoin('transactions', function ($j) use ($start) {
                $j->on('transactions.business_id', '=', 'businesses.id')
                  ->where('transactions.is_void', false)
                  ->where('transactions.transaction_date', '>=', $start);
            })
            ->selectRaw('COALESCE(COUNT(transactions.id), 0) as trx_count, COALESCE(SUM(transactions.total), 0) as revenue')
            ->groupBy('businesses.id', 'businesses.name', 'businesses.slug')
            ->orderByDesc('trx_count')
            ->get();

        return Inertia::render('SuperAdmin/Analytics/Activity', [
            'activityByBusiness' => $activityByBusiness,
            'days'               => $days,
        ]);
    }

    public function churn(Request $request)
    {
        // Businesses inactive for 30/60/90 days
        $thresholds = [30, 60, 90];
        $churnData  = [];

        foreach ($thresholds as $days) {
            $cutoff = now()->subDays($days);
            $count  = Business::where('is_active', true)
                ->where(function ($q) use ($cutoff) {
                    $q->whereNull('last_activity_at')
                      ->orWhere('last_activity_at', '<', $cutoff);
                })
                ->count();
            $churnData[] = ['days' => $days, 'count' => $count];
        }

        $risky = Business::where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('last_activity_at')
                  ->orWhere('last_activity_at', '<', now()->subDays(30));
            })
            ->latest('last_activity_at')
            ->limit(20)
            ->get(['id', 'name', 'slug', 'owner_name', 'last_activity_at', 'created_at']);

        return Inertia::render('SuperAdmin/Analytics/Churn', [
            'churnData' => $churnData,
            'risky'     => $risky,
        ]);
    }
}
