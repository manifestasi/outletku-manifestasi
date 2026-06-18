<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property string $id
 * @property string $stock_id
 * @property string $type
 * @property int $quantity_before
 * @property int $quantity_after
 * @property int $quantity_change
 * @property string|null $reference_type
 * @property string|null $reference_id
 * @property string|null $note
 * @property string|null $created_by
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read Stock $stock
 * @property-read User|null $user
 */
class StockMovement extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'stock_id',
        'type',
        'quantity_before',
        'quantity_after',
        'quantity_change',
        'reference_type',
        'reference_id',
        'note',
        'created_by',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'quantity_before' => 'integer',
            'quantity_after' => 'integer',
            'quantity_change' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<Stock, $this>
     */
    public function stock(): BelongsTo
    {
        return $this->belongsTo(Stock::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
