<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('color_palettes', function (Blueprint $table) {
            $table->json('dark_colors')->nullable()->after('chart_five');
        });
    }

    public function down(): void
    {
        Schema::table('color_palettes', function (Blueprint $table) {
            $table->dropColumn('dark_colors');
        });
    }
};
