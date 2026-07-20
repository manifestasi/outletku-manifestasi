<?php

use App\Models\Business;
use App\Models\Outlet;
use App\Models\Product;
use App\Models\User;

beforeEach(function () {
    $this->businessA = Business::factory()->create();
    $this->ownerA = User::factory()->create(['business_id' => $this->businessA->id]);
    
    $this->businessB = Business::factory()->create();
    $this->ownerB = User::factory()->create(['business_id' => $this->businessB->id]);
});

test('tenant A cannot see tenant B outlets', function () {
    $outletB = Outlet::factory()->create(['business_id' => $this->businessB->id]);

    $this->actingAs($this->ownerA);
    
    $response = $this->get('/outlets');
    $response->assertOk();
    $response->assertDontSee($outletB->name);
});

test('tenant A cannot edit tenant B outlet', function () {
    $outletB = Outlet::factory()->create(['business_id' => $this->businessB->id]);

    $this->actingAs($this->ownerA);
    
    $response = $this->get("/outlets/{$outletB->id}/edit");
    $response->assertNotFound(); // Or 403, depending on Global Scope setup
});

test('tenant A cannot see tenant B products', function () {
    $productB = Product::factory()->create(['business_id' => $this->businessB->id]);

    $this->actingAs($this->ownerA);
    
    $response = $this->get('/products');
    $response->assertOk();
    $response->assertDontSee($productB->name);
});

test('tenant A cannot see tenant B users', function () {
    $this->actingAs($this->ownerA);
    
    $response = $this->get('/users');
    $response->assertOk();
    $response->assertDontSee($this->ownerB->name);
});
