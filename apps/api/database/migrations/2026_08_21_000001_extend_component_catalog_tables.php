<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('component_definitions', function (Blueprint $table): void {
            $table->string('handler_template', 32)->default('NATIVE')->after('description');
            $table->string('handler_key', 80)->nullable()->after('handler_template');
            $table->string('icon', 80)->nullable()->after('handler_key');
            $table->boolean('is_system')->default(false)->after('config_schema');
            $table->foreignId('created_by')->nullable()->index()->after('sort_order')->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->index()->after('created_by')->constrained('users')->nullOnDelete();
            $table->softDeletes();
            $table->index(
                ['deleted_at', 'is_available', 'sort_order', 'id'],
                'component_definitions_catalog_index',
            );
            $table->index(['handler_template', 'handler_key'], 'component_definitions_handler_index');
        });

        Schema::table('program_components', function (Blueprint $table): void {
            $table->softDeletes();
            $table->index(
                ['program_id', 'deleted_at', 'is_enabled', 'sort_order', 'id'],
                'program_components_active_index',
            );
            $table->index(
                ['component_definition_id', 'deleted_at'],
                'program_components_definition_index',
            );
        });
    }

    public function down(): void
    {
        Schema::table('program_components', function (Blueprint $table): void {
            $table->dropIndex('program_components_definition_index');
            $table->dropIndex('program_components_active_index');
            $table->dropSoftDeletes();
        });

        Schema::table('component_definitions', function (Blueprint $table): void {
            $table->dropIndex('component_definitions_handler_index');
            $table->dropIndex('component_definitions_catalog_index');
            $table->dropConstrainedForeignId('updated_by');
            $table->dropConstrainedForeignId('created_by');
            $table->dropSoftDeletes();
            $table->dropColumn(['handler_template', 'handler_key', 'icon', 'is_system']);
        });
    }
};
