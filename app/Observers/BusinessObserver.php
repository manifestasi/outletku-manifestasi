<?php

namespace App\Observers;

use App\Models\Business;
use App\Models\Transaction;
use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\Auth;

class BusinessObserver
{
    /**
     * Touch last_activity_at whenever a valid transaction is created.
     */
    public function created(mixed $model): void
    {
        if ($model instanceof Transaction && ! $model->is_void) {
            $this->touchBusiness($model->business_id);
        }
    }

    /**
     * Touch last_activity_at whenever a transaction is updated to not-void.
     */
    public function updated(mixed $model): void
    {
        if ($model instanceof Transaction && ! $model->is_void) {
            $this->touchBusiness($model->business_id);
        }
    }

    private function touchBusiness(int|string $businessId): void
    {
        Business::withoutTimestamps(fn () =>
            Business::where('id', $businessId)->update(['last_activity_at' => now()])
        );
    }
}
