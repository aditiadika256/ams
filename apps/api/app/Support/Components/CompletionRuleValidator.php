<?php

namespace App\Support\Components;

use App\Exceptions\ProgramCompositionException;

class CompletionRuleValidator
{
    private const METRICS = [
        'material' => ['completed_percent'],
        'assessment' => ['submitted_count', 'best_score'],
    ];

    public function validate(?array $rule): void
    {
        if ($rule === null) {
            return;
        }

        if (array_diff(array_keys($rule), ['version', 'all']) !== []) {
            $this->invalid('Completion rule memiliki field yang tidak didukung.');
        }

        $requirements = $rule['all'] ?? null;

        if (($rule['version'] ?? null) !== 1 || ! is_array($requirements) || $requirements === [] || count($requirements) > 10) {
            $this->invalid('Completion rule harus memiliki requirement all versi 1.');
        }

        foreach ($requirements as $requirement) {
            if (is_array($requirement)
                && array_diff(array_keys($requirement), ['component', 'metric', 'operator', 'value']) !== []) {
                $this->invalid('Completion rule memiliki field yang tidak didukung.');
            }

            if (! is_array($requirement)
                || ! isset($requirement['component'], $requirement['metric'], $requirement['operator'], $requirement['value'])
                || ! in_array($requirement['metric'], self::METRICS[$requirement['component']] ?? [], true)
                || $requirement['operator'] !== '>='
                || ! is_numeric($requirement['value'])) {
                $this->invalid('Completion rule tidak didukung oleh activity projection.');
            }

            $value = (float) $requirement['value'];
            $percentMetric = in_array($requirement['metric'], ['completed_percent', 'best_score'], true);

            if ($value < 0 || ($percentMetric && $value > 100) || (! $percentMetric && $value < 1)) {
                $this->invalid('Nilai completion rule berada di luar rentang yang didukung.');
            }
        }
    }

    private function invalid(string $message): never
    {
        throw new ProgramCompositionException('COMPLETION_RULE_INVALID', $message);
    }
}
