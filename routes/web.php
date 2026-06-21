<?php

use App\Http\Controllers\Business\BusinessController;
use App\Http\Controllers\Dashboard\DashboardController;
use App\Http\Controllers\Outlet\OutletController;
use App\Http\Controllers\User\UserController;
use App\Http\Controllers\Kasir\KasirAuthController;
use App\Http\Controllers\Kasir\ShiftController;
use App\Http\Controllers\TransactionController;
use App\Http\Middleware\KasirShiftMiddleware;
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
        Route::resource('categories', \App\Http\Controllers\Product\CategoryController::class)->except(['create', 'show', 'edit']);
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

    // Kasir Logout
    Route::post('/kasir/logout', [KasirAuthController::class, 'logout'])->name('kasir.logout');

    // Shift Management
    Route::prefix('shift')->name('shift.')->group(function () {
        Route::get('open', [ShiftController::class, 'showOpen'])->name('showOpen');
        Route::post('open', [ShiftController::class, 'open'])->name('open');
        Route::get('close', [ShiftController::class, 'showClose'])->name('showClose');
        Route::post('close', [ShiftController::class, 'close'])->name('close');
    });

    // Owner/Manager shift routes
    Route::middleware('role:owner|manager')->group(function () {
        Route::resource('shifts', ShiftController::class)->only(['index', 'show']);
        Route::post('shifts/{shift}/force-close', [ShiftController::class, 'forceClose'])->name('shifts.forceClose');
    });

    // Transactions
    Route::resource('transactions', TransactionController::class)->except(['edit', 'update']);

    // POS Route (for kasir)
    Route::get('/pos', [TransactionController::class, 'create'])
        ->name('pos.index')
        ->middleware(KasirShiftMiddleware::class);
});

// Kasir Auth Routes (Public)
Route::prefix('kasir')->name('kasir.')->group(function () {
    Route::get('{business:slug}', [KasirAuthController::class, 'selectOutlet'])->name('outlets');
    Route::get('{business:slug}/{outlet}', [KasirAuthController::class, 'selectUser'])->name('users');
    Route::get('{business:slug}/{outlet}/{user}/pin', [KasirAuthController::class, 'showPin'])->name('pin');
    Route::post('{business:slug}/{outlet}/{user}/pin', [KasirAuthController::class, 'verifyPin'])->name('verify');
});

require __DIR__.'/settings.php';
