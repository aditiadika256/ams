<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tags', function (Blueprint $table) {
            $table->id();
            $table->string('code', 80)->unique();
            $table->string('name', 120);
            $table->text('description')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamp('archived_at')->nullable();
            $table->foreignId('created_by')->nullable()->index()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->index()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['is_active', 'archived_at', 'sort_order']);
        });

        Schema::create('program_tag', function (Blueprint $table) {
            $table->foreignId('program_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tag_id')->constrained()->restrictOnDelete();
            $table->timestamps();
            $table->primary(['program_id', 'tag_id']);
            $table->index(['tag_id', 'program_id']);
        });

        Schema::create('component_definitions', function (Blueprint $table) {
            $table->id();
            $table->string('code', 80)->unique();
            $table->string('name', 120);
            $table->text('description')->nullable();
            $table->json('config_schema')->nullable();
            $table->boolean('is_available')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
            $table->index(['is_available', 'sort_order']);
        });

        Schema::create('program_components', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained()->cascadeOnDelete();
            $table->foreignId('component_definition_id')->constrained()->restrictOnDelete();
            $table->boolean('is_enabled')->default(true);
            $table->string('label', 120)->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->json('configuration')->nullable();
            $table->foreignId('created_by')->nullable()->index()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->index()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->unique(['program_id', 'component_definition_id']);
            $table->index(['program_id', 'is_enabled', 'sort_order']);
        });

        Schema::create('program_relations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_program_id')->constrained('programs')->cascadeOnDelete();
            $table->foreignId('child_program_id')->constrained('programs')->restrictOnDelete();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_required')->default(true);
            $table->json('metadata')->nullable();
            $table->foreignId('created_by')->nullable()->index()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->index()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->unique(['parent_program_id', 'child_program_id']);
            $table->index(['parent_program_id', 'sort_order']);
            $table->index(['child_program_id', 'parent_program_id']);
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement(
                'ALTER TABLE program_relations ADD CONSTRAINT program_relations_not_self CHECK (parent_program_id <> child_program_id)'
            );
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('program_relations');
        Schema::dropIfExists('program_components');
        Schema::dropIfExists('component_definitions');
        Schema::dropIfExists('program_tag');
        Schema::dropIfExists('tags');
    }
};

