<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\Outlet;
use App\Models\ExpenseCategory;
use App\Services\FinanceService;
use App\Services\ReportService;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use OpenSpout\Writer\XLSX\Writer;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Writer\XLSX\Options;

class ReportController extends Controller
{
    public function __construct(
        private readonly ReportService  $reportService,
        private readonly FinanceService $financeService,
    ) {}

    // ─────────────────────────────────────────────────────────────
    // LAPORAN PENJUALAN
    // ─────────────────────────────────────────────────────────────

    public function sales(Request $request)
    {
        $user      = Auth::user();
        $outlets   = Outlet::where('business_id', $user->business_id)->orderBy('name')->get(['id', 'name']);
        $outletId  = $request->outlet_id ?: null;
        $startDate = $request->start_date ?: now()->startOfMonth()->toDateString();
        $endDate   = $request->end_date   ?: now()->toDateString();

        $rows       = $this->reportService->getSalesRows($outletId, $startDate, $endDate);
        $summary    = $this->reportService->getSalesSummary($outletId, $startDate, $endDate);
        $byDay      = $this->reportService->getSalesByDay($outletId, $startDate, $endDate);
        $topProducts = $this->reportService->getTopProducts($outletId, $startDate, $endDate);

        return Inertia::render('Reports/Sales', [
            'outlets'     => $outlets,
            'transactions' => $rows,
            'summary'     => $summary,
            'byDay'       => $byDay,
            'topProducts' => $topProducts,
            'filters'     => compact('outletId', 'startDate', 'endDate'),
        ]);
    }

