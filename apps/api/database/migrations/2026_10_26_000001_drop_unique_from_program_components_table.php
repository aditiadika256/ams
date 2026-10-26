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
        Schema::table('program_components', function (Blueprint $table): void {
            // Drop unique constraint to support multiple instances of the same component definition (e.g. Materi 1, Materi 2)
            $table->dropUnique(['program_id', 'component_definition_id']);

            // Replace with non-unique index for fast lookup
            $table->index(['program_id', 'component_definition_id'], 'program_components_prog_def_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('program_components', function (Blueprint $table): void {
            $table->dropIndex('program_components_prog_def_idx');
            $table->unique(['program_id', 'component_definition_id']);
        });
    }
};
