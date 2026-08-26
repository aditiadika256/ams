<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('access_codes', function (Blueprint $table) {
            $table->id();
            $table->string('code_hash', 64)->unique();
            $table->string('code_hint', 16);
            $table->string('type', 30);
            $table->foreignId('program_id')->constrained()->restrictOnDelete();
            $table->foreignId('program_batch_id')->nullable()->constrained()->restrictOnDelete();
            $table->unsignedInteger('max_redemptions')->nullable();
            $table->unsignedInteger('redemptions_count')->default(0);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->json('eligibility')->nullable();
            $table->json('metadata')->nullable();
            $table->foreignId('created_by')->nullable()->index()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->index()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['type', 'is_active', 'starts_at', 'ends_at']);
            $table->index(['program_id', 'program_batch_id']);
        });

        Schema::create('access_code_redemptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('access_code_id')->constrained()->restrictOnDelete();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->foreignId('program_access_id')->nullable()->constrained()->restrictOnDelete();
            $table->string('idempotency_key', 191)->unique();
            $table->uuid('correlation_id');
            $table->timestamp('redeemed_at');
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->unique(['access_code_id', 'user_id'], 'access_code_user_unique');
            $table->index(['user_id', 'redeemed_at']);
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement(
                'ALTER TABLE access_codes ADD CONSTRAINT access_codes_period_valid CHECK (starts_at IS NULL OR ends_at IS NULL OR starts_at < ends_at)'
            );
            DB::statement(
                'ALTER TABLE access_codes ADD CONSTRAINT access_codes_redemption_count_valid CHECK (max_redemptions IS NULL OR redemptions_count <= max_redemptions)'
            );
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('access_code_redemptions');
        Schema::dropIfExists('access_codes');
    }
};

