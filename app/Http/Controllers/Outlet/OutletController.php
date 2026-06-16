<?php

namespace App\Http\Controllers\Outlet;

use App\Http\Controllers\Controller;
use App\Http\Requests\Outlet\StoreOutletRequest;
use App\Http\Requests\Outlet\UpdateOutletRequest;
use App\Models\Outlet;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OutletController extends Controller
{
    /**
     * Display a listing of outlets.
     */
    public function index(Request $request): Response
    {
        $outlets = Outlet::query()
            ->withCount('users')
            ->when($request->search, fn ($q) => $q->where('name', 'like', '%'.$request->search.'%'))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('outlets/index', [
            'outlets' => $outlets,
            'filters' => $request->only('search'),
        ]);
    }

    /**
     * Show the form for creating a new outlet.
     */
    public function create(): Response
    {
        return Inertia::render('outlets/create');
    }

    /**
     * Store a newly created outlet.
     */
    public function store(StoreOutletRequest $request): RedirectResponse
    {
        $outlet = Outlet::create([
            'business_id' => Auth::user()->business_id,
            ...$request->validated(),
        ]);

        return redirect()->route('outlets.index')
            ->with('success', 'Outlet berhasil ditambahkan.');
    }

    /**
     * Show a specific outlet.
     */
    public function show(Outlet $outlet): Response
    {
        $outlet->load(['users' => fn ($q) => $q->with('roles')]);

        return Inertia::render('outlets/show', [
            'outlet' => $outlet,
        ]);
    }

    /**
     * Show the form for editing an outlet.
     */
    public function edit(Outlet $outlet): Response
    {
        // Get users in this business who can be assigned to the outlet
        $availableUsers = User::where('business_id', Auth::user()->business_id)
            ->where('is_active', true)
            ->with('roles')
            ->orderBy('name')
            ->get();

        $assignedUserIds = $outlet->users()->pluck('users.id');

        return Inertia::render('outlets/edit', [
            'outlet' => $outlet,
            'availableUsers' => $availableUsers,
            'assignedUserIds' => $assignedUserIds,
        ]);
    }

    /**
     * Update the specified outlet.
     */
    public function update(UpdateOutletRequest $request, Outlet $outlet): RedirectResponse
    {
        $outlet->update($request->validated());

        return redirect()->route('outlets.index')
            ->with('success', 'Outlet berhasil diperbarui.');
    }

    /**
     * Deactivate the specified outlet (soft deactivate, not hard delete).
     */
    public function destroy(Outlet $outlet): RedirectResponse
    {
        $outlet->update(['is_active' => false]);

        return redirect()->route('outlets.index')
            ->with('success', 'Outlet berhasil dinonaktifkan.');
    }

    /**
     * Assign users to an outlet.
     */
    public function assignUsers(Request $request, Outlet $outlet): RedirectResponse
    {
        $request->validate([
            'user_ids' => ['required', 'array'],
            'user_ids.*' => [
                'integer',
                Rule::exists('users', 'id')->where('business_id', Auth::user()->business_id),
            ],
        ]);

        $outlet->users()->sync($request->user_ids);

        return back()->with('success', 'User berhasil di-assign ke outlet.');
    }
}
