<?php

use App\Http\Controllers\SuperAdmin\AnalyticsController;
use App\Http\Controllers\SuperAdmin\AuthController;
use App\Http\Controllers\SuperAdmin\DashboardController;
use App\Http\Controllers\SuperAdmin\SystemController;
use App\Http\Controllers\SuperAdmin\TenantController;
use App\Http\Middleware\SuperAdminAuth;
use Illuminate\Support\Facades\Route;

Route::prefix('super-admin')->name('super-admin.')->group(function () {
    // Public: login/logout
    Route::get('login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('login', [AuthController::class, 'login'])->name('login.post');
    Route::post('logout', [AuthController::class, 'logout'])->name('logout')->middleware(SuperAdminAuth::class);

    // Protected: super admin panel
    Route::middleware(SuperAdminAuth::class)->group(function () {
        Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

        // Tenants
        Route::prefix('tenants')->name('tenants.')->group(function () {
            Route::get('/', [TenantController::class, 'index'])->name('index');
            Route::get('{business:slug}', [TenantController::class, 'show'])->name('show');
            Route::post('{business:slug}/toggle-active', [TenantController::class, 'toggleActive'])->name('toggleActive');
            Route::post('{business:slug}/reset-password', [TenantController::class, 'resetPassword'])->name('resetPassword');
            Route::delete('{business:slug}', [TenantController::class, 'destroy'])->name('destroy');
            Route::post('{business:slug}/impersonate', [TenantController::class, 'impersonate'])->name('impersonate');
        });

        // Stop impersonation (accessible outside SA middleware too)
        Route::post('stop-impersonate', [TenantController::class, 'stopImpersonate'])->name('stopImpersonate');

        // Analytics
        Route::prefix('analytics')->name('analytics.')->group(function () {
            Route::get('/', [AnalyticsController::class, 'index'])->name('index');
            Route::get('growth', [AnalyticsController::class, 'growth'])->name('growth');
            Route::get('activity', [AnalyticsController::class, 'activity'])->name('activity');
            Route::get('churn', [AnalyticsController::class, 'churn'])->name('churn');
        });

        // System
        Route::prefix('system')->name('system.')->group(function () {
            Route::get('/', [SystemController::class, 'index'])->name('index');
            Route::get('logs', [SystemController::class, 'logs'])->name('logs');
            Route::get('queues', [SystemController::class, 'queues'])->name('queues');
        });
    });
});
