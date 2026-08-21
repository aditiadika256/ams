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
            $table->decimal('progress_percent', 5, 2)->default(0);
            $table->json('progress_breakdown')->nullable();
            $table->timestamp('progress_calculated_at')->nullable();
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

        Schema::create('program_access_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_access_id')->constrained()->restrictOnDelete();
            $table->string('component_code', 40);
            $table->string('activity_type', 60);
            $table->string('activity_key', 191);
            $table->string('source_type', 80)->nullable();
            $table->string('source_id', 120)->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('completed_at');
            $table->timestamp('created_at')->useCurrent();
            $table->unique(['program_access_id', 'component_code', 'activity_key'], 'program_access_activity_unique');
            $table->index(['program_access_id', 'component_code', 'activity_type'], 'program_access_activity_lookup');
        });

        Schema::create('program_certificates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_access_id')->unique()->constrained()->restrictOnDelete();
            $table->string('certificate_number', 80)->unique();
            $table->json('snapshot');
            $table->timestamp('issued_at');
            $table->timestamp('revoked_at')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('session_mentor_reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('session_mentor_assignment_id')->constrained()->restrictOnDelete();
            $table->foreignId('program_session_id')->constrained()->restrictOnDelete();
            $table->foreignId('program_access_id')->constrained()->restrictOnDelete();
            $table->string('status', 20)->default('ACTIVE');
            $table->string('idempotency_key', 128);
            $table->timestamp('reserved_at');
            $table->timestamp('released_at')->nullable();
            $table->timestamps();
            $table->index(['session_mentor_assignment_id', 'status'], 'mentor_reservation_assignment_index');
            $table->index(['program_access_id', 'status'], 'mentor_reservation_access_index');
            $table->unique(['program_access_id', 'idempotency_key'], 'mentor_reservation_idempotency_unique');
        });

        if (in_array(DB::getDriverName(), ['pgsql', 'sqlite'], true)) {
            DB::statement(
                "CREATE UNIQUE INDEX session_access_active_mentor_unique ON session_mentor_reservations (program_session_id, program_access_id) WHERE status = 'ACTIVE'"
            );
        }

        Schema::create('program_session_updates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('recipient_user_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('program_access_id')->nullable()->constrained()->restrictOnDelete();
            $table->foreignId('mentor_id')->nullable()->constrained()->restrictOnDelete();
            $table->foreignId('program_session_id')->constrained()->restrictOnDelete();
            $table->string('recipient_key', 80);
            $table->string('type', 60);
            $table->uuid('correlation_id');
            $table->json('payload');
            $table->timestamp('occurred_at');
            $table->timestamp('acknowledged_at')->nullable();
            $table->timestamps();
            $table->unique(['correlation_id', 'recipient_key'], 'session_update_recipient_unique');
            $table->index(['recipient_user_id', 'acknowledged_at', 'occurred_at'], 'session_update_inbox_index');
            $table->index(['program_session_id', 'occurred_at'], 'session_update_session_index');
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
            $table->dropIndex(['program_access_id', 'status']);
            $table->dropConstrainedForeignId('program_access_id');
        });
        Schema::dropIfExists('program_session_updates');
        Schema::dropIfExists('program_certificates');
        Schema::dropIfExists('program_access_activities');
        Schema::dropIfExists('session_mentor_reservations');
        Schema::dropIfExists('access_events');
        Schema::dropIfExists('program_accesses');
    }
};
