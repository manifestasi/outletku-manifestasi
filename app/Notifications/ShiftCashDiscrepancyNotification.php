<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class ShiftCashDiscrepancyNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly string $shiftId,
        private readonly string $cashierName,
        private readonly string $outletName,
        private readonly float  $expectedCash,
        private readonly float  $actualCash,
        private readonly float  $discrepancy,
        private readonly int    $businessId,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $sign = $this->discrepancy >= 0 ? '+' : '';

        return [
            'type'         => 'shift_cash_discrepancy',
            'title'        => 'Selisih Kas Shift',
            'message'      => "{$this->cashierName} menutup shift di {$this->outletName}. Selisih kas: {$sign}" . number_format($this->discrepancy, 0, ',', '.') . ' Rp.',
            'shift_id'     => $this->shiftId,
            'cashier_name' => $this->cashierName,
            'outlet_name'  => $this->outletName,
            'expected_cash'=> $this->expectedCash,
            'actual_cash'  => $this->actualCash,
            'discrepancy'  => $this->discrepancy,
            'business_id'  => $this->businessId,
            'url'          => '/shifts/' . $this->shiftId,
        ];
    }
}
