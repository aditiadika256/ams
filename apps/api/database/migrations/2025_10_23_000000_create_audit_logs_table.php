<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->json('actor_snapshot')->nullable();
            $table->string('action', 100);
            $table->string('entity');
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->uuid('correlation_id');
            $table->text('reason')->nullable();
            $table->json('before_state')->nullable();
            $table->json('after_state')->nullable();
            $table->json('payload')->nullable();
            $table->timestamps();

            $table->index(['entity', 'entity_id', 'created_at']);
            $table->index(['correlation_id', 'created_at']);
            $table->index(['action', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
