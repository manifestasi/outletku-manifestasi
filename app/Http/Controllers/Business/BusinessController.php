<?php

namespace App\Http\Controllers\Business;

use App\Http\Controllers\Controller;
use App\Http\Requests\Business\UpdateBusinessRequest;
use App\Models\Business;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class BusinessController extends Controller
{
    /**
     * Show business settings form.
     * Owner only.
     */
    public function show(Request $request): Response
    {
        $business = Auth::user()->business;

        return Inertia::render('settings/business', [
            'business' => $business,
        ]);
    }

    /**
     * Update business information.
     * Owner only.
     */
    public function update(UpdateBusinessRequest $request): RedirectResponse
    {
        $business = Auth::user()->business;
        $data = $request->validated();

        // Handle logo upload
        if ($request->hasFile('logo')) {
            // Delete old logo
            if ($business->logo) {
                Storage::disk('public')->delete($business->logo);
            }
            $data['logo'] = $request->file('logo')->store('logos', 'public');
        }

        $business->update($data);

        return back()->with('success', 'Informasi bisnis berhasil diperbarui.');
    }
}
