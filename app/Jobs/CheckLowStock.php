<?php

namespace App\Jobs;

use App\Models\Business;
use App\Models\Stock;
use App\Models\User;
use App\Notifications\LowStockNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class CheckLowStock implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public array $backoff = [1, 5, 10];

    public function handle(): void
    {
        Business::all()->each(function (Business $business) {
            $alerts = Stock::with(['product:id,name,sku', 'outlet:id,name'])
                ->whereHas('outlet', fn ($q) => $q->where('business_id', $business->id))
                ->whereRaw('quantity <= low_stock_threshold')
                ->get()
                ->map(fn ($s) => [
                    'product_name'      => $s->product?->name ?? 'Produk dihapus',
                    'outlet_name'       => $s->outlet?->name ?? '-',
                    'quantity'          => $s->quantity,
                    'low_stock_threshold' => $s->low_stock_threshold,
                ])
                ->values()
                ->all();

            if (empty($alerts)) {
                return;
            }

            $notification = new LowStockNotification($alerts, $business->id);

            User::whereHas('roles', fn ($q) => $q->whereIn('name', ['owner', 'manager']))
                ->where('business_id', $business->id)
                ->get()
                ->each(fn (User $user) => $user->notify($notification));
        });
    }
}
