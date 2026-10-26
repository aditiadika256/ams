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
        // 1. Upgrade exam_packages (Layer 2 Blueprint Builder)
        Schema::table('exam_packages', function (Blueprint $table): void {
            if (! Schema::hasColumn('exam_packages', 'visual_mode')) {
                $table->string('visual_mode', 30)->default('standard')->after('name'); // 'standard', 'cpns', 'utbk', 'akm', 'osn', 'omi'
            }
            if (! Schema::hasColumn('exam_packages', 'scoring_mode')) {
                $table->string('scoring_mode', 30)->default('same_weight')->after('visual_mode'); // 'same_weight', 'custom_weight', 'scale_tkp', 'irt_2pl'
            }
            if (! Schema::hasColumn('exam_packages', 'negative_marking')) {
                $table->boolean('negative_marking')->default(false)->after('scoring_mode');
            }
            if (! Schema::hasColumn('exam_packages', 'row_status')) {
                $table->smallInteger('row_status')->default(1)->after('show_result_mode');
            }

            $table->index(['row_status', 'created_at']);
        });

        // 2. Upgrade exam_sections (Sub-tes berjeda & urutan drag-and-drop)
        Schema::table('exam_sections', function (Blueprint $table): void {
            if (! Schema::hasColumn('exam_sections', 'sort_order')) {
                $table->unsignedInteger('sort_order')->default(1)->after('subject');
            }
            if (! Schema::hasColumn('exam_sections', 'transition_mode')) {
                $table->string('transition_mode', 30)->default('direct_continuous')->after('sort_order'); // 'direct_continuous', 'intermission_break'
            }
            if (! Schema::hasColumn('exam_sections', 'break_duration_seconds')) {
                $table->unsignedInteger('break_duration_seconds')->default(0)->after('transition_mode');
            }
            if (! Schema::hasColumn('exam_sections', 'section_timer_minutes')) {
                $table->unsignedInteger('section_timer_minutes')->nullable()->after('break_duration_seconds');
            }
            if (! Schema::hasColumn('exam_sections', 'row_status')) {
                $table->smallInteger('row_status')->default(1)->after('difficulty_mix');
            }

            $table->index(['package_id', 'sort_order']);
            $table->index(['row_status', 'created_at']);
        });

        // 3. Create exam_section_questions pivot table
        if (! Schema::hasTable('exam_section_questions')) {
            Schema::create('exam_section_questions', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('exam_section_id')->constrained('exam_sections')->cascadeOnDelete();
                $table->foreignId('question_id')->constrained('questions')->cascadeOnDelete();
                $table->unsignedInteger('sort_order')->default(1);
                $table->decimal('custom_weight', 8, 3)->nullable();
                $table->smallInteger('row_status')->default(1);
                $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
                $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();

                $table->index(['exam_section_id', 'sort_order']);
                $table->index('question_id');
                $table->index('created_by');
                $table->index('updated_by');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exam_section_questions');

        Schema::table('exam_sections', function (Blueprint $table): void {
            $table->dropIndex(['package_id', 'sort_order']);
            $table->dropIndex(['row_status', 'created_at']);
            $table->dropColumn(['sort_order', 'transition_mode', 'break_duration_seconds', 'section_timer_minutes', 'row_status']);
        });

        Schema::table('exam_packages', function (Blueprint $table): void {
            $table->dropIndex(['row_status', 'created_at']);
            $table->dropColumn(['visual_mode', 'scoring_mode', 'negative_marking', 'row_status']);
        });
    }
};
