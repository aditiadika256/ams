<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media_assets', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('program_id')->constrained()->restrictOnDelete();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('disk', 64);
            $table->string('object_key', 500);
            $table->string('original_name', 255);
            $table->string('mime_type', 160);
            $table->string('extension', 20);
            $table->unsignedBigInteger('size_bytes');
            $table->char('checksum_sha256', 64);
            $table->timestamps();
            $table->softDeletes();
            $table->unique(['disk', 'object_key']);
            $table->index(['program_id', 'deleted_at', 'created_at'], 'media_assets_program_index');
            $table->index(['uploaded_by', 'created_at'], 'media_assets_uploader_index');
        });

        Schema::create('program_component_contents', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('program_component_id')->constrained()->restrictOnDelete();
            $table->foreignId('media_asset_id')->nullable()->constrained()->restrictOnDelete();
            $table->string('title', 180);
            $table->string('slug', 190);
            $table->text('summary')->nullable();
            $table->longText('body')->nullable();
            $table->string('external_url', 2048)->nullable();
            $table->json('payload')->nullable();
            $table->string('status', 20)->default('DRAFT');
            $table->timestamp('published_at')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
            $table->unique(['program_component_id', 'slug']);
            $table->index(
                ['program_component_id', 'status', 'deleted_at', 'sort_order', 'id'],
                'program_component_contents_listing_index',
            );
            $table->index(['media_asset_id', 'deleted_at'], 'program_component_contents_media_index');
        });

        Schema::create('program_component_submissions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('program_component_content_id')->constrained()->restrictOnDelete();
            $table->foreignId('program_access_id')->constrained()->restrictOnDelete();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->json('payload');
            $table->timestamp('submitted_at');
            $table->timestamps();
            $table->unique(
                ['program_component_content_id', 'program_access_id'],
                'program_component_submission_access_unique',
            );
            $table->index(
                ['program_access_id', 'program_component_content_id', 'submitted_at'],
                'program_component_submissions_access_index',
            );
            $table->index(['user_id', 'submitted_at'], 'program_component_submissions_user_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('program_component_submissions');
        Schema::dropIfExists('program_component_contents');
        Schema::dropIfExists('media_assets');
    }
};
