<?php

namespace App\Services;

use App\Models\Expense;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class FinanceService
{
    /**
     * Ringkasan keuangan harian untuk satu outlet.
     *
     * @return array{ income: float, expense: float, netCash: float, totalTransactions: int }
     */
    public function getDailySummary(string $outletId, string $date): array
    {
        $businessId = Auth::user()->business_id;
        $day = Carbon::parse($date);

        $income = (float) Transaction::where('business_id', $businessId)
            ->where('outlet_id', $outletId)
            ->whereDate('transaction_date', $day)
            ->where('is_void', false)
            ->sum('total');

        $totalTransactions = Transaction::where('business_id', $businessId)
            ->where('outlet_id', $outletId)
            ->whereDate('transaction_date', $day)
            ->where('is_void', false)
            ->count();

        $expense = (float) Expense::where('business_id', $businessId)
            ->where('outlet_id', $outletId)
            ->whereDate('expense_date', $day)
            ->sum('amount');

        return [
            'income'             => $income,
            'expense'            => $expense,
            'netCash'            => $income - $expense,
            'totalTransactions'  => $totalTransactions,
        ];
    }

    /**
     * Laporan Laba Rugi.
     * $outletId = null berarti agregat semua outlet dalam bisnis.
     *
     * @return array{
     *     income: float,
     *     cogs: float,
     *     grossProfit: float,
     *     totalExpense: float,
     *     netProfit: float,
     *     totalTransactions: int
     * }
     */
    public function getProfitLoss(?string $outletId, string $startDate, string $endDate): array
    {
        $businessId = Auth::user()->business_id;
        $start = Carbon::parse($startDate)->startOfDay();
        $end   = Carbon::parse($endDate)->endOfDay();

        $transactionQuery = Transaction::where('business_id', $businessId)
            ->whereBetween('transaction_date', [$start, $end])
            ->where('is_void', false);

        if ($outletId) {
            $transactionQuery->where('outlet_id', $outletId);
        }

        $income            = (float) (clone $transactionQuery)->sum('total');
        $totalTransactions = (clone $transactionQuery)->count();

        // HPP (COGS): dari transaction_items yang transaction-nya valid
        $cogsQuery = TransactionItem::whereHas('transaction', function ($q) use ($businessId, $start, $end, $outletId) {
            $q->where('business_id', $businessId)
              ->whereBetween('transaction_date', [$start, $end])
              ->where('is_void', false);

            if ($outletId) {
                $q->where('outlet_id', $outletId);
            }
        });

        $cogs = (float) $cogsQuery->selectRaw('SUM(quantity * cost_price) as total_cogs')->value('total_cogs');

        $grossProfit = $income - $cogs;

        $expenseQuery = Expense::where('business_id', $businessId)
            ->whereBetween('expense_date', [$start, $end]);

        if ($outletId) {
            $expenseQuery->where('outlet_id', $outletId);
        }

        $totalExpense = (float) $expenseQuery->sum('amount');
        $netProfit    = $grossProfit - $totalExpense;

        return [
            'income'            => $income,
            'cogs'              => $cogs,
            'grossProfit'       => $grossProfit,
            'totalExpense'      => $totalExpense,
            'netProfit'         => $netProfit,
            'totalTransactions' => $totalTransactions,
        ];
    }
}
