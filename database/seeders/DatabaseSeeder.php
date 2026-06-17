<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
            BusinessSeeder::class,
            UserSeeder::class,
            OutletSeeder::class,
            CategorySeeder::class,
            ProductSeeder::class,
            StockSeeder::class,
        ]);
    }
}
