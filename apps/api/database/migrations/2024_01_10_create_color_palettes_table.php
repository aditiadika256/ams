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
        Schema::create('color_palettes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('primary')->default('#3b82f6');
            $table->string('secondary')->default('#8b5cf6');
            $table->string('destructive')->default('#ef4444');
            $table->string('muted')->default('#6b7280');
            $table->string('accent')->default('#06b6d4');
            $table->string('foreground')->default('#1f2937');
            $table->string('background')->default('#ffffff');
            $table->string('card')->default('#f9fafb');
            $table->string('card_foreground')->default('#1f2937');
            $table->string('popover')->default('#ffffff');
            $table->string('popover_foreground')->default('#1f2937');
            $table->string('border')->default('#e5e7eb');
            $table->string('input')->default('#e5e7eb');
            $table->string('ring')->default('#3b82f6');
            $table->string('chart_one')->default('#3b82f6');
            $table->string('chart_two')->default('#8b5cf6');
            $table->string('chart_three')->default('#ec4899');
            $table->string('chart_four')->default('#f59e0b');
            $table->string('chart_five')->default('#10b981');
            $table->boolean('is_default')->default(false)->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('color_palettes');
    }
};
