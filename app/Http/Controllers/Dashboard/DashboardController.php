<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(private DashboardService $dashboardService)
    {
    }

    /**
     * Display the dashboard.
     * Sprint 2: stok kritis.
     * Sprint 3: omzet + transaksi hari ini.
     */
    public function index(): Response
    {
        $stockWidgets = $this->dashboardService->getStockWidgets();
        $basicWidgets = $this->dashboardService->getBasicWidgets();

        return Inertia::render('dashboard/index', [
            ...$basicWidgets,
            ...$stockWidgets,
        ]);
    }
}
