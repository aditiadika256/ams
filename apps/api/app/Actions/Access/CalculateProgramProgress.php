<?php

namespace App\Actions\Access;

use App\Models\ProgramAccess;
use App\Models\ProgramLesson;

class CalculateProgramProgress
{
    public function handle(ProgramAccess $access): ProgramAccess
    {
        $access->loadMissing('program.components.definition');
        $enabledCodes = $access->program->components
            ->filter(fn ($component): bool => $component->is_enabled && $component->definition->is_available)
            ->pluck('definition.code');
        $breakdown = [];

        if ($enabledCodes->contains('material')) {
            $total = ProgramLesson::query()
                ->where('is_published', true)
                ->whereHas('module', fn ($query) => $query
                    ->where('program_id', $access->program_id)
                    ->where('is_published', true))
                ->count();
            $completed = $access->activities()
                ->where('component_code', 'material')
                ->where('activity_type', 'lesson_completed')
                ->count();
            $breakdown['material'] = [
                'completed_count' => min($completed, $total),
                'total_count' => $total,
                'completed_percent' => $total === 0 ? 0 : round(min($completed, $total) * 100 / $total, 2),
            ];
        }

        if ($enabledCodes->contains('assessment')) {
            $component = $access->program->components->first(
                fn ($item): bool => $item->definition->code === 'assessment' && $item->is_enabled,
            );
            $packageIds = collect($component?->configuration['exam_package_ids'] ?? [])->map('intval')->unique();
            $activities = $access->activities()
                ->where('component_code', 'assessment')
                ->where('activity_type', 'assessment_submitted')
                ->get(['metadata']);
            $scoped = $activities->filter(fn ($activity): bool => $packageIds->contains((int) ($activity->metadata['package_id'] ?? 0)));
            $total = $packageIds->count();
            $completed = $scoped->count();
            $breakdown['assessment'] = [
                'submitted_count' => $completed,
                'total_count' => $total,
                'completed_percent' => $total === 0 ? 0 : round(min($completed, $total) * 100 / $total, 2),
                'best_score' => (float) ($scoped->max(fn ($activity) => $activity->metadata['score'] ?? 0) ?? 0),
            ];
        }

        $percentages = collect($breakdown)->pluck('completed_percent');
        $percent = $percentages->isEmpty() ? 0 : round((float) $percentages->average(), 2);
        $access->forceFill([
            'progress_percent' => $percent,
            'progress_breakdown' => $breakdown,
            'progress_calculated_at' => now(),
        ])->save();

        return $access;
    }
}
