<?php

namespace Database\Seeders;

use App\Models\Business;
use App\Models\ExpenseCategory;
use Illuminate\Database\Seeder;

class ExpenseCategorySeeder extends Seeder
{
    public function run(): void
    {
        $defaultCategories = [
            'Gaji Karyawan',
            'Sewa Tempat',
            'Listrik & Air',
            'Transportasi',
            'Peralatan & Perlengkapan',
            'Bahan Baku Tambahan',
            'Marketing & Promosi',
            'Lain-lain',
        ];

        Business::all()->each(function (Business $business) use ($defaultCategories) {
            foreach ($defaultCategories as $name) {
                ExpenseCategory::firstOrCreate(
                    ['business_id' => $business->id, 'name' => $name]
                );
            }
        });
    }
}
