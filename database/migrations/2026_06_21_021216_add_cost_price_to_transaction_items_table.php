<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transaction_items', function (Blueprint $table) {
            $table->decimal('cost_price', 15, 2)->default(0)->after('unit_price');
        });

        // Backfill dari harga modal produk saat ini
        DB::statement('
            UPDATE transaction_items ti
            INNER JOIN products p ON p.id = ti.product_id
            SET ti.cost_price = p.cost_price
            WHERE ti.product_id IS NOT NULL
        ');
    }

    public function down(): void
    {
        Schema::table('transaction_items', function (Blueprint $table) {
            $table->dropColumn('cost_price');
        });
    }
};
