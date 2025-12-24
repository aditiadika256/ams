<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('finance_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('reference_number')->unique();
            $table->string('type'); // income, expense
            $table->string('category'); // salary, purchase, sales, etc.
            $table->decimal('amount', 15, 2);
            $table->text('description')->nullable();
            $table->date('transaction_date');
            $table->string('status')->default('completed'); // pending, completed, cancelled
            $table->string('payment_method')->nullable();
            $table->string('attachment_url')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete(); // created by or related user
            $table->foreignId('related_id')->nullable(); // Polymorphic relation ID (optional)
            $table->string('related_type')->nullable(); // Polymorphic relation Type (optional)
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('finance_invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique();
            $table->foreignId('user_id')->constrained('users'); // Billed to
            $table->date('issue_date');
            $table->date('due_date');
            $table->string('status')->default('draft'); // draft, sent, paid, overdue, cancelled
            $table->decimal('subtotal', 15, 2);
            $table->decimal('tax', 15, 2)->default(0);
            $table->decimal('total_amount', 15, 2);
            $table->json('items'); // Array of {description, quantity, unit_price, total}
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('finance_invoices');
        Schema::dropIfExists('finance_transactions');
    }
};
