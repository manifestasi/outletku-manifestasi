<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Models\Business;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    /**
     * Validate and create a newly registered user.
     * Also auto-creates a Business and assigns the user the 'owner' role.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            'name' => ['required', 'string', 'max:100'],
            'business_name' => ['required', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:20'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => $this->passwordRules(),
        ])->validate();

        return DB::transaction(function () use ($input) {
            // Generate unique slug from business name
            $slug = $this->generateUniqueSlug($input['business_name']);

            // Create business first
            $business = Business::create([
                'name' => $input['business_name'],
                'slug' => $slug,
                'owner_name' => $input['name'],
                'email' => $input['email'],
                'phone' => $input['phone'] ?? null,
                'is_active' => true,
            ]);

            // Create user with business_id
            $user = User::create([
                'business_id' => $business->id,
                'name' => $input['name'],
                'email' => $input['email'],
                'phone' => $input['phone'] ?? null,
                'password' => $input['password'],
                'is_active' => true,
            ]);

            // Assign 'owner' role
            $user->assignRole('owner');

            return $user;
        });
    }

    /**
     * Generate a unique slug from the given business name.
     */
    private function generateUniqueSlug(string $name): string
    {
        $slug = Str::slug($name);
        $originalSlug = $slug;
        $count = 1;

        while (Business::where('slug', $slug)->exists()) {
            $slug = $originalSlug.'-'.$count;
            $count++;
        }

        return $slug;
    }
}
