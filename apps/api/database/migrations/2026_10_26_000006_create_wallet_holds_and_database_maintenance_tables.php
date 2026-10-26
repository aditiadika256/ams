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
        // 1. wallet_holds (Financial Hold Balance & Dispute Control)
        if (!Schema::hasTable('wallet_holds')) {
            Schema::create('wallet_holds', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('wallet_id')->constrained('wallets')->cascadeOnDelete();
                $table->decimal('amount', 12, 2);
                $table->string('reason');
                $table->string('release_condition')->nullable();
                $table->string('status', 30)->default('held'); // held, released, forfeited
                $table->timestamp('released_at')->nullable();
                $table->smallInteger('row_status')->default(1);
                $table->timestamps();
                $table->unsignedBigInteger('created_by')->nullable();
                $table->unsignedBigInteger('updated_by')->nullable();

                $table->index(['wallet_id', 'status'], 'idx_wallet_holds_wallet_status');
                $table->index('user_id', 'idx_wallet_holds_user');
                $table->index('created_by', 'idx_wallet_holds_creator');
                $table->index('updated_by', 'idx_wallet_holds_editor');
                $table->index(['row_status', 'created_at'], 'idx_wallet_holds_status_time');
            });
        }

        // 2. database_maintenance_logs (System DB Tools & Snapshot Audit)
        if (!Schema::hasTable('database_maintenance_logs')) {
            Schema::create('database_maintenance_logs', function (Blueprint $table) {
                $table->id();
                $table->string('action', 100); // clear_expired_cache, vacuum_analyze, reindex_transactions, backup_snapshot
                $table->integer('execution_time_ms')->default(0);
                $table->string('status', 30)->default('success'); // success, failed, running
                $table->json('output_details')->nullable();
                $table->foreignId('triggered_by')->nullable()->constrained('users')->nullOnDelete();
                $table->smallInteger('row_status')->default(1);
                $table->timestamps();
                $table->unsignedBigInteger('created_by')->nullable();
                $table->unsignedBigInteger('updated_by')->nullable();

                $table->index('action', 'idx_db_maintenance_action');
                $table->index('triggered_by', 'idx_db_maintenance_user');
                $table->index('created_by', 'idx_db_maintenance_creator');
                $table->index('updated_by', 'idx_db_maintenance_editor');
                $table->index(['row_status', 'created_at'], 'idx_db_maintenance_status_time');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('database_maintenance_logs');
        Schema::dropIfExists('wallet_holds');
    }
};
