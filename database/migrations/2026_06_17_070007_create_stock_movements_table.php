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
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('stock_id')->constrained()->cascadeOnDelete();
            
            // e.g. 'increase', 'decrease', 'adjust'
            $table->string('type');
            
            $table->integer('quantity_before');
            $table->integer('quantity_after');
            $table->integer('quantity_change');
            
            // e.g. 'Restock', 'Adjustment', 'Sale'
            $table->string('reference_type')->nullable();
            $table->string('reference_id')->nullable();
            
            $table->text('note')->nullable();
            
            // The user who performed the movement
            $table->foreignUuid('created_by')->nullable()->constrained('users')->nullOnDelete();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};
