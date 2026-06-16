<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RolePermissionSeeder extends Seeder
{
    /**
     * Seed roles for OutletKu.
     *
     * Roles:
     * - owner: full access to all features and all outlets; manage users (set/reset cashier PIN); void transactions
     * - manager: reports + operations (restock, adjust, void); cannot manage users/business settings
     * - cashier: POS + view assigned outlet stock (read-only); login via PIN; no restock/adjust/void/reports
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        Role::firstOrCreate(['name' => 'owner', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'manager', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'cashier', 'guard_name' => 'web']);
    }
}
