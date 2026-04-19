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
        $tables = ['users', 'programs', 'orders', 'order_items', 'audit_logs'];

        foreach ($tables as $tableName) {
            if (Schema::hasTable($tableName)) {
                Schema::table($tableName, function (Blueprint $table) {
                    $table->unsignedBigInteger('created_by')->nullable()->after('created_at');
                    $table->unsignedBigInteger('updated_by')->nullable()->after('updated_at');
                    
                    // Optional: Add foreign keys if you want strict referential integrity
                    // $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
                    // $table->foreign('updated_by')->references('id')->on('users')->nullOnDelete();
                });
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tables = ['users', 'programs', 'orders', 'order_items', 'audit_logs'];

        foreach ($tables as $tableName) {
            if (Schema::hasTable($tableName)) {
                Schema::table($tableName, function (Blueprint $table) {
                    $table->dropColumn(['created_by', 'updated_by']);
                });
            }
        }
    }
};
