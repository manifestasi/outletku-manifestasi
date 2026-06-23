<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(private readonly DashboardService $dashboardService) {}

    public function index(): Response
    {
        return Inertia::render('dashboard/index', [
            ...$this->dashboardService->getWidgetCards(),
            'revenueChart'   => $this->dashboardService->getRevenueLast7Days(),
            'recentTrx'      => $this->dashboardService->getRecentTransactions(),
            'topProducts'    => $this->dashboardService->getTopProducts(),
            'outletSummary'  => $this->dashboardService->getOutletSummary(),
            'lowStockAlerts' => $this->dashboardService->getLowStockAlerts(),
        ]);
    }
}
