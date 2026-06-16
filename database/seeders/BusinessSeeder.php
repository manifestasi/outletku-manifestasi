<?php

namespace Database\Seeders;

use App\Models\Business;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BusinessSeeder extends Seeder
{
    /**
     * Seed 2 demo businesses.
     */
    public function run(): void
    {
        $businesses = [
            [
                'name' => 'Warung Barokah',
                'slug' => 'warung-barokah',
                'owner_name' => 'Budi Santoso',
                'phone' => '081234567890',
                'email' => 'owner@warungbarokah.test',
                'address' => 'Jl. Mawar No. 10, Jakarta Selatan',
                'is_active' => true,
            ],
            [
                'name' => 'Toko Maju Jaya',
                'slug' => 'toko-maju-jaya',
                'owner_name' => 'Siti Rahayu',
                'phone' => '089876543210',
                'email' => 'owner@tokomajujaya.test',
                'address' => 'Jl. Melati No. 5, Bandung',
                'is_active' => true,
            ],
        ];

        foreach ($businesses as $data) {
            Business::firstOrCreate(
                ['slug' => $data['slug']],
                $data
            );
        }
    }
}
