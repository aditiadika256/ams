<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('programs', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('short_description', 500)->nullable();
            $table->text('description')->nullable();
            $table->string('thumbnail_url', 2048)->nullable();
            $table->string('cover_url', 2048)->nullable();
            $table->decimal('base_price', 15, 2)->default(0);
            $table->char('currency', 3)->default('IDR');
            $table->string('visibility', 20)->default('PUBLIC');
            $table->string('status', 20)->default('DRAFT');
            $table->json('completion_rule')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();
            $table->index(['status', 'visibility', 'published_at']);
            $table->index(['archived_at', 'updated_at']);
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement(
                'ALTER TABLE programs ADD CONSTRAINT programs_base_price_non_negative CHECK (base_price >= 0)'
            );
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('programs');
    }
};
