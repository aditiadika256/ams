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
        // 1. program_installments (Layer 3 Program Installment Scheme)
        if (!Schema::hasTable('program_installments')) {
            Schema::create('program_installments', function (Blueprint $table) {
                $table->id();
                $table->foreignId('program_id')->constrained('programs')->cascadeOnDelete();
                $table->integer('term_number'); // 1, 2, 3
                $table->string('title', 150)->nullable(); // e.g. "DP Pendaftaran", "Termin 2"
                $table->decimal('amount', 12, 2);
                $table->integer('due_days_offset')->default(30); // Due in X days after enrollment
                $table->unsignedBigInteger('milestone_section_id')->nullable(); // Locks syllabus sections after this
                $table->smallInteger('row_status')->default(1);
                $table->timestamps();
                $table->unsignedBigInteger('created_by')->nullable();
                $table->unsignedBigInteger('updated_by')->nullable();

                $table->index(['program_id', 'term_number'], 'idx_program_installments_term');
                $table->index('created_by', 'idx_program_installments_creator');
                $table->index('updated_by', 'idx_program_installments_editor');
                $table->index(['row_status', 'created_at'], 'idx_program_installments_status_time');
            });
        }

        // 2. enrollment_installment_trackers (Student Installment & Payment Drip Lock)
        if (!Schema::hasTable('enrollment_installment_trackers')) {
            Schema::create('enrollment_installment_trackers', function (Blueprint $table) {
                $table->id();
                $table->foreignId('program_access_id')->constrained('program_accesses')->cascadeOnDelete();
                $table->foreignId('program_installment_id')->constrained('program_installments')->cascadeOnDelete();
                $table->string('status', 30)->default('pending'); // pending, paid, overdue, bypassed
                $table->timestamp('due_date');
                $table->timestamp('paid_at')->nullable();
                $table->decimal('amount_paid', 12, 2)->default(0);
                $table->unsignedBigInteger('bypassed_by')->nullable();
                $table->string('bypass_reason', 500)->nullable();
                $table->smallInteger('row_status')->default(1);
                $table->timestamps();
                $table->unsignedBigInteger('created_by')->nullable();
                $table->unsignedBigInteger('updated_by')->nullable();

                $table->index(['program_access_id', 'status'], 'idx_installment_trackers_access_status');
                $table->index('bypassed_by', 'idx_installment_trackers_bypass_user');
                $table->index('created_by', 'idx_installment_trackers_creator');
                $table->index('updated_by', 'idx_installment_trackers_editor');
                $table->index(['row_status', 'created_at'], 'idx_installment_trackers_status_time');
            });
        }

        // 3. physical_rooms (Physical Room Inventory per Branch)
        if (!Schema::hasTable('physical_rooms')) {
            Schema::create('physical_rooms', function (Blueprint $table) {
                $table->id();
                $table->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();
                $table->string('room_number', 50); // e.g. "R.101", "Lab-CBT-1"
                $table->string('room_name', 100); // e.g. "Ruang Teori Al-Khawarizmi"
                $table->integer('capacity')->default(30);
                $table->json('facilities')->nullable(); // ["AC", "Projector", "CCTV", "WiFi"]
                $table->boolean('is_active')->default(true);
                $table->smallInteger('row_status')->default(1);
                $table->timestamps();
                $table->unsignedBigInteger('created_by')->nullable();
                $table->unsignedBigInteger('updated_by')->nullable();

                $table->index(['branch_id', 'is_active', 'row_status'], 'idx_physical_rooms_branch_active');
                $table->index('created_by', 'idx_physical_rooms_creator');
                $table->index('updated_by', 'idx_physical_rooms_editor');
                $table->index(['row_status', 'created_at'], 'idx_physical_rooms_status_time');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('physical_rooms');
        Schema::dropIfExists('enrollment_installment_trackers');
        Schema::dropIfExists('program_installments');
    }
};
