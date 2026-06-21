<?php

namespace Database\Seeders;

use App\Models\Business;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\Outlet;
use App\Models\User;
use Illuminate\Database\Seeder;

class ExpenseSeeder extends Seeder
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

            $outlets    = Outlet::where('business_id', $business->id)->get();
            $categories = ExpenseCategory::where('business_id', $business->id)->get();

            if ($outlets->isEmpty() || $categories->isEmpty()) {
                return;
            }

            $sampleExpenses = [
                ['amount' => 3_500_000, 'description' => 'Gaji kasir bulan ini'],
                ['amount' => 1_200_000, 'description' => 'Listrik outlet bulan ini'],
                ['amount' => 250_000,   'description' => 'Beli plastik kemasan'],
                ['amount' => 500_000,   'description' => 'Biaya ojek pengiriman stok'],
                ['amount' => 150_000,   'description' => 'Perlengkapan kebersihan'],
                ['amount' => 800_000,   'description' => 'Servis mesin kasir'],
            ];

            foreach ($sampleExpenses as $i => $data) {
                Expense::firstOrCreate(
                    [
                        'business_id'         => $business->id,
                        'description'         => $data['description'],
                    ],
                    [
                        'outlet_id'           => $outlets->random()->id,
                        'expense_category_id' => $categories->random()->id,
                        'amount'              => $data['amount'],
                        'expense_date'        => now()->subDays($i * 3)->toDateString(),
                        'created_by'          => $owner->id,
                    ]
                );
            }
        });
    }
}
