<?php

namespace App\Support\Components;

use App\Exceptions\ProgramCompositionException;
use App\Models\Program;
use Illuminate\Support\Collection;
use JsonException;

class ComponentConfigValidator
{
    private const MAX_CONFIG_BYTES = 16 * 1024;

    private const MAX_CONFIG_DEPTH = 8;

    private const MAX_CONFIG_NODES = 500;

    public function validate(Program $program, Collection $definitions, array $components): void
    {
        $definitionsById = $definitions->keyBy('id');
        $enabledCodes = collect($components)
            ->filter(fn (array $component): bool => $component['is_enabled'] ?? true)
            ->map(fn (array $component): ?string => $definitionsById->get($component['component_definition_id'])?->code)
            ->filter()
            ->values();

        foreach ($components as $component) {
            $definition = $definitionsById->get($component['component_definition_id']);
            $configuration = $component['configuration'] ?? [];

            $this->validateSizeAndShape($definition?->code ?? 'unknown', $configuration);

            if (! ($component['is_enabled'] ?? true) || $definition === null) {
                continue;
            }

            $this->validateDependencies($program, $definition->code, $enabledCodes, $configuration);
        }
    }

    private function validateSizeAndShape(string $code, array $configuration): void
    {
        try {
            $json = json_encode($configuration, JSON_THROW_ON_ERROR);
        } catch (JsonException) {
            throw new ProgramCompositionException(
                'COMPONENT_CONFIG_INVALID',
                'Konfigurasi komponen tidak dapat diproses.',
                ['component' => $code],
            );
        }

        if (strlen($json) > self::MAX_CONFIG_BYTES) {
            throw new ProgramCompositionException(
                'COMPONENT_CONFIG_TOO_LARGE',
                'Konfigurasi komponen melebihi batas 16 KB.',
                ['component' => $code, 'max_bytes' => self::MAX_CONFIG_BYTES],
            );
        }

        $nodes = 0;
        $this->walk($configuration, 1, $nodes, $code);
    }

    private function walk(array $value, int $depth, int &$nodes, string $code): void
    {
        if ($depth > self::MAX_CONFIG_DEPTH) {
            throw new ProgramCompositionException(
                'COMPONENT_CONFIG_INVALID',
                'Konfigurasi komponen terlalu dalam.',
                ['component' => $code, 'max_depth' => self::MAX_CONFIG_DEPTH],
            );
        }

        foreach ($value as $item) {
            $nodes++;

            if ($nodes > self::MAX_CONFIG_NODES) {
                throw new ProgramCompositionException(
                    'COMPONENT_CONFIG_INVALID',
                    'Konfigurasi komponen memiliki terlalu banyak elemen.',
                    ['component' => $code, 'max_nodes' => self::MAX_CONFIG_NODES],
                );
            }

            if (is_array($item)) {
                $this->walk($item, $depth + 1, $nodes, $code);
            }
        }
    }

    private function validateDependencies(
        Program $program,
        string $code,
        Collection $enabledCodes,
        array $configuration,
    ): void {
        $hasSessions = null;

        $valid = match ($code) {
            'qr_attendance' => $enabledCodes->contains('attendance'),
            'attendance' => $enabledCodes->contains('meeting') || ($hasSessions ??= $this->hasSessions($program)),
            'certificate' => ! empty($program->completion_rule),
            'shipping' => ($configuration['requires_address'] ?? false) === true
                && filled($configuration['fulfillment_mode'] ?? null),
            'consultation' => $hasSessions ??= $this->hasSessions($program),
            default => true,
        };

        if (! $valid) {
            throw new ProgramCompositionException(
                'COMPONENT_DEPENDENCY_INVALID',
                'Dependency komponen belum terpenuhi.',
                ['component' => $code],
            );
        }
    }

    private function hasSessions(Program $program): bool
    {
        return $program->batches()->whereHas('sessions')->exists();
    }
}
