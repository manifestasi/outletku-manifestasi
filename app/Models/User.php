<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;

/**
 * @property int $id
 * @property int|null $business_id
 * @property string $name
 * @property string|null $phone
 * @property string|null $avatar
 * @property bool $is_active
 * @property string|null $email
 * @property Carbon|null $email_verified_at
 * @property Carbon|null $last_login_at
 * @property string|null $password
 * @property string|null $pin
 * @property int $pin_failed_attempts
 * @property Carbon|null $pin_locked_until
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Business|null $business
 * @property-read \Illuminate\Database\Eloquent\Collection<int, Outlet> $outlets
 */
class User extends Authenticatable implements PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable, HasUuids;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'business_id',
        'name',
        'phone',
        'avatar',
        'is_active',
        'email',
        'email_verified_at',
        'last_login_at',
        'password',
        'pin',
        'pin_failed_attempts',
        'pin_locked_until',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'pin',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'pin_locked_until' => 'datetime',
            'pin_failed_attempts' => 'integer',
            'is_active' => 'boolean',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Business, $this>
     */
    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    /**
     * @return BelongsToMany<Outlet, $this>
     */
    public function outlets(): BelongsToMany
    {
        return $this->belongsToMany(Outlet::class, 'outlet_user')->withTimestamps();
    }

    /**
     * Check if the user's PIN is currently locked.
     */
    public function isPinLocked(): bool
    {
        return $this->pin_locked_until !== null && $this->pin_locked_until->isFuture();
    }

    /**
     * Increment PIN failure counter and lock if needed.
     */
    public function incrementPinFailure(): void
    {
        $attempts = $this->pin_failed_attempts + 1;
        $lockedUntil = $attempts >= 5 ? now()->addMinutes(15) : null;

        $this->update([
            'pin_failed_attempts' => $attempts,
            'pin_locked_until' => $lockedUntil,
        ]);
    }

    /**
     * Reset PIN failure counter after successful PIN verification.
     */
    public function resetPinFailures(): void
    {
        $this->update([
            'pin_failed_attempts' => 0,
            'pin_locked_until' => null,
        ]);
    }
}
