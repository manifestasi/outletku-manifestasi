<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class LowStockNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * @param  array<int, array{product_name: string, outlet_name: string, quantity: int, low_stock_threshold: int}>  $alerts
     */
    public function __construct(
        private readonly array $alerts,
        private readonly int $businessId,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'        => 'low_stock',
            'title'       => 'Stok Menipis',
            'message'     => count($this->alerts) . ' produk memiliki stok di bawah batas minimum.',
            'alerts'      => $this->alerts,
            'business_id' => $this->businessId,
            'url'         => '/reports/stock',
        ];
    }
}
