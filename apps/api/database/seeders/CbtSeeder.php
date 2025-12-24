<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\QuestionBank;
use App\Models\Question;
use App\Models\ExamPackage;
use App\Models\ExamSection;

class CbtSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Question Bank
        $bank = QuestionBank::create([
            'name' => 'Bank Soal SNBT 2025',
            'level' => 'sma',
            'subject' => 'Penalaran Umum',
            'classes' => ['12'],
        ]);

        // 2. Create Questions
        for ($i = 1; $i <= 5; $i++) {
            Question::create([
                'bank_id' => $bank->id,
                'type' => 'mcq',
                'stem' => "Ini adalah soal contoh nomor $i. Berapakah hasil dari 1 + 1?",
                'options' => [
                    'A' => '1',
                    'B' => '2',
                    'C' => '3',
                    'D' => '4',
                    'E' => '5'
                ],
                'answer_key' => 'B',
                'difficulty' => 'medium',
            ]);
        }

        // 3. Create Exam Package
        $package = ExamPackage::create([
            'name' => 'Tryout SNBT 2025 - Paket Demo',
            'level' => 'sma',
            'duration_minutes' => 120,
            'randomize' => true,
            'show_result_mode' => 'after',
        ]);

        // 4. Create Exam Section
        ExamSection::create([
            'package_id' => $package->id,
            'bank_id' => $bank->id,
            'subject' => 'Penalaran Umum',
            'num_questions' => 5,
            'difficulty_mix' => ['medium' => 5],
        ]);
    }
}
