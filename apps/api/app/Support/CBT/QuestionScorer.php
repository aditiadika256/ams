<?php

namespace App\Support\CBT;

use App\Enums\QuestionType;
use App\Models\Question;

class QuestionScorer
{
    /**
     * Score a single answer against its question.
     *
     * @return array{is_correct: bool, score: float}
     */
    public function score(Question $question, mixed $userAnswer): array
    {
        if ($userAnswer === null) {
            return ['is_correct' => false, 'score' => 0];
        }

        $weight = (float) ($question->score_weight ?? 1);
        $key = $question->answer_key;

        return match ($question->type) {
            QuestionType::SingleChoice  => $this->scoreSingleChoice($key, $userAnswer, $weight),
            QuestionType::MultipleChoice => $this->scoreMultipleChoice($key, $userAnswer, $weight),
            QuestionType::TrueFalse     => $this->scoreTrueFalse($key, $userAnswer, $weight),
            QuestionType::Matching      => $this->scoreMatching($key, $userAnswer, $weight),
            QuestionType::ShortAnswer   => $this->scoreShortAnswer($key, $userAnswer, $weight),
        };
    }

    /** Exact single value match → full or zero. */
    private function scoreSingleChoice(mixed $key, mixed $answer, float $weight): array
    {
        // key: "B" or ["correct" => "B"]
        $correct = is_array($key) ? ($key['correct'] ?? $key[0] ?? null) : $key;
        $isCorrect = mb_strtoupper(trim((string) $answer)) === mb_strtoupper(trim((string) $correct));

        return ['is_correct' => $isCorrect, 'score' => $isCorrect ? $weight : 0];
    }

    /** Partial scoring: correct picks / total correct × weight. No penalty for wrong picks. */
    private function scoreMultipleChoice(mixed $key, mixed $answer, float $weight): array
    {
        $correctSet = collect(is_array($key) ? ($key['correct'] ?? $key) : [$key])
            ->map(fn ($v) => mb_strtoupper(trim((string) $v)));
        $userSet = collect(is_array($answer) ? $answer : [$answer])
            ->map(fn ($v) => mb_strtoupper(trim((string) $v)));

        $hits = $userSet->intersect($correctSet)->count();
        $total = $correctSet->count();

        // ponytail: no negative scoring, simpler mental model
        $ratio = $total > 0 ? $hits / $total : 0;
        $isCorrect = $ratio >= 1;

        return ['is_correct' => $isCorrect, 'score' => round($ratio * $weight, 2)];
    }

    /** Each statement checked independently → partial scoring. */
    private function scoreTrueFalse(mixed $key, mixed $answer, float $weight): array
    {
        // key: {"1": true, "2": false, ...}, answer: {"1": true, "2": true, ...}
        if (! is_array($key) || ! is_array($answer)) {
            return ['is_correct' => false, 'score' => 0];
        }

        $total = count($key);
        $hits = 0;
        foreach ($key as $k => $v) {
            if (isset($answer[$k]) && (bool) $answer[$k] === (bool) $v) {
                $hits++;
            }
        }

        $ratio = $total > 0 ? $hits / $total : 0;

        return ['is_correct' => $ratio >= 1, 'score' => round($ratio * $weight, 2)];
    }

    /** Correct pairs / total pairs × weight. */
    private function scoreMatching(mixed $key, mixed $answer, float $weight): array
    {
        // key: {"A": "1", "B": "2", ...}, answer same shape
        if (! is_array($key) || ! is_array($answer)) {
            return ['is_correct' => false, 'score' => 0];
        }

        $total = count($key);
        $hits = 0;
        foreach ($key as $k => $v) {
            if (isset($answer[$k]) && mb_strtoupper(trim((string) $answer[$k])) === mb_strtoupper(trim((string) $v))) {
                $hits++;
            }
        }

        $ratio = $total > 0 ? $hits / $total : 0;

        return ['is_correct' => $ratio >= 1, 'score' => round($ratio * $weight, 2)];
    }

    /** Case-insensitive trimmed keyword match. */
    private function scoreShortAnswer(mixed $key, mixed $answer, float $weight): array
    {
        // key: ["keywords" => ["jawaban1", "jawaban2"]] or a single string
        $acceptedAnswers = is_array($key) ? ($key['keywords'] ?? $key['accepted'] ?? (array) $key) : [$key];
        $normalized = mb_strtolower(trim((string) $answer));

        foreach ($acceptedAnswers as $accepted) {
            if (mb_strtolower(trim((string) $accepted)) === $normalized) {
                return ['is_correct' => true, 'score' => $weight];
            }
        }

        return ['is_correct' => false, 'score' => 0];
    }
}
