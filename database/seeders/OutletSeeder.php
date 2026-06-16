<?php

namespace Database\Seeders;

use App\Models\Business;
use App\Models\Outlet;
use App\Models\User;
use Illuminate\Database\Seeder;

class OutletSeeder extends Seeder
{
    /**
     * Seed 3 outlets per business demo.
     * Also assigns cashiers to outlets.
     */
    public function run(): void
    {
        $outletsByBusiness = [
            'warung-barokah' => [
                [
                    'name' => 'Warung Barokah - Pusat',
                    'address' => 'Jl. Mawar No. 10, Jakarta Selatan',
                    'phone' => '021-12345678',
                    'is_active' => true,
                ],
                [
                    'name' => 'Warung Barokah - Cabang Timur',
                    'address' => 'Jl. Kenanga No. 25, Jakarta Timur',
                    'phone' => '021-87654321',
                    'is_active' => true,
                ],
                [
                    'name' => 'Warung Barokah - Cabang Barat',
                    'address' => 'Jl. Melati No. 7, Jakarta Barat',
                    'phone' => '021-11223344',
                    'is_active' => true,
                ],
            ],
            'toko-maju-jaya' => [
                [
                    'name' => 'Toko Maju Jaya - Utama',
                    'address' => 'Jl. Melati No. 5, Bandung',
                    'phone' => '022-12345678',
                    'is_active' => true,
                ],
                [
                    'name' => 'Toko Maju Jaya - Dago',
                    'address' => 'Jl. Ir. H. Juanda No. 100, Bandung',
                    'phone' => '022-87654321',
                    'is_active' => true,
                ],
                [
                    'name' => 'Toko Maju Jaya - Cibiru',
                    'address' => 'Jl. Cibiru Raya No. 50, Bandung',
                    'phone' => '022-55667788',
                    'is_active' => true,
                ],
            ],
        ];

        foreach ($outletsByBusiness as $businessSlug => $outlets) {
            $business = Business::where('slug', $businessSlug)->first();

            if (! $business) {
                continue;
            }

            $cashiers = User::where('business_id', $business->id)
                ->whereHas('roles', fn ($q) => $q->where('name', 'cashier'))
                ->get();

            foreach ($outlets as $index => $outletData) {
                $outlet = Outlet::firstOrCreate(
                    [
                        'business_id' => $business->id,
                        'name' => $outletData['name'],
                    ],
                    array_merge($outletData, ['business_id' => $business->id])
                );

                // Assign cashiers to outlets (round-robin assignment)
                if ($cashiers->isNotEmpty()) {
                    $cashier = $cashiers[$index % $cashiers->count()];
                    $outlet->users()->syncWithoutDetaching([$cashier->id]);
                }
            }
        }
    }
}
