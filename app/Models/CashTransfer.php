<?php

namespace App\Models;

use App\Models\Scopes\BusinessScope;
use Illuminate\Database\Eloquent\Attributes\ScopedBy;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[ScopedBy(BusinessScope::class)]
class CashTransfer extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'business_id',
        'from_outlet_id',
        'to_outlet_id',
        'amount',
        'transfer_date',
        'type',
        'description',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'amount'        => 'decimal:2',
            'transfer_date' => 'date',
        ];
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function fromOutlet(): BelongsTo
    {
        return $this->belongsTo(Outlet::class, 'from_outlet_id');
    }

    public function toOutlet(): BelongsTo
    {
        return $this->belongsTo(Outlet::class, 'to_outlet_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getTypeLabel(): string
    {
        return match ($this->type) {
            'outlet_to_outlet' => 'Outlet → Outlet',
            'outlet_to_owner'  => 'Outlet → Owner',
            'owner_to_outlet'  => 'Owner → Outlet',
            default            => $this->type,
        };
    }
}
