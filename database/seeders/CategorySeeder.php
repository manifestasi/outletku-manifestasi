<?php

namespace Database\Seeders;

use App\Models\Business;
use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Seed 5 categories per business demo.
     */
    public function run(): void
    {
        $categories = [
            'Makanan & Minuman',
            'Snack & Camilan',
            'Perlengkapan Rumah',
            'Elektronik',
            'Pakaian & Aksesoris',
        ];

        $businesses = Business::all();

        foreach ($businesses as $business) {
            foreach ($categories as $name) {
                Category::firstOrCreate([
                    'business_id' => $business->id,
                    'name'        => $name,
                ]);
            }
        }
    }
}
