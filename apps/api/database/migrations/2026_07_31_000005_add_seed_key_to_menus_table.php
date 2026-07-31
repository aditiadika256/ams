<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('menus', function (Blueprint $table) {
            $table->string('seed_key', 100)->nullable();
            $table->unique('seed_key', 'menus_seed_key_unique');
        });
    }

    public function down(): void
    {
        Schema::table('menus', function (Blueprint $table) {
            $table->dropUnique('menus_seed_key_unique');
            $table->dropColumn('seed_key');
        });
    }
};
