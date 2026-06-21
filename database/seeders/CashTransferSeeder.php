<?php

namespace Database\Seeders;

use App\Models\Business;
use App\Models\CashTransfer;
use App\Models\Outlet;
use App\Models\User;
use Illuminate\Database\Seeder;

class CashTransferSeeder extends Seeder
{
    public function run(): void
    {
        Business::all()->each(function (Business $business) {
            $owner = User::whereHas('roles', fn ($q) => $q->where('name', 'owner'))
                ->where('business_id', $business->id)
                ->first();

            if (! $owner) {
                return;
            }

            $outlets = Outlet::where('business_id', $business->id)->get();

            if ($outlets->isEmpty()) {
                return;
            }

            // Outlet → Owner (setoran)
            CashTransfer::firstOrCreate(
                ['business_id' => $business->id, 'description' => 'Setoran hasil penjualan minggu lalu'],
                [
                    'from_outlet_id' => $outlets->first()->id,
                    'to_outlet_id'   => null,
                    'type'           => 'outlet_to_owner',
                    'amount'         => 5_000_000,
                    'transfer_date'  => now()->subWeek()->toDateString(),
                    'created_by'     => $owner->id,
                ]
            );

            // Owner → Outlet (tambahan modal)
            CashTransfer::firstOrCreate(
                ['business_id' => $business->id, 'description' => 'Tambahan modal operasional outlet'],
                [
                    'from_outlet_id' => null,
                    'to_outlet_id'   => $outlets->first()->id,
                    'type'           => 'owner_to_outlet',
                    'amount'         => 2_000_000,
                    'transfer_date'  => now()->subDays(3)->toDateString(),
                    'created_by'     => $owner->id,
                ]
            );

            // Outlet → Outlet (jika ada lebih dari 1 outlet)
            if ($outlets->count() >= 2) {
                CashTransfer::firstOrCreate(
                    ['business_id' => $business->id, 'description' => 'Transfer kas antar outlet untuk keseimbangan kas'],
                    [
                        'from_outlet_id' => $outlets->get(0)->id,
                        'to_outlet_id'   => $outlets->get(1)->id,
                        'type'           => 'outlet_to_outlet',
                        'amount'         => 1_500_000,
                        'transfer_date'  => now()->subDays(5)->toDateString(),
                        'created_by'     => $owner->id,
                    ]
                );
            }
        });
    }
}
