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
        // 1. Upgrade exam_attempts with proctor_status & row_status if missing
        if (Schema::hasTable('exam_attempts')) {
            Schema::table('exam_attempts', function (Blueprint $table) {
                if (!Schema::hasColumn('exam_attempts', 'proctor_status')) {
                    $table->string('proctor_status', 30)->default('active')->after('meta'); // active, idle, warned, disqualified, completed, paused
                }
                if (!Schema::hasColumn('exam_attempts', 'row_status')) {
                    $table->smallInteger('row_status')->default(1)->after('proctor_status');
                }
            });
        }

        // 2. exam_session_tokens (Live Proctoring Dynamic Tokens)
        if (!Schema::hasTable('exam_session_tokens')) {
            Schema::create('exam_session_tokens', function (Blueprint $table) {
                $table->id();
                $table->foreignId('session_id')->nullable()->constrained('exam_sessions')->cascadeOnDelete();
                $table->foreignId('package_id')->nullable()->constrained('exam_packages')->cascadeOnDelete();
                $table->string('token_code', 10)->index(); // 6-character uppercase alphanumeric code
                $table->boolean('is_active')->default(true);
                $table->timestamp('expires_at');
                $table->smallInteger('row_status')->default(1);
                $table->timestamps();
                $table->unsignedBigInteger('created_by')->nullable();
                $table->unsignedBigInteger('updated_by')->nullable();

                $table->index('created_by', 'idx_exam_session_tokens_creator');
                $table->index('updated_by', 'idx_exam_session_tokens_editor');
                $table->index(['row_status', 'is_active', 'expires_at'], 'idx_exam_session_tokens_lookup');
            });
        }

        // 3. proctor_logs (Fraud incident & proctor actions)
        if (!Schema::hasTable('proctor_logs')) {
            Schema::create('proctor_logs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('exam_attempt_id')->nullable()->constrained('exam_attempts')->cascadeOnDelete();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->string('event_type', 50); // tab_switch, fullscreen_exit, device_change, suspicious_key, proctor_warning, proctor_disqualified, proctor_reset
                $table->string('severity', 20)->default('warning'); // info, warning, critical
                $table->json('details')->nullable();
                $table->timestamp('resolved_at')->nullable();
                $table->smallInteger('row_status')->default(1);
                $table->timestamps();
                $table->unsignedBigInteger('created_by')->nullable();
                $table->unsignedBigInteger('updated_by')->nullable();

                $table->index(['exam_attempt_id', 'event_type'], 'idx_proctor_logs_attempt_event');
                $table->index('user_id', 'idx_proctor_logs_user');
                $table->index('created_by', 'idx_proctor_logs_creator');
                $table->index('updated_by', 'idx_proctor_logs_editor');
                $table->index(['row_status', 'created_at'], 'idx_proctor_logs_status_time');
            });
        }

        // 4. exam_item_responses (Item level response matrix for IRT & Psychometrics)
        if (!Schema::hasTable('exam_item_responses')) {
            Schema::create('exam_item_responses', function (Blueprint $table) {
                $table->id();
                $table->foreignId('exam_attempt_id')->constrained('exam_attempts')->cascadeOnDelete();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('question_id')->constrained('questions')->cascadeOnDelete();
                $table->unsignedBigInteger('selected_option_id')->nullable();
                $table->string('selected_option_key', 20)->nullable();
                $table->smallInteger('is_correct')->default(0); // 1 = Benar, 0 = Salah
                $table->decimal('score_earned', 8, 3)->default(0);
                $table->integer('response_time_seconds')->default(0);
                $table->integer('tab_switch_count')->default(0);
                $table->smallInteger('row_status')->default(1);
                $table->timestamps();
                $table->unsignedBigInteger('created_by')->nullable();
                $table->unsignedBigInteger('updated_by')->nullable();

                $table->index(['exam_attempt_id', 'question_id'], 'idx_exam_responses_attempt_q');
                $table->index(['user_id', 'question_id'], 'idx_exam_responses_user_q');
                $table->index('created_by', 'idx_exam_responses_creator');
                $table->index('updated_by', 'idx_exam_responses_editor');
                $table->index(['row_status', 'created_at'], 'idx_exam_responses_status_time');
            });
        }

        // 5. item_analysis_parameters (IRT 2PL / Rasch parameter estimation & drop status)
        if (!Schema::hasTable('item_analysis_parameters')) {
            Schema::create('item_analysis_parameters', function (Blueprint $table) {
                $table->id();
                $table->foreignId('exam_package_id')->constrained('exam_packages')->cascadeOnDelete();
                $table->foreignId('question_id')->constrained('questions')->cascadeOnDelete();
                $table->decimal('difficulty_b', 6, 3)->nullable(); // Parameter Tingkat Kesukaran (b) (-3.00 s/d +3.00)
                $table->decimal('discrimination_a', 6, 3)->nullable(); // Parameter Daya Pembeda (a) (0.00 s/d 2.50)
                $table->decimal('pseudo_guessing_c', 6, 3)->nullable(); // Parameter Tebakan Acak (c) (0.00 s/d 0.35)
                $table->json('distractor_efficiency')->nullable(); // Efisiensi tiap opsi A, B, C, D, E
                $table->string('fit_status', 30)->default('fit'); // fit, unfit, dropped
                $table->boolean('is_dropped')->default(false);
                $table->integer('sample_size')->default(0);
                $table->timestamp('analyzed_at')->useCurrent();
                $table->smallInteger('row_status')->default(1);
                $table->timestamps();
                $table->unsignedBigInteger('created_by')->nullable();
                $table->unsignedBigInteger('updated_by')->nullable();

                $table->index(['exam_package_id', 'question_id'], 'idx_item_analysis_pkg_q');
                $table->index(['exam_package_id', 'is_dropped'], 'idx_item_analysis_pkg_dropped');
                $table->index('created_by', 'idx_item_analysis_creator');
                $table->index('updated_by', 'idx_item_analysis_editor');
                $table->index(['row_status', 'created_at'], 'idx_item_analysis_status_time');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('item_analysis_parameters');
        Schema::dropIfExists('exam_item_responses');
        Schema::dropIfExists('proctor_logs');
        Schema::dropIfExists('exam_session_tokens');

        if (Schema::hasTable('exam_attempts')) {
            Schema::table('exam_attempts', function (Blueprint $table) {
                if (Schema::hasColumn('exam_attempts', 'proctor_status')) {
                    $table->dropColumn('proctor_status');
                }
                if (Schema::hasColumn('exam_attempts', 'row_status')) {
                    $table->dropColumn('row_status');
                }
            });
        }
    }
};
