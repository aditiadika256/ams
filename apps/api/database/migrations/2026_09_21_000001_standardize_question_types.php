<?php

use App\Enums\QuestionType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            $table->decimal('score_weight', 5, 2)->default(1.00)->after('difficulty');
            $table->text('explanation')->nullable()->after('score_weight');
            $table->index('type');
        });

        // Normalize legacy type values to standard 5-type enum
        $mapping = [
            'mcq'    => QuestionType::SingleChoice->value,
            'single' => QuestionType::SingleChoice->value,
            'multi'  => QuestionType::MultipleChoice->value,
            'essay'  => QuestionType::ShortAnswer->value,
        ];

        foreach ($mapping as $old => $new) {
            DB::table('questions')->where('type', $old)->update(['type' => $new]);
        }
    }

    public function down(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            $table->dropIndex(['type']);
            $table->dropColumn(['score_weight', 'explanation']);
        });
    }
};
