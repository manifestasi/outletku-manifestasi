<?php

namespace Database\Seeders;

use App\Models\SuperAdmin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        SuperAdmin::firstOrCreate(
            ['email' => 'superadmin@outletku.id'],
            [
                'name'     => 'Super Administrator',
                'password' => Hash::make('superadmin123'),
                'is_active'=> true,
            ]
        );
    }
}
