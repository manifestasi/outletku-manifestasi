<?php

use App\Models\Business;
use App\Models\Outlet;
use App\Models\Product;
use App\Models\Stock;
use App\Models\User;

beforeEach(function () {
    $this->business = Business::factory()->create();
    $this->owner = User::factory()->create(['business_id' => $this->business->id]);
    $this->owner->assignRole('owner');

    $this->outlet = Outlet::factory()->create(['business_id' => $this->business->id]);
    $this->product = Product::factory()->create(['business_id' => $this->business->id]);
    
    $this->stock = Stock::create([
        'business_id' => $this->business->id,
        'outlet_id' => $this->outlet->id,
        'product_id' => $this->product->id,
        'quantity' => 10,
        'low_stock_threshold' => 5,
    ]);
});

test('stock cannot be adjusted to negative', function () {
    $this->actingAs($this->owner);

    $response = $this->post("/stocks/adjust", [
        'outlet_id' => $this->outlet->id,
        'product_id' => $this->product->id,
        'type' => 'decrease',
        'quantity' => 15, // Currently 10
        'notes' => 'Test negative stock',
    ]);

    $response->assertSessionHasErrors(['quantity']);
    expect($this->stock->fresh()->quantity)->toBe(10);
});

test('transaction cannot be processed if stock is insufficient', function () {
    $this->actingAs($this->owner);

    $response = $this->post("/transactions", [
        'outlet_id' => $this->outlet->id,
        'payment_method' => 'cash',
        'total' => $this->product->selling_price * 15,
        'items' => [
            [
                'product_id' => $this->product->id,
                'quantity' => 15, // Currently 10
                'price' => $this->product->selling_price,
                'subtotal' => $this->product->selling_price * 15,
            ]
        ]
    ]);

    $response->assertSessionHasErrors();
    expect($this->stock->fresh()->quantity)->toBe(10);
});
