<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mentors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('specialization');
            $table->text('bio')->nullable();
            $table->integer('experience_years')->default(0);
            $table->json('social_links')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('mentor_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mentor_id')->constrained()->cascadeOnDelete();
            $table->string('title')->nullable(); // Student/Group
            $table->text('description')->nullable(); 
            $table->string('subject')->nullable();
            $table->string('location')->nullable();
            $table->string('status')->default('scheduled'); // scheduled, done, rescheduled, cancelled
            $table->string('guest_email')->nullable();
            $table->string('color_hex', 7)->nullable();
            $table->dateTime('start_time');
            $table->dateTime('end_time');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mentor_schedules');
        Schema::dropIfExists('mentors');
    }
};
