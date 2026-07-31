<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('programs', function (Blueprint $table) {
            $table->foreignId('program_level_id')
                ->nullable()
                ->index()
                ->constrained('program_levels')
                ->restrictOnDelete();
            $table->foreignId('program_type_id')
                ->nullable()
                ->index()
                ->constrained('program_types')
                ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('programs', function (Blueprint $table) {
            $table->dropForeign(['program_type_id']);
            $table->dropForeign(['program_level_id']);
        });

        Schema::table('programs', function (Blueprint $table) {
            $table->dropIndex(['program_type_id']);
            $table->dropIndex(['program_level_id']);
        });

        Schema::table('programs', function (Blueprint $table) {
            $table->dropColumn([
                'program_type_id',
                'program_level_id',
            ]);
        });
    }
};
