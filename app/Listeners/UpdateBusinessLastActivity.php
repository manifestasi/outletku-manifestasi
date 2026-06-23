<?php

namespace App\Listeners;

use App\Models\Business;
use Illuminate\Auth\Events\Login;

class UpdateBusinessLastActivity
{
    /**
     * Touch last_activity_at on the user's business when they log in.
     */
    public function handle(Login $event): void
    {
        $user = $event->user;

        if (isset($user->business_id) && $user->business_id) {
            Business::withoutTimestamps(
                fn () => Business::where('id', $user->business_id)
                    ->update(['last_activity_at' => now()])
            );
        }
    }
}
