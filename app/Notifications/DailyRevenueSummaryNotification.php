<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class DailyRevenueSummaryNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly float $totalRevenue,
        private readonly int   $totalTransactions,
        private readonly float $totalExpense,
        private readonly string $date,
        private readonly int $businessId,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'              => 'daily_revenue_summary',
            'title'             => 'Ringkasan Omzet Harian',
            'message'           => 'Omzet ' . $this->date . ': Rp ' . number_format($this->totalRevenue, 0, ',', '.') . ' dari ' . $this->totalTransactions . ' transaksi.',
            'total_revenue'     => $this->totalRevenue,
            'total_transactions'=> $this->totalTransactions,
            'total_expense'     => $this->totalExpense,
            'date'              => $this->date,
            'business_id'       => $this->businessId,
            'url'               => '/finance/daily',
        ];
    }
}
