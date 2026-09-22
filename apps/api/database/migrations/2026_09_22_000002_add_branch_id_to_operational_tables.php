<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private array $tables = [
        'orders',
        'transactions',
        'finance_transactions',
        'wallets',
        'program_batches',
        'program_sessions',
        'mentor_applications',
    ];

    public function up(): void
    {
        foreach ($this->tables as $table) {
            if (Schema::hasTable($table) && ! Schema::hasColumn($table, 'branch_id')) {
                Schema::table($table, function (Blueprint $tableBlueprint) {
                    $tableBlueprint->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();
                    $tableBlueprint->index('branch_id');
                });
            }
        }
    }

    public function down(): void
    {
        foreach ($this->tables as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'branch_id')) {
                Schema::table($table, function (Blueprint $tableBlueprint) {
                    $tableBlueprint->dropForeign(['branch_id']);
                    $tableBlueprint->dropColumn('branch_id');
                });
            }
        }
    }
};
