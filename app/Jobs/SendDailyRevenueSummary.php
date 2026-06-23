<?php

namespace App\Jobs;

use App\Models\Business;
use App\Models\Expense;
use App\Models\Transaction;
use App\Models\User;
use App\Notifications\DailyRevenueSummaryNotification;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendDailyRevenueSummary implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public array $backoff = [1, 5, 10];

    public function handle(): void
    {
        $yesterday = Carbon::yesterday();

        Business::all()->each(function (Business $business) use ($yesterday) {
            $totalRevenue = (float) Transaction::where('business_id', $business->id)
                ->whereDate('transaction_date', $yesterday)
                ->where('is_void', false)
                ->sum('total');

            $totalTransactions = Transaction::where('business_id', $business->id)
                ->whereDate('transaction_date', $yesterday)
                ->where('is_void', false)
                ->count();

            $totalExpense = (float) Expense::where('business_id', $business->id)
                ->whereDate('expense_date', $yesterday)
                ->sum('amount');

            $notification = new DailyRevenueSummaryNotification(
                totalRevenue:      $totalRevenue,
                totalTransactions: $totalTransactions,
                totalExpense:      $totalExpense,
                date:              $yesterday->translatedFormat('d M Y'),
                businessId:        $business->id,
            );

            User::whereHas('roles', fn ($q) => $q->whereIn('name', ['owner', 'manager']))
                ->where('business_id', $business->id)
                ->get()
                ->each(fn (User $user) => $user->notify($notification));
        });
    }
}
