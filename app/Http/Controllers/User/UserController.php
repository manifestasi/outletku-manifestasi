<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Models\Outlet;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     * Owner only.
     */
    public function index(Request $request): Response
    {
        $users = User::where('business_id', Auth::user()->business_id)
            ->with('roles')
            ->when($request->search, fn ($q) => $q->where('name', 'like', '%'.$request->search.'%'))
            ->when($request->role, fn ($q) => $q->whereHas('roles', fn ($r) => $r->where('name', $request->role)))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('users/index', [
            'users' => $users,
            'filters' => $request->only('search', 'role'),
        ]);
    }

    /**
     * Show the form for creating a new user.
     * Owner only.
     */
    public function create(): Response
    {
        $outlets = Outlet::where('business_id', Auth::user()->business_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('users/create', [
            'outlets' => $outlets,
        ]);
    }

    /**
     * Store a newly created user.
     * Owner only.
     */
    public function store(StoreUserRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $user = User::create([
            'business_id' => Auth::user()->business_id,
            'name' => $data['name'],
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? null,
            'password' => isset($data['password']) ? Hash::make($data['password']) : null,
            'pin' => isset($data['pin']) ? Hash::make($data['pin']) : null,
            'is_active' => true,
        ]);

        $user->assignRole($data['role']);

        // Assign to outlet if specified
        if (! empty($data['outlet_ids'])) {
            $user->outlets()->sync($data['outlet_ids']);
        }

        return redirect()->route('users.index')
            ->with('success', 'User berhasil ditambahkan.');
    }

    /**
     * Show the form for editing a user.
     * Owner only.
     */
    public function edit(User $user): Response
    {
        // Ensure user belongs to same business
        abort_if($user->business_id !== Auth::user()->business_id, 403);

        $outlets = Outlet::where('business_id', Auth::user()->business_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        $user->load('roles', 'outlets');

        return Inertia::render('users/edit', [
            'user' => $user,
            'outlets' => $outlets,
            'assignedOutletIds' => $user->outlets->pluck('id'),
        ]);
    }

    /**
     * Update the specified user.
     * Owner only.
     */
    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        // Ensure user belongs to same business
        abort_if($user->business_id !== Auth::user()->business_id, 403);

        $data = $request->validated();

        $updateData = [
            'name' => $data['name'],
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? null,
        ];

        if (isset($data['password'])) {
            $updateData['password'] = Hash::make($data['password']);
        }

        if (isset($data['pin'])) {
            $updateData['pin'] = Hash::make($data['pin']);
            $updateData['pin_failed_attempts'] = 0;
            $updateData['pin_locked_until'] = null;
        }

        $user->update($updateData);

        if (isset($data['role'])) {
            $user->syncRoles([$data['role']]);
        }

        if (isset($data['outlet_ids'])) {
            $user->outlets()->sync($data['outlet_ids']);
        }

        return redirect()->route('users.index')
            ->with('success', 'User berhasil diperbarui.');
    }

    /**
     * Deactivate the specified user (soft deactivate, not hard delete).
     * Owner only.
     */
    public function destroy(User $user): RedirectResponse
    {
        // Ensure user belongs to same business
        abort_if($user->business_id !== Auth::user()->business_id, 403);

        // Cannot deactivate yourself
        abort_if($user->id === Auth::id(), 403, 'Tidak dapat menonaktifkan akun sendiri.');

        $user->update(['is_active' => false]);

        return redirect()->route('users.index')
            ->with('success', 'User berhasil dinonaktifkan.');
    }
}
