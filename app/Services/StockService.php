<?php

namespace App\Services;

use App\Models\Stock;
use App\Models\StockMovement;
use Illuminate\Support\Facades\DB;

class StockService
{
    /**
     * Increase stock for a specific product at a specific outlet.
     */
    public function increaseStock(
        string $outletId,
        string $productId,
        int $quantity,
        ?string $referenceType = null,
        ?string $referenceId = null,
        ?string $note = null,
        ?string $userId = null
    ): Stock {
        if ($quantity <= 0) {
            throw new \InvalidArgumentException('Quantity must be greater than zero to increase stock.');
        }

        return DB::transaction(function () use ($outletId, $productId, $quantity, $referenceType, $referenceId, $note, $userId) {
            $stock = Stock::firstOrCreate(
                ['outlet_id' => $outletId, 'product_id' => $productId],
                ['quantity' => 0]
            );

            $quantityBefore = $stock->quantity;
            $quantityAfter = $quantityBefore + $quantity;

            $stock->update(['quantity' => $quantityAfter]);

            $this->recordMovement(
                $stock->id,
                'increase',
                $quantityBefore,
                $quantityAfter,
                $quantity,
                $referenceType,
                $referenceId,
                $note,
                $userId ?? auth()->id()
            );

            return $stock;
        });
    }

    /**
     * Decrease stock for a specific product at a specific outlet.
     */
    public function decreaseStock(
        string $outletId,
        string $productId,
        int $quantity,
        ?string $referenceType = null,
        ?string $referenceId = null,
        ?string $note = null,
        ?string $userId = null
    ): Stock {
        if ($quantity <= 0) {
            throw new \InvalidArgumentException('Quantity must be greater than zero to decrease stock.');
        }

        return DB::transaction(function () use ($outletId, $productId, $quantity, $referenceType, $referenceId, $note, $userId) {
            $stock = Stock::firstOrCreate(
                ['outlet_id' => $outletId, 'product_id' => $productId],
                ['quantity' => 0]
            );

            $quantityBefore = $stock->quantity;
            $quantityAfter = $quantityBefore - $quantity;

            // Optional: check if stock can go negative. Usually, yes, to allow overselling, or throw exception.
            // We'll allow it but you might want to restrict it in the future.
            
            $stock->update(['quantity' => $quantityAfter]);

            $this->recordMovement(
                $stock->id,
                'decrease',
                $quantityBefore,
                $quantityAfter,
                -$quantity, // negative change
                $referenceType,
                $referenceId,
                $note,
                $userId ?? auth()->id()
            );

            return $stock;
        });
    }

    /**
     * Adjust stock to a specific quantity directly.
     */
    public function adjustStock(
        string $outletId,
        string $productId,
        int $newQuantity,
        ?string $note = null,
        ?string $userId = null
    ): Stock {
        if ($newQuantity < 0) {
            throw new \InvalidArgumentException('New quantity cannot be negative for adjustment.');
        }

        return DB::transaction(function () use ($outletId, $productId, $newQuantity, $note, $userId) {
            $stock = Stock::firstOrCreate(
                ['outlet_id' => $outletId, 'product_id' => $productId],
                ['quantity' => 0]
            );

            $quantityBefore = $stock->quantity;
            $quantityChange = $newQuantity - $quantityBefore;

            if ($quantityChange === 0) {
                return $stock; // No change
            }

            $stock->update(['quantity' => $newQuantity]);

            $this->recordMovement(
                $stock->id,
                'adjust',
                $quantityBefore,
                $newQuantity,
                $quantityChange,
                'Adjustment',
                null,
                $note,
                $userId ?? auth()->id()
            );

            return $stock;
        });
    }

    /**
     * Check if a stock is low. 
     * In Sprint 2, this simply returns a boolean flag to be displayed.
     * In Sprint 6, this could dispatch a job.
     */
    public function triggerLowStockAlert(Stock $stock): bool
    {
        return $stock->quantity <= $stock->low_stock_threshold;
    }

    /**
     * Internal method to record the stock movement history.
     */
    protected function recordMovement(
        string $stockId,
        string $type,
        int $quantityBefore,
        int $quantityAfter,
        int $quantityChange,
        ?string $referenceType,
        ?string $referenceId,
        ?string $note,
        ?string $userId
    ): void {
        StockMovement::create([
            'stock_id' => $stockId,
            'type' => $type,
            'quantity_before' => $quantityBefore,
            'quantity_after' => $quantityAfter,
            'quantity_change' => $quantityChange,
            'reference_type' => $referenceType,
            'reference_id' => $referenceId,
            'note' => $note,
            'created_by' => $userId,
        ]);
    }
}
