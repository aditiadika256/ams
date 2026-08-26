<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('program_batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained()->restrictOnDelete();
            $table->string('name', 160);
            $table->string('code', 80);
            $table->timestamp('registration_starts_at')->nullable();
            $table->timestamp('registration_ends_at')->nullable();
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->unsignedInteger('capacity')->nullable();
            $table->unsignedInteger('enrolled_count')->default(0);
            $table->string('mode', 20)->default('ONLINE');
            $table->string('location', 500)->nullable();
            $table->string('timezone', 64)->default('Asia/Makassar');
            $table->decimal('price_override', 15, 2)->nullable();
            $table->string('status', 20)->default('DRAFT');
            $table->boolean('allow_retakes')->default(false);
            $table->json('metadata')->nullable();
            $table->foreignId('created_by')->nullable()->index()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->index()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->unique(['program_id', 'code']);
            $table->index(['program_id', 'status', 'starts_at']);
        });

        Schema::create('program_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_batch_id')->constrained()->restrictOnDelete();
            $table->string('title', 180);
            $table->text('description')->nullable();
            $table->timestamp('starts_at');
            $table->timestamp('ends_at');
            $table->string('timezone', 64)->default('Asia/Makassar');
            $table->string('mode', 20)->default('ONLINE');
            $table->string('mentor_assignment_mode', 20)->default('ADMIN');
            $table->string('location', 500)->nullable();
            $table->string('meeting_url', 2048)->nullable();
            $table->unsignedInteger('capacity')->nullable();
            $table->unsignedInteger('reserved_count')->default(0);
            $table->string('status', 20)->default('DRAFT');
            $table->json('metadata')->nullable();
            $table->foreignId('created_by')->nullable()->index()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->index()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['program_batch_id', 'status', 'starts_at']);
        });

        Schema::create('session_mentor_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_session_id')->constrained()->restrictOnDelete();
            $table->foreignId('mentor_id')->constrained()->restrictOnDelete();
            $table->string('role', 30)->default('lead');
            $table->string('status', 20)->default('ACTIVE');
            $table->unsignedInteger('capacity')->nullable();
            $table->unsignedInteger('reserved_count')->default(0);
            $table->timestamp('assigned_at');
            $table->timestamp('ended_at')->nullable();
            $table->json('metadata')->nullable();
            $table->foreignId('created_by')->nullable()->index()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->index()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['mentor_id', 'status']);
            $table->index(['program_session_id', 'status']);
        });

        if (in_array(DB::getDriverName(), ['pgsql', 'sqlite'], true)) {
            DB::statement(
                "CREATE UNIQUE INDEX session_mentor_active_unique ON session_mentor_assignments (program_session_id, mentor_id) WHERE status = 'ACTIVE'"
            );
        }

        Schema::table('order_items', function (Blueprint $table) {
            $table->foreign('program_batch_id')
                ->references('id')
                ->on('program_batches')
                ->restrictOnDelete();
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement(
                'ALTER TABLE program_batches ADD CONSTRAINT program_batches_period_valid CHECK (starts_at IS NULL OR ends_at IS NULL OR starts_at < ends_at)'
            );
            DB::statement(
                'ALTER TABLE program_batches ADD CONSTRAINT program_batches_registration_period_valid CHECK (registration_starts_at IS NULL OR registration_ends_at IS NULL OR registration_starts_at < registration_ends_at)'
            );
            DB::statement(
                'ALTER TABLE program_batches ADD CONSTRAINT program_batches_price_non_negative CHECK (price_override IS NULL OR price_override >= 0)'
            );
            DB::statement(
                'ALTER TABLE program_sessions ADD CONSTRAINT program_sessions_period_valid CHECK (starts_at < ends_at)'
            );
            DB::statement(
                'ALTER TABLE session_mentor_assignments ADD CONSTRAINT session_mentor_capacity_valid CHECK (capacity IS NULL OR reserved_count <= capacity)'
            );
        }
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropForeign(['program_batch_id']);
        });
        Schema::dropIfExists('session_mentor_assignments');
        Schema::dropIfExists('program_sessions');
        Schema::dropIfExists('program_batches');
    }
};
