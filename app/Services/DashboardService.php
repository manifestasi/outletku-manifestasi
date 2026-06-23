<?php

namespace App\Services;

use App\Models\Expense;
use App\Models\Outlet;
use App\Models\Shift;
use App\Models\Stock;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    // ─────────────────────────────────────────────────────────────
    // WIDGET CARDS
    // ─────────────────────────────────────────────────────────────

    /**
     * Semua widget card untuk dashboard:
     *   todayRevenue, todayTransactions, activeOutlets,
     *   todayExpense, todayNetCash, lowStockCount
     */
    public function getWidgetCards(): array
    {
        $user       = Auth::user();
        $businessId = $user->business_id;
        $today      = now()->toDateString();

        $todayRevenue = (float) Transaction::where('business_id', $businessId)
            ->whereDate('transaction_date', $today)
            ->where('is_void', false)
            ->sum('total');

        $todayTransactions = Transaction::where('business_id', $businessId)
            ->whereDate('transaction_date', $today)
            ->where('is_void', false)
            ->count();

        $activeOutlets = Outlet::where('business_id', $businessId)
            ->where('is_active', true)
            ->count();

        $todayExpense = (float) Expense::where('business_id', $businessId)
            ->whereDate('expense_date', $today)
            ->sum('amount');

        $lowStockCount = Stock::whereHas('outlet', fn ($q) => $q->where('business_id', $businessId))
            ->whereRaw('quantity <= low_stock_threshold')
            ->count();

        return [
            'todayRevenue'     => $todayRevenue,
            'todayTransactions'=> $todayTransactions,
            'activeOutlets'    => $activeOutlets,
            'todayExpense'     => $todayExpense,
            'todayNetCash'     => $todayRevenue - $todayExpense,
            'lowStockCount'    => $lowStockCount,
        ];
    }

    // ─────────────────────────────────────────────────────────────
    // GRAFIK: OMZET 7 HARI TERAKHIR
    // ─────────────────────────────────────────────────────────────

    /**
     * @return Collection<int, object{date: string, revenue: float, count: int}>
     */
    public function getRevenueLast7Days(): Collection
    {
        $businessId = Auth::user()->business_id;
        $start      = now()->subDays(6)->startOfDay();
        $end        = now()->endOfDay();

        $rows = Transaction::where('business_id', $businessId)
            ->whereBetween('transaction_date', [$start, $end])
            ->where('is_void', false)
            ->selectRaw('DATE(transaction_date) as date, SUM(total) as revenue, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        // Ensure all 7 days are represented (fill zeros for empty days)
        $days = collect();
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();
            $row  = $rows->get($date);
            $days->push([
                'date'    => $date,
                'revenue' => $row ? (float) $row->revenue : 0.0,
                'count'   => $row ? (int) $row->count : 0,
            ]);
        }

        return $days;
    }

    // ─────────────────────────────────────────────────────────────
    // TABEL: 5 TRANSAKSI TERBARU
    // ─────────────────────────────────────────────────────────────

    public function getRecentTransactions(): Collection
    {
        $businessId = Auth::user()->business_id;

        return Transaction::with(['outlet:id,name', 'user:id,name'])
            ->where('business_id', $businessId)
            ->where('is_void', false)
            ->latest('transaction_date')
            ->limit(5)
            ->get(['id', 'invoice_number', 'transaction_date', 'outlet_id', 'user_id', 'total', 'payment_method']);
    }

    // ─────────────────────────────────────────────────────────────
    // TABEL: 5 PRODUK TERLARIS BULAN INI
    // ─────────────────────────────────────────────────────────────

    public function getTopProducts(): Collection
    {
        $businessId = Auth::user()->business_id;
        $start      = now()->startOfMonth()->startOfDay();
        $end        = now()->endOfDay();

        return TransactionItem::join('transactions', 'transactions.id', '=', 'transaction_items.transaction_id')
            ->join('products', 'products.id', '=', 'transaction_items.product_id')
            ->where('transactions.business_id', $businessId)
            ->where('transactions.is_void', false)
            ->whereBetween('transactions.transaction_date', [$start, $end])
            ->select(
                'products.id',
                'products.name as product_name',
                DB::raw('SUM(transaction_items.quantity) as total_qty'),
                DB::raw('SUM(transaction_items.total) as total_revenue'),
            )
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('total_qty')
            ->limit(5)
            ->get();
    }

    // ─────────────────────────────────────────────────────────────
    // TABEL: RINGKASAN PER OUTLET
    // ─────────────────────────────────────────────────────────────

    /**
     * @return Collection<int, array{id: string, name: string, todayRevenue: float, todayTransactions: int, openShifts: int}>
     */
    public function getOutletSummary(): Collection
    {
        $businessId = Auth::user()->business_id;
        $today      = now()->toDateString();

        return Outlet::where('business_id', $businessId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(function (Outlet $outlet) use ($today) {
                $todayRevenue = (float) Transaction::where('outlet_id', $outlet->id)
                    ->whereDate('transaction_date', $today)
                    ->where('is_void', false)
                    ->sum('total');

                $todayTransactions = Transaction::where('outlet_id', $outlet->id)
                    ->whereDate('transaction_date', $today)
                    ->where('is_void', false)
                    ->count();

                $openShifts = Shift::where('outlet_id', $outlet->id)
                    ->whereNull('ended_at')
                    ->count();

                return [
                    'id'               => $outlet->id,
                    'name'             => $outlet->name,
                    'todayRevenue'     => $todayRevenue,
                    'todayTransactions'=> $todayTransactions,
                    'openShifts'       => $openShifts,
                ];
            });
    }

    // ─────────────────────────────────────────────────────────────
    // ALERT: STOK MENIPIS
    // ─────────────────────────────────────────────────────────────

    public function getLowStockAlerts(): Collection
    {
        $businessId = Auth::user()->business_id;

        return Stock::with(['outlet:id,name', 'product:id,name,sku,unit'])
            ->whereHas('outlet', fn ($q) => $q->where('business_id', $businessId))
            ->whereRaw('quantity <= low_stock_threshold')
            ->orderBy('quantity')
            ->get();
    }
}
