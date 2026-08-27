<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('program_lessons', function (Blueprint $table): void {
            $table->string('content_kind', 32)->default('INFORMATION')->after('content_type');
            $table->string('external_url', 2048)->nullable()->after('content_url');
            $table->foreignId('media_asset_id')
                ->nullable()
                ->after('external_url')
                ->constrained()
                ->restrictOnDelete();
            $table->index(['media_asset_id', 'is_published'], 'program_lessons_media_index');
        });
    }

    public function down(): void
    {
        Schema::table('program_lessons', function (Blueprint $table): void {
            $table->dropIndex('program_lessons_media_index');
            $table->dropConstrainedForeignId('media_asset_id');
            $table->dropColumn(['content_kind', 'external_url']);
        });
    }
};
