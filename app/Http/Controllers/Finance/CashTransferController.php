<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\CashTransfer;
use App\Models\Outlet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CashTransferController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        $query = CashTransfer::with(['fromOutlet:id,name', 'toOutlet:id,name', 'createdBy:id,name'])
            ->where('business_id', $user->business_id);

        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        if ($request->filled('start_date')) {
            $query->whereDate('transfer_date', '>=', $request->start_date);
        }

        if ($request->filled('end_date')) {
            $query->whereDate('transfer_date', '<=', $request->end_date);
        }

        $transfers = $query->latest('transfer_date')->paginate(20)->withQueryString();
        $outlets   = Outlet::where('business_id', $user->business_id)->orderBy('name')->get(['id', 'name']);

        return Inertia::render('Finance/CashTransfers/Index', [
            'transfers' => $transfers,
            'outlets'   => $outlets,
            'filters'   => $request->only(['type', 'start_date', 'end_date']),
        ]);
    }

    public function create()
    {
        $user = Auth::user();

        return Inertia::render('Finance/CashTransfers/Create', [
            'outlets' => Outlet::where('business_id', $user->business_id)->orderBy('name')->get(['id', 'name']),
            'today'   => now()->toDateString(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type'           => ['required', 'in:outlet_to_outlet,outlet_to_owner,owner_to_outlet'],
            'from_outlet_id' => ['nullable', 'exists:outlets,id'],
            'to_outlet_id'   => ['nullable', 'exists:outlets,id'],
            'amount'         => ['required', 'numeric', 'min:1'],
            'transfer_date'  => ['required', 'date'],
            'description'    => ['nullable', 'string', 'max:500'],
        ]);

        $user = Auth::user();

        CashTransfer::create(array_merge($validated, [
            'business_id' => $user->business_id,
            'created_by'  => $user->id,
        ]));

        return redirect()->route('cash-transfers.index')->with('success', 'Transfer kas berhasil dicatat.');
    }

    public function destroy(CashTransfer $cashTransfer)
    {
        abort_if($cashTransfer->business_id !== Auth::user()->business_id, 404);
        $cashTransfer->delete();

        return back()->with('success', 'Transfer kas berhasil dihapus.');
    }
}
