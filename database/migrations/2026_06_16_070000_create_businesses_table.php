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
        Schema::create('businesses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 100);
            $table->string('slug', 50)->unique(); // for kasir URL: /kasir/{business:slug}
            $table->string('owner_name', 100); // sync from users.name on register
            $table->string('phone', 20)->nullable();
            $table->string('email', 100)->nullable();
            $table->text('address')->nullable();
            $table->string('logo', 255)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_activity_at')->nullable(); // updated on tenant login or valid transaction
            $table->softDeletes(); // for super admin soft delete
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('businesses');
    }
};
