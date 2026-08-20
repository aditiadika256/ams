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
                    $table->foreignId('created_by')
                        ->nullable()
                        ->index()
                        ->constrained('users')
                        ->nullOnDelete();
                    $table->foreignId('updated_by')
                        ->nullable()
                        ->index()
                        ->constrained('users')
                        ->nullOnDelete();
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
                    $table->dropForeign(['created_by']);
                    $table->dropForeign(['updated_by']);
                    $table->dropColumn(['created_by', 'updated_by']);
                });
            }
        }
    }
};
