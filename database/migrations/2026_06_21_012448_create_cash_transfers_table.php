<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cash_transfers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('business_id')->constrained('businesses')->cascadeOnDelete();
            $table->foreignUuid('from_outlet_id')->nullable()->constrained('outlets')->nullOnDelete();
            $table->foreignUuid('to_outlet_id')->nullable()->constrained('outlets')->nullOnDelete();
            $table->decimal('amount', 12, 2);
            $table->date('transfer_date');
            $table->enum('type', ['outlet_to_outlet', 'outlet_to_owner', 'owner_to_outlet']);
            $table->text('description')->nullable();
            $table->foreignUuid('created_by')->constrained('users');
            $table->timestamps();

            $table->index('business_id');
            $table->index('from_outlet_id');
            $table->index('to_outlet_id');
            $table->index('transfer_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cash_transfers');
    }
};
