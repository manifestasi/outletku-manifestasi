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
     * Sprint 3 (placeholder): Akan diisi saat modul transaksi selesai.
     * Kembalikan array kosong agar DashboardController tidak error di Sprint 2.
     *
     * @return array{ todayRevenue: int, todayTransactions: int, activeOutlets: int }
     */
    public function getBasicWidgets(): array
    {
        $activeOutlets = Auth::check()
            ? \App\Models\Outlet::where('is_active', true)->count()
            : 0;

        return [
            'todayRevenue'       => 0,   // Sprint 3: dari transactions.total
            'todayTransactions'  => 0,   // Sprint 3: count transaksi valid
            'activeOutlets'      => $activeOutlets,
        ];
    }
}
