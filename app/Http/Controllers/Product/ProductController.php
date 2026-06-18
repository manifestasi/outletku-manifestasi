<?php

namespace App\Http\Controllers\Product;

use App\Http\Controllers\Controller;
use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * Display a listing of products.
     */
    public function index(Request $request): Response
    {
        $query = Product::with('category')->latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $products   = $query->paginate(10)->withQueryString();
        $categories = Category::orderBy('name')->get();

        return Inertia::render('products/index', [
            'products'   => $products,
            'categories' => $categories,
            'filters'    => $request->only(['search', 'category_id']),
        ]);
    }

    /**
     * Show the form for creating a new product.
     */
    public function create(): Response
    {
        $categories = Category::orderBy('name')->get();

        return Inertia::render('products/create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created product in storage.
     */
    public function store(StoreProductRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('products', 'public');
        }

        Product::create([
            'business_id'   => Auth::user()->business_id,
            'category_id'   => $validated['category_id'] ?? null,
            'name'          => $validated['name'],
            'sku'           => $validated['sku'] ?? null,
            'unit'          => $validated['unit'],
            'selling_price' => $validated['selling_price'],
            'cost_price'    => $validated['cost_price'],
            'image'         => $imagePath,
            'is_active'     => $validated['is_active'] ?? true,
        ]);

        return redirect()->route('products.index')->with('success', 'Produk berhasil ditambahkan.');
    }

    /**
     * Show the form for editing the specified product.
     */
    public function edit(Product $product): Response
    {
        $categories = Category::orderBy('name')->get();

        return Inertia::render('products/edit', [
            'product'    => $product,
            'categories' => $categories,
        ]);
    }

    /**
     * Update the specified product in storage.
     */
    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        $validated = $request->validated();

        $imagePath = $product->image;
        if ($request->hasFile('image')) {
            if ($imagePath && Storage::disk('public')->exists($imagePath)) {
                Storage::disk('public')->delete($imagePath);
            }
            $imagePath = $request->file('image')->store('products', 'public');
        }

        $product->update([
            'category_id'   => $validated['category_id'] ?? null,
            'name'          => $validated['name'],
            'sku'           => $validated['sku'] ?? null,
            'unit'          => $validated['unit'],
            'selling_price' => $validated['selling_price'],
            'cost_price'    => $validated['cost_price'],
            'image'         => $imagePath,
            'is_active'     => $validated['is_active'] ?? true,
        ]);

        return redirect()->route('products.index')->with('success', 'Produk berhasil diperbarui.');
    }

    /**
     * Deactivate the specified product (soft deactivate, not hard delete).
     */
    public function destroy(Product $product): RedirectResponse
    {
        $product->update(['is_active' => false]);

        return back()->with('success', 'Produk berhasil dinonaktifkan.');
    }
}
