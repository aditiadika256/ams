<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('program_components') && ! Schema::hasColumn('program_components', 'deleted_at')) {
            Schema::table('program_components', function (Blueprint $table): void {
                $table->softDeletes();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('program_components') && Schema::hasColumn('program_components', 'deleted_at')) {
            Schema::table('program_components', function (Blueprint $table): void {
                $table->dropSoftDeletes();
            });
        }
    }
};
