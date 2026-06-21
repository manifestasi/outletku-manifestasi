<?php

use App\Http\Controllers\Business\BusinessController;
use App\Http\Controllers\Dashboard\DashboardController;
use App\Http\Controllers\Finance\CashTransferController;
use App\Http\Controllers\Finance\ExpenseController;
use App\Http\Controllers\Finance\FinanceController;
use App\Http\Controllers\Kasir\KasirAuthController;
use App\Http\Controllers\Kasir\ShiftController;
use App\Http\Controllers\Outlet\OutletController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\User\UserController;
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

        // Transactions (owner/manager)
        Route::get('transactions', [TransactionController::class, 'index'])->name('transactions.index');
        Route::get('transactions/create', [TransactionController::class, 'create'])->name('transactions.create');
        Route::delete('transactions/{transaction}', [TransactionController::class, 'destroy'])->name('transactions.destroy');

        // Shift management (owner/manager)
        Route::get('shifts', [ShiftController::class, 'index'])->name('shifts.index');
        Route::get('shifts/{shift}', [ShiftController::class, 'show'])->name('shifts.show');
        Route::post('shifts/{shift}/force-close', [ShiftController::class, 'forceClose'])->name('shifts.forceClose');

        // --- Sprint 4: Keuangan ---

        // Pengeluaran
        Route::resource('expenses', ExpenseController::class)->except(['show']);

        // Transfer Kas
        Route::get('cash-transfers', [CashTransferController::class, 'index'])->name('cash-transfers.index');
        Route::get('cash-transfers/create', [CashTransferController::class, 'create'])->name('cash-transfers.create');
        Route::post('cash-transfers', [CashTransferController::class, 'store'])->name('cash-transfers.store');
        Route::delete('cash-transfers/{cashTransfer}', [CashTransferController::class, 'destroy'])->name('cash-transfers.destroy');

        // Ringkasan Keuangan
        Route::prefix('finance')->name('finance.')->group(function () {
            Route::get('daily', [FinanceController::class, 'daily'])->name('daily');
            Route::get('profit-loss', [FinanceController::class, 'profitLoss'])->name('profitLoss');
        });
    });

    // Transaction show + store (cashier needs show for receipt print)
    Route::get('transactions/{transaction}', [TransactionController::class, 'show'])->name('transactions.show');
    Route::post('transactions', [TransactionController::class, 'store'])->name('transactions.store');

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

    // Kasir flow (cashier only)
    Route::middleware('role:cashier')->group(function () {
        Route::post('/kasir/logout', [KasirAuthController::class, 'logout'])->name('kasir.logout');

        Route::prefix('shift')->name('shift.')->group(function () {
            Route::get('open', [ShiftController::class, 'showOpen'])->name('showOpen');
            Route::post('open', [ShiftController::class, 'open'])->name('open');
        });

        Route::middleware(KasirShiftMiddleware::class)->group(function () {
            Route::get('/pos', [TransactionController::class, 'create'])->name('pos.index');

            Route::prefix('shift')->name('shift.')->group(function () {
                Route::get('close', [ShiftController::class, 'showClose'])->name('showClose');
                Route::post('close', [ShiftController::class, 'close'])->name('close');
            });
        });
    });
});

// Kasir Auth Routes (Public)
Route::prefix('kasir')->name('kasir.')->group(function () {
    Route::get('{business:slug}', [KasirAuthController::class, 'selectOutlet'])->name('outlets');
    Route::get('{business:slug}/{outlet}', [KasirAuthController::class, 'selectUser'])->name('users');
    Route::get('{business:slug}/{outlet}/{user}/pin', [KasirAuthController::class, 'showPin'])->name('pin');
    Route::post('{business:slug}/{outlet}/{user}/pin', [KasirAuthController::class, 'verifyPin'])->name('verify');
});

require __DIR__.'/settings.php';
