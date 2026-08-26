<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('program_id')->constrained()->restrictOnDelete();
            $table->unsignedBigInteger('program_batch_id')->nullable()->index();
            $table->string('program_name');
            $table->string('program_slug');
            $table->string('batch_name')->nullable();
            $table->string('batch_code')->nullable();
            $table->decimal('unit_price', 15, 2);
            $table->char('currency', 3)->default('IDR');
            $table->unsignedInteger('quantity')->default(1);
            $table->json('snapshot')->nullable();
            $table->timestamps();
            $table->index(['order_id', 'program_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
