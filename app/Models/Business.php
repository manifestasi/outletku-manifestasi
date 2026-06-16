<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string $owner_name
 * @property string|null $phone
 * @property string|null $email
 * @property string|null $address
 * @property string|null $logo
 * @property bool $is_active
 * @property \Illuminate\Support\Carbon|null $last_activity_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, User> $users
 * @property-read \Illuminate\Database\Eloquent\Collection<int, Outlet> $outlets
 */
class Business extends Model
{
    use HasFactory, SoftDeletes, HasUuids;

    protected $fillable = [
        'name',
        'slug',
        'owner_name',
        'phone',
        'email',
        'address',
        'logo',
        'is_active',
        'last_activity_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'last_activity_at' => 'datetime',
        ];
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<User, $this>
     */
    public function users(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<Outlet, $this>
     */
    public function outlets(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Outlet::class);
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * Touch last_activity_at timestamp.
     */
    public function touchLastActivity(): void
    {
        $this->update(['last_activity_at' => now()]);
    }
}
