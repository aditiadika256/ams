<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('program_accesses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->foreignId('program_id')->constrained()->restrictOnDelete();
            $table->foreignId('program_batch_id')->nullable()->constrained()->restrictOnDelete();
            $table->foreignId('parent_program_access_id')->nullable()->constrained('program_accesses')->restrictOnDelete();
            $table->string('source_type', 30);
            $table->string('source_id', 120)->nullable();
            $table->string('grant_key', 191)->unique();
            $table->string('status', 20)->default('WAITING');
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->timestamp('activated_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('suspended_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->timestamp('archived_at')->nullable();
            $table->timestamp('last_accessed_at')->nullable();
            $table->json('metadata')->nullable();
            $table->foreignId('created_by')->nullable()->index()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->index()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['user_id', 'status', 'archived_at', 'last_accessed_at'], 'workspace_access_index');
            $table->index(['user_id', 'program_id', 'program_batch_id'], 'user_program_batch_index');
            $table->index(['parent_program_access_id', 'status']);
            $table->index(['source_type', 'source_id']);
        });

        Schema::create('access_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_access_id')->constrained()->restrictOnDelete();
            $table->foreignId('actor_user_id')->nullable()->index()->constrained('users')->nullOnDelete();
            $table->json('actor_snapshot')->nullable();
            $table->string('action', 80);
            $table->text('reason')->nullable();
            $table->uuid('correlation_id');
            $table->json('before_state')->nullable();
            $table->json('after_state')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->index(['program_access_id', 'created_at']);
            $table->index(['correlation_id', 'created_at']);
            $table->index(['action', 'created_at']);
        });

        Schema::table('exam_sessions', function (Blueprint $table) {
            $table->foreignId('program_access_id')
                ->after('user_id')
                ->constrained('program_accesses')
                ->restrictOnDelete();
            $table->index(['program_access_id', 'status']);
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement(
                'ALTER TABLE program_accesses ADD CONSTRAINT program_accesses_period_valid CHECK (starts_at IS NULL OR ends_at IS NULL OR starts_at < ends_at)'
            );
        }
    }

    public function down(): void
    {
        Schema::table('exam_sessions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('program_access_id');
        });
        Schema::dropIfExists('access_events');
        Schema::dropIfExists('program_accesses');
    }
};
