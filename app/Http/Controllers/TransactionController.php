<?php

namespace App\Http\Controllers;

use App\Models\Outlet;
use App\Models\Product;
use App\Models\Shift;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Services\StockService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Str;

class TransactionController extends Controller
{
    /**
     * List transactions for owner/manager
     */
    public function index(Request $request)
    {
        $businessId = Auth::user()->business_id;
        $query = Transaction::with(['outlet', 'user'])
            ->where('business_id', $businessId);

        if ($request->filled('outlet_id') && $request->outlet_id !== 'all') {
            $query->where('outlet_id', $request->outlet_id);
        }

        if ($request->filled('date')) {
            $query->whereDate('transaction_date', $request->date);
        }

        $transactions = $query->latest('transaction_date')->paginate(15);
        $outlets = Outlet::where('business_id', $businessId)->get(['id', 'name']);

        return Inertia::render('Transactions/Index', [
            'transactions' => $transactions,
            'outlets' => $outlets,
            'filters' => $request->only(['outlet_id', 'date']),
        ]);
    }

    /**
     * POS interface (kasir via /pos, owner/manager via /transactions/create)
     */
    public function create(Request $request)
    {
        $user = Auth::user();
        $businessId = $user->business_id;
        $isCashierFlow = $request->routeIs('pos.index');

        if ($isCashierFlow) {
            $activeOutletId = $request->attributes->get('active_outlet_id');
            $activeShiftId = $request->attributes->get('active_shift_id');
            $outlets = null;
        } else {
            $outlets = Outlet::where('business_id', $businessId)
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name']);

            $activeOutletId = $request->query('outlet_id', $outlets->first()?->id);
            $activeShiftId = null;
        }

        if (! $activeOutletId) {
            return redirect('/dashboard')->with('error', 'Silakan buat outlet terlebih dahulu.');
        }

        $outlet = Outlet::where('business_id', $businessId)->findOrFail($activeOutletId);

        $products = Product::where('business_id', $businessId)
            ->where('is_active', true)
            ->with(['category', 'stocks' => function ($q) use ($activeOutletId) {
                $q->where('outlet_id', $activeOutletId);
            }])
            ->get()
            ->map(function ($product) {
                $stock = $product->stocks->first();
                $product->current_stock = $stock ? $stock->quantity : 0;

                return $product;
            });

        $invoicePreview = 'INV-'.date('Ymd').'-'.strtoupper(Str::random(5));

        return Inertia::render('Pos/Index', [
            'outlet' => [
                'id' => $outlet->id,
                'name' => $outlet->name,
            ],
            'outlets' => $outlets,
            'mode' => $isCashierFlow ? 'cashier' : 'admin',
            'shift_id' => $activeShiftId,
            'products' => $products,
            'invoicePreview' => $invoicePreview,
        ]);
    }

    /**
     * Process transaction
     */
    public function store(Request $request, StockService $stockService)
    {
        $request->validate([
            'outlet_id' => 'required|exists:outlets,id',
            'shift_id' => 'nullable|exists:shifts,id',
            'subtotal' => 'required|numeric|min:0',
            'discount' => 'required|numeric|min:0',
            'tax' => 'required|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'payment_method' => 'required|string|in:cash,transfer,other',
            'payment_amount' => 'required|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.subtotal' => 'required|numeric|min:0',
            'items.*.discount' => 'required|numeric|min:0',
            'items.*.total' => 'required|numeric|min:0',
        ]);

        $user = Auth::user();

        $outlet = Outlet::where('business_id', $user->business_id)->findOrFail($request->outlet_id);

        if ($user->hasRole('cashier')) {
            if (! $request->shift_id) {
                return redirect()->back()->with('error', 'Shift aktif diperlukan untuk transaksi kasir.');
            }

            $shift = Shift::where('id', $request->shift_id)
                ->where('business_id', $user->business_id)
                ->where('user_id', $user->id)
                ->where('outlet_id', $outlet->id)
                ->whereNull('ended_at')
                ->first();

            if (! $shift) {
                return redirect()->back()->with('error', 'Shift tidak valid atau sudah ditutup.');
            }
        } elseif ($user->hasAnyRole(['owner', 'manager'])) {
            $request->merge(['shift_id' => null]);
        } else {
            abort(403);
        }

        try {
            DB::beginTransaction();

            $invoiceNumber = 'INV-'.date('Ymd').'-'.strtoupper(Str::random(5));

            $transaction = Transaction::create([
                'business_id' => $user->business_id,
                'outlet_id' => $outlet->id,
                'user_id' => $user->id,
                'shift_id' => $request->shift_id,
                'invoice_number' => $invoiceNumber,
                'transaction_date' => now(),
                'subtotal' => $request->subtotal,
                'discount' => $request->discount,
                'tax' => $request->tax,
                'total' => $request->total,
                'payment_method' => $request->payment_method,
                'payment_amount' => $request->payment_amount,
                'change_amount' => max(0, $request->payment_amount - $request->total),
            ]);

            foreach ($request->items as $itemData) {
                $product = Product::where('business_id', $user->business_id)->findOrFail($itemData['product_id']);

                TransactionItem::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_sku' => $product->sku,
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $itemData['unit_price'],
                    'cost_price' => $product->cost_price,
                    'subtotal' => $itemData['subtotal'],
                    'discount' => $itemData['discount'],
                    'total' => $itemData['total'],
                ]);

                $stockService->decreaseStock(
                    $outlet->id,
                    $product->id,
                    $itemData['quantity'],
                    'sale',
                    $transaction->id,
                    'Terjual di POS: '.$invoiceNumber,
                    $user->id
                );
            }

            DB::commit();

            return redirect()->back()->with([
                'success' => 'Transaksi berhasil diproses.',
                'transaction_id' => $transaction->id,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()->with('error', 'Gagal memproses transaksi: '.$e->getMessage());
        }
    }

    /**
     * Show transaction details
     */
    public function show(Transaction $transaction)
    {
        $user = Auth::user();

        if ($transaction->business_id !== $user->business_id) {
            abort(404);
        }

        if ($user->hasRole('cashier') && $transaction->user_id !== $user->id) {
            abort(403);
        }

        $transaction->load(['outlet', 'user', 'items.product', 'voidedBy']);

        return Inertia::render('Transactions/Show', [
            'transaction' => $transaction,
            'canVoid' => $user->hasAnyRole(['owner', 'manager']),
        ]);
    }

    /**
     * Void a transaction (owner/manager only)
     */
    public function destroy(Transaction $transaction, StockService $stockService)
    {
        if (! Auth::user()->hasAnyRole(['owner', 'manager'])) {
            abort(403);
        }

        if ($transaction->business_id !== Auth::user()->business_id) {
            abort(404);
        }

        if ($transaction->is_void) {
            return back()->with('error', 'Transaksi ini sudah di-void.');
        }

        try {
            DB::beginTransaction();

            $transaction->update([
                'is_void' => true,
                'voided_at' => now(),
                'voided_by' => Auth::id(),
            ]);

            foreach ($transaction->items as $item) {
                if ($item->product_id) {
                    $stockService->increaseStock(
                        $transaction->outlet_id,
                        $item->product_id,
                        $item->quantity,
                        'return',
                        $transaction->id,
                        'Void transaksi: '.$transaction->invoice_number,
                        Auth::id()
                    );
                }
            }

            DB::commit();

            return back()->with('success', 'Transaksi berhasil di-void dan stok telah dikembalikan.');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->with('error', 'Gagal mem-void transaksi: '.$e->getMessage());
        }
    }
}
