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
        if (Schema::hasTable('media_assets')) {
            Schema::table('media_assets', function (Blueprint $table): void {
                $table->foreignId('program_id')->nullable()->change();

                if (! Schema::hasColumn('media_assets', 'folder')) {
                    $table->string('folder', 100)->nullable()->default('general')->index();
                }

                if (! Schema::hasColumn('media_assets', 'created_by')) {
                    $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
                }

                if (! Schema::hasColumn('media_assets', 'updated_by')) {
                    $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('media_assets')) {
            Schema::table('media_assets', function (Blueprint $table): void {
                if (Schema::hasColumn('media_assets', 'folder')) {
                    $table->dropColumn('folder');
                }
                if (Schema::hasColumn('media_assets', 'created_by')) {
                    $table->dropForeign(['created_by']);
                    $table->dropColumn('created_by');
                }
                if (Schema::hasColumn('media_assets', 'updated_by')) {
                    $table->dropForeign(['updated_by']);
                    $table->dropColumn('updated_by');
                }
            });
        }
    }
};
