<?php

namespace Database\Seeders;

use App\Models\Business;
use App\Models\Outlet;
use App\Models\Product;
use App\Models\Stock;
use Illuminate\Database\Seeder;

class StockSeeder extends Seeder
{
    /**
     * Seed initial stock for all outlets × products per business.
     */
    public function run(): void
    {
        $businesses = Business::with('outlets')->get();

        foreach ($businesses as $business) {
            $outlets  = $business->outlets;
            $products = \App\Models\Product::withoutGlobalScopes()->where('business_id', $business->id)->get();

            foreach ($outlets as $outlet) {
                foreach ($products as $product) {
                    Stock::firstOrCreate(
                        [
                            'outlet_id'  => $outlet->id,
                            'product_id' => $product->id,
                        ],
                        [
                            'quantity'            => rand(20, 100),
                            'low_stock_threshold' => 10,
                        ]
                    );
                }
            }
        }
    }
}
