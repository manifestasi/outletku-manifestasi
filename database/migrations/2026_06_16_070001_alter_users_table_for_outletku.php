<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Add business_id FK after id
            $table->foreignUuid('business_id')->nullable()->after('id')->constrained('businesses')->nullOnDelete();

            // Make email and password nullable (kasir doesn't have email/password)
            $table->string('email', 100)->nullable()->change();
            $table->string('password', 255)->nullable()->change();

            // PIN for cashier authentication
            $table->string('pin', 255)->nullable()->after('password'); // bcrypt hashed
            $table->tinyInteger('pin_failed_attempts')->default(0)->after('pin');
            $table->timestamp('pin_locked_until')->nullable()->after('pin_failed_attempts');

            // Additional profile fields
            $table->string('phone', 20)->nullable()->after('name');
            $table->string('avatar', 255)->nullable()->after('phone');
            $table->boolean('is_active')->default(true)->after('avatar');
            $table->timestamp('last_login_at')->nullable()->after('email_verified_at');

            // Index
            $table->index('business_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['business_id']);
            $table->dropColumn([
                'business_id',
                'pin',
                'pin_failed_attempts',
                'pin_locked_until',
                'phone',
                'avatar',
                'is_active',
                'last_login_at',
            ]);

            $table->string('email', 255)->nullable(false)->change();
            $table->string('password', 255)->nullable(false)->change();
        });
    }
};
