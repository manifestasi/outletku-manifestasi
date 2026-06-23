<?php

namespace App\Observers;

use App\Models\Business;
use App\Models\Transaction;

class TransactionObserver
{
    /**
     * Touch last_activity_at when a valid transaction is saved.
     */
    public function saved(Transaction $transaction): void
    {
        if (! $transaction->is_void) {
            Business::withoutTimestamps(
                fn () => Business::where('id', $transaction->business_id)
                    ->update(['last_activity_at' => now()])
            );
        }
    }
}
