<?php

namespace Database\Seeders;

use App\Models\Business;
use App\Models\Outlet;
use App\Models\Product;
use App\Models\Shift;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\User;
use App\Services\StockService;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ShiftSeeder extends Seeder
{
    public function run(): void
    {
        $business = Business::first();
        if (!$business) return;

        $outlets = Outlet::where('business_id', $business->id)->get();
        if ($outlets->isEmpty()) return;

        // Find cashier user
        $cashier = User::where('business_id', $business->id)->whereHas('roles', function ($q) {
            $q->where('name', 'kasir');
        })->first();

        // If no cashier found, use owner
        if (!$cashier) {
            $cashier = User::where('business_id', $business->id)->first();
        }

        $products = Product::where('business_id', $business->id)->where('is_active', true)->get();
        if ($products->isEmpty()) return;

        $stockService = app(StockService::class);

        // Generate shifts and transactions for the past 7 days
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            
            foreach ($outlets as $outlet) {
                // Open shift
                $startingCash = rand(1, 5) * 100000;
                $shift = Shift::create([
                    'business_id' => $business->id,
                    'outlet_id' => $outlet->id,
                    'user_id' => $cashier->id,
                    'started_at' => $date->copy()->setHour(8)->setMinute(0),
                    'starting_cash' => $startingCash,
                ]);

                // Create 5-15 transactions per shift
                $numTransactions = rand(5, 15);
                $cashSales = 0;

                for ($j = 0; $j < $numTransactions; $j++) {
                    // Pick 1-4 random products
                    $numItems = rand(1, 4);
                    $selectedProducts = $products->random($numItems);
                    
                    $subtotal = 0;
                    $items = [];

                    foreach ($selectedProducts as $product) {
                        $qty = rand(1, 3);
                        $itemTotal = $product->selling_price * $qty;
                        $subtotal += $itemTotal;

                        $items[] = [
                            'product' => $product,
                            'qty' => $qty,
                            'total' => $itemTotal,
                        ];
                    }

                    // 10% chance of discount
                    $discount = rand(1, 10) === 1 ? rand(1, 5) * 5000 : 0;
                    $total = max(0, $subtotal - $discount);

                    // 70% chance cash, 30% transfer
                    $paymentMethod = rand(1, 10) <= 7 ? 'cash' : 'transfer';
                    
                    if ($paymentMethod === 'cash') {
                        $cashSales += $total;
                        // Payment amount is nearest 50000 ceiling
                        $paymentAmount = ceil($total / 50000) * 50000;
                        if ($paymentAmount < $total) $paymentAmount = $total;
                    } else {
                        $paymentAmount = $total;
                    }

                    $transactionTime = $date->copy()->setHour(rand(8, 20))->setMinute(rand(0, 59));

                    $transaction = Transaction::create([
                        'business_id' => $business->id,
                        'outlet_id' => $outlet->id,
                        'user_id' => $cashier->id,
                        'shift_id' => $shift->id,
                        'invoice_number' => 'INV-' . $transactionTime->format('Ymd') . '-' . strtoupper(Str::random(5)),
                        'transaction_date' => $transactionTime,
                        'subtotal' => $subtotal,
                        'discount' => $discount,
                        'tax' => 0,
                        'total' => $total,
                        'payment_method' => $paymentMethod,
                        'payment_amount' => $paymentAmount,
                        'change_amount' => $paymentAmount - $total,
                    ]);

                    foreach ($items as $item) {
                        TransactionItem::create([
                            'transaction_id' => $transaction->id,
                            'product_id' => $item['product']->id,
                            'product_name' => $item['product']->name,
                            'product_sku' => $item['product']->sku,
                            'quantity' => $item['qty'],
                            'unit_price' => $item['product']->selling_price,
                            'subtotal' => $item['total'],
                            'discount' => 0,
                            'total' => $item['total'],
                        ]);

                        // Ensure we don't reduce actual stock in seeder so products don't hit 0 immediately
                        // For a realistic seeder, we *should* adjust stock.
                        // However, to keep products available for testing, we'll only adjust softly or not at all.
                        // Let's actually adjust stock, but StockSeeder already gave 100 per product.
                        $stockService->decreaseStock(
                            $outlet->id,
                            $item['product']->id,
                            $item['qty'],
                            'sale',
                            $transaction->id,
                            'Terjual di POS (Seeder)',
                            $cashier->id
                        );
                    }
                }

                $expectedCash = $startingCash + $cashSales;

                $shift->update([
                    'ended_at' => $date->copy()->setHour(21)->setMinute(0),
                    'ending_cash' => $expectedCash,
                    'expected_cash' => $expectedCash,
                ]);
            }
        }
    }
}
