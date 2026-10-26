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
        // 1. Create assessment_contexts table (Layer 1 CBT: Master Stimulus / Wacana Induk)
        if (! Schema::hasTable('assessment_contexts')) {
            Schema::create('assessment_contexts', function (Blueprint $table): void {
                $table->id();
                $table->string('title', 255);
                $table->text('body_content');
                $table->string('media_url', 500)->nullable();
                $table->string('media_type', 50)->nullable(); // 'image', 'audio', 'video'
                $table->smallInteger('row_status')->default(1);
                $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
                $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();

                $table->index('created_by');
                $table->index('updated_by');
                $table->index(['row_status', 'created_at']);
            });
        }

        // 2. Enhance questions table with context_id, status, estimated_seconds, tags, and row_status
        Schema::table('questions', function (Blueprint $table): void {
            if (! Schema::hasColumn('questions', 'context_id')) {
                $table->foreignId('context_id')->nullable()->after('id')->constrained('assessment_contexts')->nullOnDelete();
            }
            if (! Schema::hasColumn('questions', 'estimated_seconds')) {
                $table->unsignedInteger('estimated_seconds')->default(60)->after('difficulty');
            }
            if (! Schema::hasColumn('questions', 'tags')) {
                $table->json('tags')->nullable()->after('estimated_seconds');
            }
            if (! Schema::hasColumn('questions', 'status')) {
                $table->string('status', 30)->default('draft')->after('tags'); // 'draft', 'under_review', 'approved', 'revision_needed'
            }
            if (! Schema::hasColumn('questions', 'row_status')) {
                $table->smallInteger('row_status')->default(1)->after('status');
            }

            $table->index('context_id');
            $table->index(['row_status', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('questions', function (Blueprint $table): void {
            $table->dropIndex(['context_id']);
            $table->dropIndex(['row_status', 'created_at']);
            $table->dropConstrainedForeignId('context_id');
            $table->dropColumn(['estimated_seconds', 'tags', 'status', 'row_status']);
        });

        Schema::dropIfExists('assessment_contexts');
    }
};
