<?php

namespace App\Services;

use App\Models\Stock;
use Illuminate\Support\Facades\Auth;

class DashboardService
{
    /**
     * Sprint 2: Ambil widget stok kritis untuk dashboard dasar.
     * Mengembalikan daftar stok yang quantity <= low_stock_threshold.
     *
     * @return array{ lowStockAlerts: \Illuminate\Support\Collection }
     */
    public function getStockWidgets(): array
    {
        $lowStockAlerts = Stock::with(['outlet:id,name', 'product:id,name,sku,unit'])
            ->whereHas('outlet')
            ->whereRaw('quantity <= low_stock_threshold')
            ->orderBy('quantity')
            ->get();

        return [
            'lowStockAlerts' => $lowStockAlerts,
        ];
    }

    /**
     * Sprint 3: Widget Omzet dan Transaksi.
     *
     * @return array{ todayRevenue: int, todayTransactions: int, activeOutlets: int }
     */
    public function getBasicWidgets(): array
    {
        $user = Auth::user();
        if (!$user) {
            return ['todayRevenue' => 0, 'todayTransactions' => 0, 'activeOutlets' => 0];
        }

        $activeOutlets = \App\Models\Outlet::where('business_id', $user->business_id)
            ->where('is_active', true)
            ->count();

        // Get today's start and end date
        $startOfDay = now()->startOfDay();
        $endOfDay = now()->endOfDay();

        // Query today's transactions
        $transactionsQuery = \App\Models\Transaction::where('business_id', $user->business_id)
            ->whereBetween('transaction_date', [$startOfDay, $endOfDay])
            ->where('is_void', false);

        $todayRevenue = (float) $transactionsQuery->sum('total');
        $todayTransactions = $transactionsQuery->count();

        return [
            'todayRevenue'       => $todayRevenue,
            'todayTransactions'  => $todayTransactions,
            'activeOutlets'      => $activeOutlets,
        ];
    }
}
