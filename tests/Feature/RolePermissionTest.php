<?php

use App\Models\Business;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    $this->business = Business::factory()->create();
    
    // Create roles
    Role::firstOrCreate(['name' => 'owner']);
    Role::firstOrCreate(['name' => 'manager']);
    Role::firstOrCreate(['name' => 'cashier']);

    $this->owner = User::factory()->create(['business_id' => $this->business->id]);
    $this->owner->assignRole('owner');

    $this->manager = User::factory()->create(['business_id' => $this->business->id]);
    $this->manager->assignRole('manager');

    $this->cashier = User::factory()->create(['business_id' => $this->business->id]);
    $this->cashier->assignRole('cashier');
});

test('cashier cannot access business settings', function () {
    $this->actingAs($this->cashier);

    $response = $this->get('/settings/business');
    $response->assertStatus(403);
});

test('manager cannot access business settings', function () {
    $this->actingAs($this->manager);

    $response = $this->get('/settings/business');
    $response->assertStatus(403);
});

test('owner can access business settings', function () {
    $this->actingAs($this->owner);

    $response = $this->get('/settings/business');
    $response->assertStatus(200);
});

test('cashier cannot access users list', function () {
    $this->actingAs($this->cashier);

    $response = $this->get('/users');
    $response->assertStatus(403);
});

test('owner can access users list', function () {
    $this->actingAs($this->owner);

    $response = $this->get('/users');
    $response->assertStatus(200);
});
