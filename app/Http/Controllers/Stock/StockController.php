<?php

namespace App\Http\Controllers\Stock;

use App\Http\Controllers\Controller;
use App\Models\Outlet;
use App\Models\Product;
use App\Models\Stock;
use App\Models\StockMovement;
use App\Services\StockService;
use App\Http\Requests\Stock\AdjustRequest;
use App\Http\Requests\Stock\RestockRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StockController extends Controller
{
    public function __construct(private StockService $stockService)
    {
    }

    /**
     * Display a listing of stocks across all outlets.
     * Owner/Manager access.
     */
    public function index(Request $request)
    {
        $query = Stock::with(['outlet:id,name', 'product:id,name,sku'])
            ->whereHas('outlet');

        if ($request->filled('search')) {
            $productIds = Product::where('name', 'like', '%' . $request->search . '%')
                ->orWhere('sku', 'like', '%' . $request->search . '%')
                ->pluck('id');
            $query->whereIn('product_id', $productIds);
        }

        if ($request->filled('outlet_id')) {
            $query->where('outlet_id', $request->outlet_id);
        }

        $stocks = $query->paginate(20)->withQueryString();
        $outlets = Outlet::where('is_active', true)->get(['id', 'name']);

        return Inertia::render('Stocks/Index', [
            'stocks' => $stocks,
            'outlets' => $outlets,
            'filters' => $request->only(['search', 'outlet_id']),
        ]);
    }

    /**
     * Display stocks for a specific outlet.
     * Cashier can access their assigned outlet.
     */
    public function byOutlet(Outlet $outlet, Request $request)
    {
        // Check if the current user is a cashier and if they are assigned to this outlet
        $user = $request->user();
        if ($user->hasRole('cashier') && !$outlet->users()->where('user_id', $user->id)->exists()) {
            abort(403, 'You are not assigned to this outlet.');
        }

        $query = Stock::with('product:id,name,sku')->where('outlet_id', $outlet->id);

        if ($request->filled('search')) {
            $productIds = Product::where('name', 'like', '%' . $request->search . '%')
                ->orWhere('sku', 'like', '%' . $request->search . '%')
                ->pluck('id');
            $query->whereIn('product_id', $productIds);
        }

        $stocks = $query->paginate(20)->withQueryString();

        return Inertia::render('Stocks/OutletStocks', [
            'outlet' => $outlet,
            'stocks' => $stocks,
            'filters' => $request->only('search'),
        ]);
    }

    /**
     * Show the form for restocking.
     */
    public function showRestock(Request $request)
    {
        $outlets = Outlet::where('is_active', true)->get(['id', 'name']);
        $products = Product::where('is_active', true)->get(['id', 'name', 'sku']);

        return Inertia::render('Stocks/Restock', [
            'outlets' => $outlets,
            'products' => $products,
        ]);
    }

    /**
     * Process the restock.
     */
    public function restock(RestockRequest $request)
    {
        $validated = $request->validated();

        $this->stockService->increaseStock(
            $validated['outlet_id'],
            $validated['product_id'],
            $validated['quantity'],
            'Restock',
            null,
            $validated['note'],
            $request->user()->id
        );

        return redirect()->route('stocks.index')->with('success', 'Stock restocked successfully.');
    }

    /**
     * Show the form for adjusting stock.
     */
    public function showAdjust(Request $request)
    {
        $outlets = Outlet::where('is_active', true)->get(['id', 'name']);
        $products = Product::where('is_active', true)->get(['id', 'name', 'sku']);

        return Inertia::render('Stocks/Adjust', [
            'outlets' => $outlets,
            'products' => $products,
        ]);
    }

    /**
     * Process the adjustment.
     */
    public function adjust(AdjustRequest $request)
    {
        $validated = $request->validated();

        $this->stockService->adjustStock(
            $validated['outlet_id'],
            $validated['product_id'],
            $validated['new_quantity'],
            $validated['note'],
            $request->user()->id
        );

        return redirect()->route('stocks.index')->with('success', 'Stock adjusted successfully.');
    }

    /**
     * Display stock movements history.
     */
    public function movements(Request $request)
    {
        $query = StockMovement::with(['stock.outlet:id,name', 'stock.product:id,name,sku', 'user:id,name'])
            ->whereHas('stock.outlet');

        // Filters
        if ($request->filled('outlet_id')) {
            $query->whereHas('stock', function($q) use ($request) {
                $q->where('outlet_id', $request->outlet_id);
            });
        }

        if ($request->filled('product_id')) {
            $query->whereHas('stock', function($q) use ($request) {
                $q->where('product_id', $request->product_id);
            });
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $movements = $query->latest()->paginate(20)->withQueryString();
        $outlets = Outlet::where('is_active', true)->get(['id', 'name']);
        $products = Product::where('is_active', true)->get(['id', 'name']);

        return Inertia::render('Stocks/Movements', [
            'movements' => $movements,
            'outlets' => $outlets,
            'products' => $products,
            'filters' => $request->only(['outlet_id', 'product_id', 'date_from', 'date_to']),
        ]);
    }

    /**
     * Display low stock alerts.
     */
    public function lowAlert()
    {
        $stocks = Stock::with(['outlet:id,name', 'product:id,name,sku'])
            ->whereHas('outlet')
            ->whereRaw('quantity <= low_stock_threshold')
            ->paginate(20);

        return Inertia::render('Stocks/LowAlert', [
            'stocks' => $stocks,
        ]);
    }
}
