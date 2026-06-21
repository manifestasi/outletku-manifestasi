<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\Outlet;
use App\Services\FinanceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class FinanceController extends Controller
{
    public function __construct(private FinanceService $financeService) {}

    /**
     * Ringkasan keuangan harian per outlet.
     */
    public function daily(Request $request)
    {
        $user    = Auth::user();
        $outlets = Outlet::where('business_id', $user->business_id)->orderBy('name')->get(['id', 'name']);

        $selectedOutlet = $request->query('outlet_id', $outlets->first()?->id);
        $selectedDate   = $request->query('date', now()->toDateString());

        $summary = $selectedOutlet
            ? $this->financeService->getDailySummary($selectedOutlet, $selectedDate)
            : ['income' => 0, 'expense' => 0, 'netCash' => 0, 'totalTransactions' => 0];

        return Inertia::render('Finance/Daily', [
            'outlets'        => $outlets,
            'selectedOutlet' => $selectedOutlet,
            'selectedDate'   => $selectedDate,
            'summary'        => $summary,
        ]);
    }

    /**
     * Laporan Laba Rugi.
     */
    public function profitLoss(Request $request)
    {
        $user    = Auth::user();
        $outlets = Outlet::where('business_id', $user->business_id)->orderBy('name')->get(['id', 'name']);

        $startDate  = $request->query('start_date', now()->startOfMonth()->toDateString());
        $endDate    = $request->query('end_date', now()->toDateString());
        $outletId   = $request->query('outlet_id');

        $report = null;
        if ($request->hasAny(['start_date', 'end_date', 'outlet_id'])) {
            $report = $this->financeService->getProfitLoss(
                $outletId ?: null,
                $startDate,
                $endDate
            );
        }

        return Inertia::render('Finance/ProfitLoss', [
            'outlets'   => $outlets,
            'startDate' => $startDate,
            'endDate'   => $endDate,
            'outletId'  => $outletId,
            'report'    => $report,
        ]);
    }
}
