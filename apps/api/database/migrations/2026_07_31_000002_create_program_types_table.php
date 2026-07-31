<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('program_types', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique();
            $table->string('name', 100);
            $table->smallInteger('row_status')->default(1);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
            $table->foreignId('created_by')
                ->nullable()
                ->index()
                ->constrained('users')
                ->nullOnDelete();
            $table->foreignId('updated_by')
                ->nullable()
                ->index()
                ->constrained('users')
                ->nullOnDelete();

            $table->index(['row_status', 'sort_order', 'id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('program_types');
    }
};
