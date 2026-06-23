<?php

use App\Jobs\CheckLowStock;
use App\Jobs\SendDailyRevenueSummary;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// ─────────────────────────────────────────────────────────────
// Scheduler Sprint 6
// ─────────────────────────────────────────────────────────────

// Cek stok menipis setiap hari pukul 08.00
Schedule::job(new CheckLowStock())
    ->dailyAt('08:00')
    ->withoutOverlapping()
    ->onOneServer()
    ->name('check-low-stock');

// Kirim ringkasan omzet harian setiap malam pukul 22.00
Schedule::job(new SendDailyRevenueSummary())
    ->dailyAt('22:00')
    ->withoutOverlapping()
    ->onOneServer()
    ->name('send-daily-revenue-summary');
