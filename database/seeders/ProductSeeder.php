<?php

namespace Database\Seeders;

use App\Models\Business;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Seed 10 products per business demo.
     */
    public function run(): void
    {
        $businesses = Business::all();

        $productsTemplate = [
            [
                'category_name' => 'Makanan & Minuman',
                'products'      => [
                    ['name' => 'Nasi Goreng Spesial', 'sku' => 'MKN-001', 'unit' => 'Porsi', 'selling_price' => 25000, 'cost_price' => 12000],
                    ['name' => 'Es Teh Manis', 'sku' => 'MKN-002', 'unit' => 'Gelas', 'selling_price' => 5000, 'cost_price' => 1500],
                    ['name' => 'Mie Ayam Komplit', 'sku' => 'MKN-003', 'unit' => 'Porsi', 'selling_price' => 20000, 'cost_price' => 9000],
                ],
            ],
            [
                'category_name' => 'Snack & Camilan',
                'products'      => [
                    ['name' => 'Keripik Singkong Pedas', 'sku' => 'SNK-001', 'unit' => 'Bungkus', 'selling_price' => 8000, 'cost_price' => 4500],
                    ['name' => 'Kacang Goreng 200g', 'sku' => 'SNK-002', 'unit' => 'Bungkus', 'selling_price' => 12000, 'cost_price' => 7000],
                    ['name' => 'Biskuit Coklat', 'sku' => 'SNK-003', 'unit' => 'Pack', 'selling_price' => 15000, 'cost_price' => 9000],
                ],
            ],
            [
                'category_name' => 'Perlengkapan Rumah',
                'products'      => [
                    ['name' => 'Sabun Cuci Piring 500ml', 'sku' => 'RMH-001', 'unit' => 'Botol', 'selling_price' => 12000, 'cost_price' => 8000],
                    ['name' => 'Tisu Gulung 12 Roll', 'sku' => 'RMH-002', 'unit' => 'Pack', 'selling_price' => 25000, 'cost_price' => 18000],
                ],
            ],
            [
                'category_name' => 'Elektronik',
                'products'      => [
                    ['name' => 'Baterai AA 4 Pack', 'sku' => 'ELK-001', 'unit' => 'Pack', 'selling_price' => 20000, 'cost_price' => 13000],
                ],
            ],
            [
                'category_name' => 'Pakaian & Aksesoris',
                'products'      => [
                    ['name' => 'Kaos Polos Putih M', 'sku' => 'PKN-001', 'unit' => 'Pcs', 'selling_price' => 45000, 'cost_price' => 28000],
                ],
            ],
        ];

        foreach ($businesses as $business) {
            foreach ($productsTemplate as $group) {
                $category = Category::where('business_id', $business->id)
                    ->where('name', $group['category_name'])
                    ->first();

                if (! $category) {
                    continue;
                }

                foreach ($group['products'] as $productData) {
                    Product::firstOrCreate(
                        [
                            'business_id' => $business->id,
                            'sku'         => $productData['sku'],
                        ],
                        [
                            'business_id'   => $business->id,
                            'category_id'   => $category->id,
                            'name'          => $productData['name'],
                            'sku'           => $productData['sku'],
                            'unit'          => $productData['unit'],
                            'selling_price' => $productData['selling_price'],
                            'cost_price'    => $productData['cost_price'],
                            'is_active'     => true,
                        ]
                    );
                }
            }
        }
    }
}
