<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('session_attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_session_id')->constrained('program_sessions')->cascadeOnDelete();
            $table->foreignId('program_access_id')->constrained('program_accesses')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('status', 20)->default('present'); // present, absent, late, excused
            $table->timestamp('attended_at')->nullable();
            $table->string('notes')->nullable();
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['program_session_id', 'program_access_id']);
            $table->index(['program_session_id', 'status']);
        });

        Schema::create('mentor_session_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_session_id')->constrained('program_sessions')->cascadeOnDelete();
            $table->foreignId('mentor_id')->constrained('mentors')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('topic', 255);
            $table->text('notes')->nullable();
            $table->unsignedInteger('student_count')->default(0);
            $table->unsignedInteger('duration_minutes')->default(90);
            $table->decimal('hourly_rate', 12, 2)->default(50000.00);
            $table->decimal('total_honor', 12, 2)->default(0.00);
            $table->string('status', 20)->default('locked'); // draft, submitted, locked
            $table->timestamp('locked_at')->nullable();
            $table->timestamps();

            $table->unique(['program_session_id', 'mentor_id']);
        });

        Schema::create('mentor_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('name', 150);
            $table->string('email', 150);
            $table->string('phone', 30);
            $table->string('specialization', 150);
            $table->string('ktp_number', 30)->nullable();
            $table->string('cv_url', 500)->nullable();
            $table->string('certificate_url', 500)->nullable();
            $table->string('teaching_video_url', 500)->nullable();
            $table->decimal('written_test_score', 5, 2)->nullable();
            $table->text('interview_notes')->nullable();
            $table->string('assigned_role', 50)->nullable()->default('mentor_harian'); // mentor_utama, mentor_harian
            $table->string('status', 30)->default('applied'); // applied, under_review, assessment, interview, hired, rejected, withdrawn
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mentor_applications');
        Schema::dropIfExists('mentor_session_logs');
        Schema::dropIfExists('session_attendances');
    }
};
