<?php

namespace Database\Seeders;

use App\Models\Business;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Seed 4 users per business: 1 owner, 1 manager, 2 cashiers.
     * Cashiers only have PIN (no email/password).
     */
    public function run(): void
    {
        $businesses = Business::all();

        $usersData = [
            'warung-barokah' => [
                [
                    'name' => 'Budi Santoso',
                    'phone' => '081234567890',
                    'email' => 'owner@warungbarokah.test',
                    'password' => 'password',
                    'role' => 'owner',
                    'is_active' => true,
                ],
                [
                    'name' => 'Andi Wijaya',
                    'phone' => '081234567891',
                    'email' => 'manager@warungbarokah.test',
                    'password' => 'password',
                    'role' => 'manager',
                    'is_active' => true,
                ],
                [
                    'name' => 'Kasir Satu',
                    'phone' => null,
                    'email' => null,
                    'password' => null,
                    'pin' => '123456',
                    'role' => 'cashier',
                    'is_active' => true,
                ],
                [
                    'name' => 'Kasir Dua',
                    'phone' => null,
                    'email' => null,
                    'password' => null,
                    'pin' => '654321',
                    'role' => 'cashier',
                    'is_active' => true,
                ],
            ],
            'toko-maju-jaya' => [
                [
                    'name' => 'Siti Rahayu',
                    'phone' => '089876543210',
                    'email' => 'owner@tokomajujaya.test',
                    'password' => 'password',
                    'role' => 'owner',
                    'is_active' => true,
                ],
                [
                    'name' => 'Rizky Pratama',
                    'phone' => '089876543211',
                    'email' => 'manager@tokomajujaya.test',
                    'password' => 'password',
                    'role' => 'manager',
                    'is_active' => true,
                ],
                [
                    'name' => 'Kasir A',
                    'phone' => null,
                    'email' => null,
                    'password' => null,
                    'pin' => '111111',
                    'role' => 'cashier',
                    'is_active' => true,
                ],
                [
                    'name' => 'Kasir B',
                    'phone' => null,
                    'email' => null,
                    'password' => null,
                    'pin' => '222222',
                    'role' => 'cashier',
                    'is_active' => true,
                ],
            ],
        ];

        foreach ($businesses as $business) {
            $slug = $business->slug;

            if (! isset($usersData[$slug])) {
                continue;
            }

            foreach ($usersData[$slug] as $userData) {
                $user = User::firstOrCreate(
                    array_filter([
                        'business_id' => $business->id,
                        'email' => $userData['email'],
                    ], fn ($v) => $v !== null),
                    [
                        'business_id' => $business->id,
                        'name' => $userData['name'],
                        'phone' => $userData['phone'],
                        'email' => $userData['email'],
                        'password' => $userData['password'] ? Hash::make($userData['password']) : null,
                        'pin' => isset($userData['pin']) ? Hash::make($userData['pin']) : null,
                        'is_active' => $userData['is_active'],
                    ]
                );

                // Sync role
                $user->syncRoles([$userData['role']]);

                // Update owner_name on business if owner
                if ($userData['role'] === 'owner') {
                    $business->update(['owner_name' => $userData['name']]);
                }
            }
        }
    }
}
