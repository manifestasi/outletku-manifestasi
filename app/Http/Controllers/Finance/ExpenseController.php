<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\Outlet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        $query = Expense::with(['outlet:id,name', 'category:id,name', 'createdBy:id,name'])
            ->where('business_id', $user->business_id);

        if ($request->filled('outlet_id') && $request->outlet_id !== 'all') {
            $query->where('outlet_id', $request->outlet_id);
        }

        if ($request->filled('category_id') && $request->category_id !== 'all') {
            $query->where('expense_category_id', $request->category_id);
        }

        if ($request->filled('start_date')) {
            $query->whereDate('expense_date', '>=', $request->start_date);
        }

        if ($request->filled('end_date')) {
            $query->whereDate('expense_date', '<=', $request->end_date);
        }

        $expenses    = $query->latest('expense_date')->paginate(20)->withQueryString();
        $outlets     = Outlet::where('business_id', $user->business_id)->orderBy('name')->get(['id', 'name']);
        $categories  = ExpenseCategory::where('business_id', $user->business_id)->orderBy('name')->get(['id', 'name']);
        $totalAmount = $query->sum('amount');

        return Inertia::render('Finance/Expenses/Index', [
            'expenses'    => $expenses,
            'outlets'     => $outlets,
            'categories'  => $categories,
            'totalAmount' => (float) $totalAmount,
            'filters'     => $request->only(['outlet_id', 'category_id', 'start_date', 'end_date']),
        ]);
    }

    public function create()
    {
        $user = Auth::user();

        return Inertia::render('Finance/Expenses/Create', [
            'outlets'    => Outlet::where('business_id', $user->business_id)->orderBy('name')->get(['id', 'name']),
            'categories' => ExpenseCategory::where('business_id', $user->business_id)->orderBy('name')->get(['id', 'name']),
            'today'      => now()->toDateString(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'outlet_id'           => ['nullable', 'exists:outlets,id'],
            'expense_category_id' => ['nullable', 'exists:expense_categories,id'],
            'amount'              => ['required', 'numeric', 'min:1'],
            'expense_date'        => ['required', 'date'],
            'description'         => ['nullable', 'string', 'max:500'],
        ]);

        $user = Auth::user();

        Expense::create(array_merge($validated, [
            'business_id' => $user->business_id,
            'created_by'  => $user->id,
        ]));

        return redirect()->route('expenses.index')->with('success', 'Pengeluaran berhasil dicatat.');
    }

    public function edit(Expense $expense)
    {
        $this->authorizeExpense($expense);
        $user = Auth::user();

        return Inertia::render('Finance/Expenses/Edit', [
            'expense'    => $expense,
            'outlets'    => Outlet::where('business_id', $user->business_id)->orderBy('name')->get(['id', 'name']),
            'categories' => ExpenseCategory::where('business_id', $user->business_id)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Expense $expense)
    {
        $this->authorizeExpense($expense);

        $validated = $request->validate([
            'outlet_id'           => ['nullable', 'exists:outlets,id'],
            'expense_category_id' => ['nullable', 'exists:expense_categories,id'],
            'amount'              => ['required', 'numeric', 'min:1'],
            'expense_date'        => ['required', 'date'],
            'description'         => ['nullable', 'string', 'max:500'],
        ]);

        $expense->update($validated);

        return redirect()->route('expenses.index')->with('success', 'Pengeluaran berhasil diperbarui.');
    }

    public function destroy(Expense $expense)
    {
        $this->authorizeExpense($expense);
        $expense->delete();

        return back()->with('success', 'Pengeluaran berhasil dihapus.');
    }

    private function authorizeExpense(Expense $expense): void
    {
        abort_if($expense->business_id !== Auth::user()->business_id, 404);
    }
}
