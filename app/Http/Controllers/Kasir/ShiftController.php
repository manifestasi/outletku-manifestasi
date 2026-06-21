<?php

namespace App\Http\Controllers\Kasir;

use App\Http\Controllers\Controller;
use App\Models\Shift;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ShiftController extends Controller
{
    /**
     * Show form to open a shift
     */
    public function showOpen()
    {
        $user = Auth::user();
        $activeOutletId = session('active_outlet_id');

        if (!$activeOutletId) {
            return redirect('/');
        }

        // Check if already has an open shift
        $activeShift = Shift::where('user_id', $user->id)
            ->where('outlet_id', $activeOutletId)
            ->whereNull('ended_at')
            ->first();

        if ($activeShift) {
            return redirect()->route('pos.index');
        }

        return Inertia::render('Shift/Open');
    }

    /**
     * Process opening a shift
     */
    public function open(Request $request)
    {
        $request->validate([
            'starting_cash' => ['required', 'numeric', 'min:0'],
        ]);

        $user = Auth::user();
        $activeOutletId = session('active_outlet_id');

        if (!$activeOutletId) {
            return redirect('/');
        }

        // Prevent duplicate open shifts
        $activeShift = Shift::where('user_id', $user->id)
            ->where('outlet_id', $activeOutletId)
            ->whereNull('ended_at')
            ->first();

        if ($activeShift) {
            return redirect()->route('pos.index');
        }

        Shift::create([
            'business_id' => $user->business_id,
            'outlet_id' => $activeOutletId,
            'user_id' => $user->id,
            'started_at' => now(),
            'starting_cash' => $request->starting_cash,
        ]);

        return redirect()->route('pos.index')->with('success', 'Shift berhasil dibuka.');
    }

    /**
     * Show form to close the shift
     */
    public function showClose(Request $request)
    {
        $user = Auth::user();
        $activeOutletId = session('active_outlet_id');

        if (!$activeOutletId) {
            return redirect('/');
        }

        $activeShift = Shift::where('user_id', $user->id)
            ->where('outlet_id', $activeOutletId)
            ->whereNull('ended_at')
            ->first();

        if (!$activeShift) {
            return redirect()->route('shift.showOpen');
        }

        // Calculate expected cash
        // expected cash = starting_cash + sum(cash transactions)
        $cashSales = Transaction::where('shift_id', $activeShift->id)
            ->where('payment_method', 'cash')
            ->where('is_void', false)
            ->sum('total');

        $expectedCash = $activeShift->starting_cash + $cashSales;

        return Inertia::render('Shift/Close', [
            'shift' => $activeShift,
            'cashSales' => $cashSales,
            'expectedCash' => $expectedCash,
        ]);
    }

    /**
     * Process closing a shift
     */
    public function close(Request $request)
    {
        $request->validate([
            'ending_cash' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $user = Auth::user();
        $activeOutletId = session('active_outlet_id');

        $activeShift = Shift::where('user_id', $user->id)
            ->where('outlet_id', $activeOutletId)
            ->whereNull('ended_at')
            ->first();

        if (!$activeShift) {
            return redirect()->route('shift.showOpen');
        }

        $cashSales = Transaction::where('shift_id', $activeShift->id)
            ->where('payment_method', 'cash')
            ->where('is_void', false)
            ->sum('total');

        $expectedCash = $activeShift->starting_cash + $cashSales;

        $activeShift->update([
            'ended_at' => now(),
            'ending_cash' => $request->ending_cash,
            'expected_cash' => $expectedCash,
            'notes' => $request->notes,
        ]);

        // After closing shift, logout or redirect to pin entry
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/')->with('success', 'Shift berhasil ditutup. Terima kasih.');
    }

    /**
     * List all shifts for owner/manager
     */
    public function index(Request $request)
    {
        $query = Shift::with(['outlet', 'user'])
            ->where('business_id', Auth::user()->business_id);

        if ($request->filled('status')) {
            if ($request->status === 'open') {
                $query->whereNull('ended_at');
            } elseif ($request->status === 'closed') {
                $query->whereNotNull('ended_at');
            }
        }

        $shifts = $query->latest('started_at')->paginate(15)->withQueryString();

        return Inertia::render('Shift/Index', [
            'shifts' => $shifts,
            'filters' => $request->only(['status']),
        ]);
    }

    /**
     * Show shift details
     */
    public function show(Shift $shift)
    {
        // Ensure shift belongs to business
        if ($shift->business_id !== Auth::user()->business_id) {
            abort(404);
        }

        $shift->load(['outlet', 'user', 'transactions' => function ($q) {
            $q->latest('transaction_date');
        }]);

        $validTransactions = $shift->transactions->where('is_void', false);

        $cashSales = $validTransactions
            ->where('payment_method', 'cash')
            ->sum('total');

        $totalSales = $validTransactions->sum('total');

        return Inertia::render('Shift/Show', [
            'shift' => $shift,
            'cashSales' => (float) $cashSales,
            'totalSales' => (float) $totalSales,
            'transactionCount' => $validTransactions->count(),
        ]);
    }

    /**
     * Force close a shift (Owner/Manager)
     */
    public function forceClose(Request $request, Shift $shift)
    {
        if ($shift->business_id !== Auth::user()->business_id) {
            abort(404);
        }

        if ($shift->ended_at) {
            return back()->with('error', 'Shift sudah ditutup.');
        }

        $cashSales = Transaction::where('shift_id', $shift->id)
            ->where('payment_method', 'cash')
            ->where('is_void', false)
            ->sum('total');

        $expectedCash = $shift->starting_cash + $cashSales;

        $shift->update([
            'ended_at' => now(),
            'ending_cash' => $expectedCash, // assume expected cash since forced
            'expected_cash' => $expectedCash,
            'notes' => 'Diakhiri secara paksa (Force Closed) oleh ' . Auth::user()->name . '. ' . $request->notes,
        ]);

        return back()->with('success', 'Shift berhasil di force close.');
    }
}
