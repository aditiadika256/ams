<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Point Wallets — one per user
        Schema::create('point_wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->unsignedInteger('balance')->default(0);
            $table->unsignedInteger('total_earned')->default(0);
            $table->unsignedInteger('total_spent')->default(0);
            $table->timestamps();
        });

        // Point Transactions — immutable ledger
        Schema::create('point_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('point_wallet_id')->constrained()->cascadeOnDelete();
            $table->string('type', 10); // earn, spend, expire
            $table->unsignedInteger('amount');
            $table->unsignedInteger('balance_after');
            $table->string('source_type', 50)->nullable(); // cashback, cbt_achievement, attendance_perfect, topup, store_purchase
            $table->string('source_id')->nullable();
            $table->string('description');
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->index(['point_wallet_id', 'created_at']);
            $table->index('source_type');
        });

        // Store Products — catalog of physical goods
        Schema::create('store_products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('image_url', 500)->nullable();
            $table->unsignedInteger('price_points')->default(0);
            $table->decimal('price_cash', 12, 2)->nullable();
            $table->unsignedInteger('stock')->default(0);
            $table->boolean('is_active')->default(true);
            $table->string('category', 30)->nullable(); // book, merchandise, module
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['is_active', 'category']);
        });

        // Store Orders
        Schema::create('store_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('order_number', 30)->unique();
            $table->string('status', 20)->default('pending'); // pending, confirmed, shipped, completed, cancelled
            $table->unsignedInteger('total_points')->default(0);
            $table->decimal('total_cash', 12, 2)->default(0);
            $table->string('payment_method', 10)->default('points'); // points, cash, mixed
            $table->string('shipping_name');
            $table->string('shipping_phone', 30);
            $table->text('shipping_address');
            $table->string('shipping_city', 100)->nullable();
            $table->string('shipping_postal_code', 10)->nullable();
            $table->string('tracking_number', 100)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
        });

        // Store Order Items
        Schema::create('store_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('store_product_id')->constrained()->restrictOnDelete();
            $table->string('product_name'); // snapshot
            $table->unsignedInteger('quantity')->default(1);
            $table->unsignedInteger('points_each')->default(0);
            $table->decimal('cash_each', 12, 2)->default(0);
            $table->timestamps();
        });

        // Add point config to branches
        if (Schema::hasTable('branches')) {
            Schema::table('branches', function (Blueprint $table) {
                $table->decimal('point_to_cash_ratio', 8, 2)->default(100)->after('name'); // 1 poin = Rp100
                $table->unsignedInteger('point_expiry_days')->nullable()->default(365)->after('point_to_cash_ratio');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('store_order_items');
        Schema::dropIfExists('store_orders');
        Schema::dropIfExists('point_transactions');
        Schema::dropIfExists('point_wallets');
        Schema::dropIfExists('store_products');

        if (Schema::hasTable('branches') && Schema::hasColumn('branches', 'point_to_cash_ratio')) {
            Schema::table('branches', function (Blueprint $table) {
                $table->dropColumn(['point_to_cash_ratio', 'point_expiry_days']);
            });
        }
    }
};