    public function exportSalesExcel(Request $request)
    {
        $outletId  = $request->outlet_id ?: null;
        $startDate = $request->start_date ?: now()->startOfMonth()->toDateString();
        $endDate   = $request->end_date   ?: now()->toDateString();

        $rows = $this->reportService->getSalesRows($outletId, $startDate, $endDate);

        $filename = 'laporan-penjualan-' . $startDate . '-' . $endDate . '.xlsx';

        return response()->stream(function () use ($rows) {
            $writer = new Writer();
            $writer->openToFile('php://output');

            $writer->addRow(Row::fromValues([
                'No', 'Invoice', 'Tanggal', 'Outlet', 'Kasir',
                'Subtotal', 'Diskon', 'Total', 'Metode Bayar',
            ]));

            foreach ($rows as $i => $trx) {
                $writer->addRow(Row::fromValues([
                    $i + 1,
                    $trx->invoice_number,
                    Carbon::parse($trx->transaction_date)->format('d/m/Y H:i'),
                    $trx->outlet?->name ?? '-',
                    $trx->user?->name ?? '-',
                    (float) $trx->subtotal,
                    (float) $trx->discount,
                    (float) $trx->total,
                    $trx->payment_method,
                ]));
            }

            $writer->close();
        }, 200, [
            'Content-Type'        => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    public function exportSalesPdf(Request $request)
    {
        $outletId  = $request->outlet_id ?: null;
        $startDate = $request->start_date ?: now()->startOfMonth()->toDateString();
        $endDate   = $request->end_date   ?: now()->toDateString();

        $rows    = $this->reportService->getSalesRows($outletId, $startDate, $endDate);
        $summary = $this->reportService->getSalesSummary($outletId, $startDate, $endDate);

        $outlet = $outletId
            ? Outlet::find($outletId)?->name
            : 'Semua Outlet';

        $pdf = Pdf::loadView('pdf.report-sales', compact('rows', 'summary', 'startDate', 'endDate', 'outlet'))
            ->setPaper('a4', 'landscape');

        return $pdf->download('laporan-penjualan-' . $startDate . '-' . $endDate . '.pdf');
    }

    // ─────────────────────────────────────────────────────────────
    // LAPORAN STOK
    // ─────────────────────────────────────────────────────────────

    public function stock(Request $request)
    {
        $user      = Auth::user();
        $outlets   = Outlet::where('business_id', $user->business_id)->orderBy('name')->get(['id', 'name']);
        $outletId  = $request->outlet_id ?: null;
        $startDate = $request->start_date ?: now()->startOfMonth()->toDateString();
        $endDate   = $request->end_date   ?: now()->toDateString();

        $stocks    = $this->reportService->getStockReport($outletId);
        $movements = $this->reportService->getStockMovements($outletId, $startDate, $endDate);

        return Inertia::render('Reports/Stock', [
            'outlets'   => $outlets,
            'stocks'    => $stocks,
            'movements' => $movements,
            'filters'   => compact('outletId', 'startDate', 'endDate'),
        ]);
    }

    public function exportStockExcel(Request $request)
    {
        $outletId = $request->outlet_id ?: null;
        $stocks   = $this->reportService->getStockReport($outletId);

        $filename = 'laporan-stok-' . now()->toDateString() . '.xlsx';

        return response()->stream(function () use ($stocks) {
            $writer = new Writer();
            $writer->openToFile('php://output');

            $writer->addRow(Row::fromValues([
                'No', 'Produk', 'SKU', 'Outlet', 'Stok Saat Ini', 'Batas Stok Rendah', 'Status',
            ]));

            foreach ($stocks as $i => $stock) {
                $status = $stock->quantity <= $stock->low_stock_threshold ? 'Rendah' : 'Normal';
                $writer->addRow(Row::fromValues([
                    $i + 1,
                    $stock->product?->name ?? '-',
                    $stock->product?->sku ?? '-',
                    $stock->outlet?->name ?? '-',
                    $stock->quantity,
                    $stock->low_stock_threshold,
                    $status,
                ]));
            }

            $writer->close();
        }, 200, [
            'Content-Type'        => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    public function exportStockPdf(Request $request)
    {
        $outletId = $request->outlet_id ?: null;
        $stocks   = $this->reportService->getStockReport($outletId);

        $outlet = $outletId
            ? Outlet::find($outletId)?->name
            : 'Semua Outlet';

        $pdf = Pdf::loadView('pdf.report-stock', compact('stocks', 'outlet'))
            ->setPaper('a4', 'portrait');

        return $pdf->download('laporan-stok-' . now()->toDateString() . '.pdf');
    }

    // ─────────────────────────────────────────────────────────────
    // LAPORAN PENGELUARAN
    // ─────────────────────────────────────────────────────────────

    public function expense(Request $request)
    {
        $user       = Auth::user();
        $outlets    = Outlet::where('business_id', $user->business_id)->orderBy('name')->get(['id', 'name']);
        $categories = ExpenseCategory::where('business_id', $user->business_id)->orderBy('name')->get(['id', 'name']);
        $outletId   = $request->outlet_id ?: null;
        $startDate  = $request->start_date ?: now()->startOfMonth()->toDateString();
        $endDate    = $request->end_date   ?: now()->toDateString();

        $byCategory = $this->reportService->getExpenseByCategory($outletId, $startDate, $endDate);
        $rows       = $this->reportService->getExpenseRows($outletId, $startDate, $endDate);
        $totalAmount = $rows->sum('amount');

        return Inertia::render('Reports/Expense', [
            'outlets'     => $outlets,
            'categories'  => $categories,
            'byCategory'  => $byCategory,
            'rows'        => $rows,
            'totalAmount' => (float) $totalAmount,
            'filters'     => compact('outletId', 'startDate', 'endDate'),
        ]);
    }

    public function exportExpenseExcel(Request $request)
    {
        $outletId  = $request->outlet_id ?: null;
        $startDate = $request->start_date ?: now()->startOfMonth()->toDateString();
        $endDate   = $request->end_date   ?: now()->toDateString();

        $rows = $this->reportService->getExpenseRows($outletId, $startDate, $endDate);
        $filename = 'laporan-pengeluaran-' . $startDate . '-' . $endDate . '.xlsx';

        return response()->stream(function () use ($rows) {
            $writer = new Writer();
            $writer->openToFile('php://output');

            $writer->addRow(Row::fromValues([
                'No', 'Tanggal', 'Kategori', 'Outlet', 'Jumlah', 'Deskripsi', 'Dicatat oleh',
            ]));

            foreach ($rows as $i => $exp) {
                $writer->addRow(Row::fromValues([
                    $i + 1,
                    Carbon::parse($exp->expense_date)->format('d/m/Y'),
                    $exp->category?->name ?? '-',
                    $exp->outlet?->name ?? 'Semua',
                    (float) $exp->amount,
                    $exp->description ?? '-',
                    $exp->createdBy?->name ?? '-',
                ]));
            }

            $writer->close();
        }, 200, [
            'Content-Type'        => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    public function exportExpensePdf(Request $request)
    {
        $outletId  = $request->outlet_id ?: null;
        $startDate = $request->start_date ?: now()->startOfMonth()->toDateString();
        $endDate   = $request->end_date   ?: now()->toDateString();

        $rows       = $this->reportService->getExpenseRows($outletId, $startDate, $endDate);
        $byCategory = $this->reportService->getExpenseByCategory($outletId, $startDate, $endDate);
        $totalAmount = $rows->sum('amount');

        $outlet = $outletId ? Outlet::find($outletId)?->name : 'Semua Outlet';

        $pdf = Pdf::loadView('pdf.report-expense', compact('rows', 'byCategory', 'totalAmount', 'outlet', 'startDate', 'endDate'))
            ->setPaper('a4', 'portrait');

        return $pdf->download('laporan-pengeluaran-' . $startDate . '-' . $endDate . '.pdf');
    }

    // ─────────────────────────────────────────────────────────────
    // LAPORAN LABA RUGI
    // ─────────────────────────────────────────────────────────────

    public function profitLoss(Request $request)
    {
        $user      = Auth::user();
        $outlets   = Outlet::where('business_id', $user->business_id)->orderBy('name')->get(['id', 'name']);
        $outletId  = $request->outlet_id ?: null;
        $startDate = $request->start_date ?: now()->startOfMonth()->toDateString();
        $endDate   = $request->end_date   ?: now()->toDateString();

        $report = $this->financeService->getProfitLoss($outletId, $startDate, $endDate);

        return Inertia::render('Reports/ProfitLoss', [
            'outlets'   => $outlets,
            'report'    => $report,
            'filters'   => compact('outletId', 'startDate', 'endDate'),
        ]);
    }

    public function exportProfitLossExcel(Request $request)
    {
        $outletId  = $request->outlet_id ?: null;
        $startDate = $request->start_date ?: now()->startOfMonth()->toDateString();
        $endDate   = $request->end_date   ?: now()->toDateString();

        $report   = $this->financeService->getProfitLoss($outletId, $startDate, $endDate);
        $filename = 'laporan-laba-rugi-' . $startDate . '-' . $endDate . '.xlsx';

        $outlet = $outletId ? Outlet::find($outletId)?->name : 'Semua Outlet';

        return response()->stream(function () use ($report, $startDate, $endDate, $outlet) {
            $writer = new Writer();
            $writer->openToFile('php://output');

            $writer->addRow(Row::fromValues(['Laporan Laba Rugi']));
            $writer->addRow(Row::fromValues(['Outlet', $outlet]));
            $writer->addRow(Row::fromValues(['Periode', $startDate . ' s/d ' . $endDate]));
            $writer->addRow(Row::fromValues([]));

            $writer->addRow(Row::fromValues(['Keterangan', 'Jumlah (Rp)']));
            $writer->addRow(Row::fromValues(['Pendapatan (Omzet)', $report['income']]));
            $writer->addRow(Row::fromValues(['HPP / COGS', -$report['cogs']]));
            $writer->addRow(Row::fromValues(['Laba Kotor', $report['grossProfit']]));
            $writer->addRow(Row::fromValues(['Total Pengeluaran Operasional', -$report['totalExpense']]));
            $writer->addRow(Row::fromValues(['Laba Bersih', $report['netProfit']]));
            $writer->addRow(Row::fromValues([]));
            $writer->addRow(Row::fromValues(['Total Transaksi', $report['totalTransactions']]));

            $writer->close();
        }, 200, [
            'Content-Type'        => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    public function exportProfitLossPdf(Request $request)
    {
        $outletId  = $request->outlet_id ?: null;
        $startDate = $request->start_date ?: now()->startOfMonth()->toDateString();
        $endDate   = $request->end_date   ?: now()->toDateString();

        $report = $this->financeService->getProfitLoss($outletId, $startDate, $endDate);
        $outlet = $outletId ? Outlet::find($outletId)?->name : 'Semua Outlet';

        $pdf = Pdf::loadView('pdf.report-profit-loss', compact('report', 'outlet', 'startDate', 'endDate'))
            ->setPaper('a4', 'portrait');

        return $pdf->download('laporan-laba-rugi-' . $startDate . '-' . $endDate . '.pdf');
    }

    // ─────────────────────────────────────────────────────────────
    // LAPORAN SHIFT
    // ─────────────────────────────────────────────────────────────

    public function exportShiftPdf(Request $request, string $shiftId)
    {
        $shift = \App\Models\Shift::with([
            'outlet:id,name',
            'user:id,name',
            'transactions.items.product:id,name',
        ])->where('business_id', Auth::user()->business_id)->findOrFail($shiftId);

        $cashSales   = $shift->transactions->where('is_void', false)->where('payment_method', 'cash')->sum('total');
        $totalSales  = $shift->transactions->where('is_void', false)->sum('total');
        $trxCount    = $shift->transactions->where('is_void', false)->count();
        $cashDiff    = ($shift->opening_cash + $cashSales) - $shift->closing_cash;

        $pdf = Pdf::loadView('pdf.report-shift', compact('shift', 'cashSales', 'totalSales', 'trxCount', 'cashDiff'))
            ->setPaper('a4', 'portrait');

        return $pdf->download('rekap-shift-' . $shift->id . '.pdf');
    }
}
