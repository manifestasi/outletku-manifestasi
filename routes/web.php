<?php

use App\Http\Controllers\Business\BusinessController;
use App\Http\Controllers\Dashboard\DashboardController;
use App\Http\Controllers\Outlet\OutletController;
use App\Http\Controllers\User\UserController;
use Illuminate\Support\Facades\Route;

// Public welcome page
Route::inertia('/', 'welcome')->name('home');

// Authenticated routes
Route::middleware(['auth', 'verified', 'set.business'])->group(function () {

    // Dashboard
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Outlet management (owner + manager)
    Route::middleware('role:owner|manager')->group(function () {
        Route::resource('outlets', OutletController::class);
        Route::post('outlets/{outlet}/assign-users', [OutletController::class, 'assignUsers'])
            ->name('outlets.assign-users');

        // Products & Categories
        Route::resource('categories', \App\Http\Controllers\Product\CategoryController::class)->only(['store', 'update', 'destroy']);
        Route::resource('products', \App\Http\Controllers\Product\ProductController::class);

        // Stocks management
        Route::get('stocks', [\App\Http\Controllers\Stock\StockController::class, 'index'])->name('stocks.index');
        Route::get('stocks/restock', [\App\Http\Controllers\Stock\StockController::class, 'showRestock'])->name('stocks.restock');
        Route::post('stocks/restock', [\App\Http\Controllers\Stock\StockController::class, 'restock'])->name('stocks.restock.store');
        Route::get('stocks/adjust', [\App\Http\Controllers\Stock\StockController::class, 'showAdjust'])->name('stocks.adjust');
        Route::post('stocks/adjust', [\App\Http\Controllers\Stock\StockController::class, 'adjust'])->name('stocks.adjust.store');
        Route::get('stocks/movements', [\App\Http\Controllers\Stock\StockController::class, 'movements'])->name('stocks.movements');
        Route::get('stocks/low-alert', [\App\Http\Controllers\Stock\StockController::class, 'lowAlert'])->name('stocks.lowAlert');
    });

    // Stocks for specific outlet (accessible by cashier too, controller will verify assignment)
    Route::get('outlets/{outlet}/stocks', [\App\Http\Controllers\Stock\StockController::class, 'byOutlet'])->name('outlets.stocks');

    // User management (owner only)
    Route::middleware('role:owner')->group(function () {
        Route::resource('users', UserController::class);
    });

    // Business settings (owner only)
    Route::middleware('role:owner')->prefix('settings')->name('settings.')->group(function () {
        Route::get('business', [BusinessController::class, 'show'])->name('business');
        Route::put('business', [BusinessController::class, 'update'])->name('business.update');
    });
});

require __DIR__.'/settings.php';
