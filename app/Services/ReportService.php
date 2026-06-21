<?php

namespace App\Services;

use App\Models\Expense;
use App\Models\Stock;
use App\Models\StockMovement;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ReportService
{
    // ─────────────────────────────────────────────────────────────
    // LAPORAN PENJUALAN
    // ─────────────────────────────────────────────────────────────

    /**
     * Ringkasan header penjualan (total, jumlah transaksi, rata-rata).
     *
     * @return array{totalRevenue: float, totalTransactions: int, avgTransaction: float, totalDiscount: float}
     */
    public function getSalesSummary(?string $outletId, string $startDate, string $endDate): array
    {
        $query = $this->baseSalesQuery($outletId, $startDate, $endDate);

        return [
            'totalRevenue'      => (float) (clone $query)->sum('total'),
            'totalTransactions' => (clone $query)->count(),
            'avgTransaction'    => (float) (clone $query)->avg('total') ?? 0.0,
            'totalDiscount'     => (float) (clone $query)->sum('discount'),
        ];
    }

    /**
     * Baris transaksi penjualan (untuk tabel & export).
     */
    public function getSalesRows(?string $outletId, string $startDate, string $endDate): Collection
    {
        return $this->baseSalesQuery($outletId, $startDate, $endDate)
            ->with(['outlet:id,name', 'user:id,name'])
            ->orderBy('transaction_date', 'desc')
            ->get([
                'id',
                'invoice_number',
                'transaction_date',
                'outlet_id',
                'user_id',
                'subtotal',
                'discount',
                'total',
                'payment_method',
                'is_void',
            ]);
    }

    /**
     * Omzet per hari (untuk grafik).
     */
    public function getSalesByDay(?string $outletId, string $startDate, string $endDate): Collection
    {
        $businessId = Auth::user()->business_id;
        $start      = Carbon::parse($startDate)->startOfDay();
        $end        = Carbon::parse($endDate)->endOfDay();

        $query = Transaction::where('business_id', $businessId)
            ->whereBetween('transaction_date', [$start, $end])
            ->where('is_void', false)
            ->selectRaw('DATE(transaction_date) as date, SUM(total) as revenue, COUNT(*) as count');

        if ($outletId) {
            $query->where('outlet_id', $outletId);
        }

        return $query->groupBy('date')->orderBy('date')->get();
    }

    /**
     * Top 10 produk terlaris dalam periode.
     */
    public function getTopProducts(?string $outletId, string $startDate, string $endDate): Collection
    {
        $businessId = Auth::user()->business_id;
        $start      = Carbon::parse($startDate)->startOfDay();
        $end        = Carbon::parse($endDate)->endOfDay();

        return TransactionItem::join('transactions', 'transactions.id', '=', 'transaction_items.transaction_id')
            ->join('products', 'products.id', '=', 'transaction_items.product_id')
            ->where('transactions.business_id', $businessId)
            ->where('transactions.is_void', false)
            ->whereBetween('transactions.transaction_date', [$start, $end])
            ->when($outletId, fn ($q) => $q->where('transactions.outlet_id', $outletId))
            ->select(
                'products.id',
                'products.name as product_name',
                DB::raw('SUM(transaction_items.quantity) as total_qty'),
                DB::raw('SUM(transaction_items.subtotal) as total_revenue'),
            )
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('total_qty')
            ->limit(10)
            ->get();
    }

    // ─────────────────────────────────────────────────────────────
    // LAPORAN STOK
    // ─────────────────────────────────────────────────────────────

    /**
     * Daftar stok semua produk per outlet (untuk tabel laporan).
     */
    public function getStockReport(?string $outletId): Collection
    {
        $businessId = Auth::user()->business_id;

        return Stock::with(['product:id,name,sku', 'outlet:id,name'])
            ->whereHas('outlet', fn ($q) => $q->where('business_id', $businessId))
            ->when($outletId, fn ($q) => $q->where('outlet_id', $outletId))
            ->orderBy('outlet_id')
            ->get(['id', 'outlet_id', 'product_id', 'quantity', 'low_stock_threshold']);
    }

    /**
     * Histori pergerakan stok dalam periode.
     */
    public function getStockMovements(?string $outletId, string $startDate, string $endDate): Collection
    {
        $businessId = Auth::user()->business_id;
        $start      = Carbon::parse($startDate)->startOfDay();
        $end        = Carbon::parse($endDate)->endOfDay();

        return StockMovement::with(['stock.product:id,name,sku', 'stock.outlet:id,name', 'user:id,name'])
            ->whereHas('stock.outlet', fn ($q) => $q->where('business_id', $businessId))
            ->when($outletId, fn ($q) => $q->whereHas('stock', fn ($sq) => $sq->where('outlet_id', $outletId)))
            ->whereBetween('created_at', [$start, $end])
            ->orderByDesc('created_at')
            ->get(['id', 'stock_id', 'type', 'quantity_before', 'quantity_after', 'quantity_change', 'note', 'created_by', 'created_at']);
    }

    // ─────────────────────────────────────────────────────────────
    // LAPORAN PENGELUARAN
    // ─────────────────────────────────────────────────────────────

    /**
     * Pengeluaran per kategori (digunakan untuk tabel & export).
     *
     * @return Collection<int, object{category_name: string, total: float, count: int}>
     */
    public function getExpenseByCategory(?string $outletId, string $startDate, string $endDate): Collection
    {
        $businessId = Auth::user()->business_id;
        $start      = Carbon::parse($startDate)->startOfDay();
        $end        = Carbon::parse($endDate)->endOfDay();

        return Expense::join('expense_categories', function ($j) {
            $j->on('expense_categories.id', '=', 'expenses.expense_category_id');
        })
            ->where('expenses.business_id', $businessId)
            ->whereBetween('expenses.expense_date', [$start, $end])
            ->when($outletId, fn ($q) => $q->where('expenses.outlet_id', $outletId))
            ->select(
                'expense_categories.name as category_name',
                DB::raw('SUM(expenses.amount) as total'),
                DB::raw('COUNT(*) as count'),
            )
            ->groupBy('expense_categories.name')
            ->orderByDesc('total')
            ->get();
    }

    /**
     * Baris detail pengeluaran (untuk tabel & export).
     */
    public function getExpenseRows(?string $outletId, string $startDate, string $endDate): Collection
    {
        $businessId = Auth::user()->business_id;
        $start      = Carbon::parse($startDate)->startOfDay();
        $end        = Carbon::parse($endDate)->endOfDay();

        return Expense::with(['outlet:id,name', 'category:id,name', 'createdBy:id,name'])
            ->where('business_id', $businessId)
            ->whereBetween('expense_date', [$start, $end])
            ->when($outletId, fn ($q) => $q->where('outlet_id', $outletId))
            ->orderByDesc('expense_date')
            ->get(['id', 'outlet_id', 'expense_category_id', 'amount', 'expense_date', 'description', 'created_by']);
    }

    // ─────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────

    private function baseSalesQuery(?string $outletId, string $startDate, string $endDate)
    {
        $businessId = Auth::user()->business_id;
        $start      = Carbon::parse($startDate)->startOfDay();
        $end        = Carbon::parse($endDate)->endOfDay();

        return Transaction::where('business_id', $businessId)
            ->whereBetween('transaction_date', [$start, $end])
            ->where('is_void', false)
            ->when($outletId, fn ($q) => $q->where('outlet_id', $outletId));
    }
}
