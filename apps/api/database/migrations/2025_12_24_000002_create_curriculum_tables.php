<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('program_modules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->integer('order')->default(0);
            $table->boolean('is_published')->default(false);
            $table->timestamps();
        });

        Schema::create('program_lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('module_id')->constrained('program_modules')->cascadeOnDelete();
            $table->string('title');
            $table->string('slug')->nullable();
            $table->enum('content_type', ['video', 'text', 'quiz', 'assignment'])->default('text');
            $table->string('content_url')->nullable(); // For video URL or file path
            $table->longText('content_body')->nullable(); // For text content
            $table->integer('duration_minutes')->default(0);
            $table->integer('order')->default(0);
            $table->boolean('is_published')->default(false);
            $table->boolean('is_preview')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('program_lessons');
        Schema::dropIfExists('program_modules');
    }
};
