<?php

use App\Enums\QuestionType;
use App\Models\Question;
use App\Support\CBT\QuestionScorer;

beforeEach(function () {
    $this->scorer = new QuestionScorer();
});

it('scores single choice correctly', function () {
    $question = new Question([
        'type' => QuestionType::SingleChoice,
        'answer_key' => ['correct' => 'B'],
        'score_weight' => 10,
    ]);

    // Correct answer
    $result = $this->scorer->score($question, 'B');
    expect($result['is_correct'])->toBeTrue()
        ->and($result['score'])->toBe(10.0);

    // Case insensitive match
    $resultCase = $this->scorer->score($question, 'b');
    expect($resultCase['is_correct'])->toBeTrue()
        ->and($resultCase['score'])->toBe(10.0);

    // Wrong answer
    $resultWrong = $this->scorer->score($question, 'C');
    expect($resultWrong['is_correct'])->toBeFalse()
        ->and($resultWrong['score'])->toBe(0);

    // Null answer
    $resultNull = $this->scorer->score($question, null);
    expect($resultNull['is_correct'])->toBeFalse()
        ->and($resultNull['score'])->toBe(0);
});

it('scores multiple choice with partial and full scoring', function () {
    $question = new Question([
        'type' => QuestionType::MultipleChoice,
        'answer_key' => ['correct' => ['A', 'C']],
        'score_weight' => 10,
    ]);

    // Full match
    $resultFull = $this->scorer->score($question, ['A', 'C']);
    expect($resultFull['is_correct'])->toBeTrue()
        ->and($resultFull['score'])->toBe(10.0);

    // Partial match (1 out of 2 correct)
    $resultPartial = $this->scorer->score($question, ['A']);
    expect($resultPartial['is_correct'])->toBeFalse()
        ->and($resultPartial['score'])->toBe(5.0);

    // Wrong picks only
    $resultWrong = $this->scorer->score($question, ['B', 'D']);
    expect($resultWrong['is_correct'])->toBeFalse()
        ->and($resultWrong['score'])->toBe(0.0);
});

it('scores true/false multi-statement correctly', function () {
    $question = new Question([
        'type' => QuestionType::TrueFalse,
        'answer_key' => [
            'stmt_1' => true,
            'stmt_2' => false,
            'stmt_3' => true,
            'stmt_4' => false,
        ],
        'score_weight' => 20,
    ]);

    // All correct
    $resultAll = $this->scorer->score($question, [
        'stmt_1' => true,
        'stmt_2' => false,
        'stmt_3' => true,
        'stmt_4' => false,
    ]);
    expect($resultAll['is_correct'])->toBeTrue()
        ->and($resultAll['score'])->toBe(20.0);

    // Half correct (2 out of 4)
    $resultHalf = $this->scorer->score($question, [
        'stmt_1' => true,
        'stmt_2' => true, // wrong
        'stmt_3' => true,
        'stmt_4' => true, // wrong
    ]);
    expect($resultHalf['is_correct'])->toBeFalse()
        ->and($resultHalf['score'])->toBe(10.0);
});

it('scores matching question correctly', function () {
    $question = new Question([
        'type' => QuestionType::Matching,
        'answer_key' => [
            'q1' => 'ans1',
            'q2' => 'ans2',
        ],
        'score_weight' => 10,
    ]);

    // Full match
    $resultFull = $this->scorer->score($question, [
        'q1' => 'ans1',
        'q2' => 'ans2',
    ]);
    expect($resultFull['is_correct'])->toBeTrue()
        ->and($resultFull['score'])->toBe(10.0);

    // Partial match (1 out of 2)
    $resultPartial = $this->scorer->score($question, [
        'q1' => 'ans1',
        'q2' => 'wrong',
    ]);
    expect($resultPartial['is_correct'])->toBeFalse()
        ->and($resultPartial['score'])->toBe(5.0);
});

it('scores short answer with case-insensitivity and trim', function () {
    $question = new Question([
        'type' => QuestionType::ShortAnswer,
        'answer_key' => [
            'keywords' => ['Jakarta', 'DKI Jakarta', 'Ibukota Jakarta'],
        ],
        'score_weight' => 15,
    ]);

    // Exact keyword
    $result1 = $this->scorer->score($question, 'Jakarta');
    expect($result1['is_correct'])->toBeTrue()
        ->and($result1['score'])->toBe(15.0);

    // Uppercase and extra whitespace
    $result2 = $this->scorer->score($question, '  DKI JAKARTA   ');
    expect($result2['is_correct'])->toBeTrue()
        ->and($result2['score'])->toBe(15.0);

    // Wrong answer
    $result3 = $this->scorer->score($question, 'Bandung');
    expect($result3['is_correct'])->toBeFalse()
        ->and($result3['score'])->toBe(0);
});
