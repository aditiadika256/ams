<?php

namespace App\Actions\Orders;

use App\Enums\BatchStatus;
use App\Enums\ProgramStatus;
use App\Enums\ProgramVisibility;
use App\Exceptions\DomainValidationException;
use App\Models\Order;
use App\Models\Program;
use App\Models\ProgramBatch;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CreateOrder
{
    public function handle(array $data, User $user): Order
    {
        $inputs = collect($data['programs']);
        $programs = Program::query()
            ->whereIn('id', $inputs->pluck('id'))
            ->where('status', ProgramStatus::Published->value)
            ->whereIn('visibility', [ProgramVisibility::Public->value, ProgramVisibility::Unlisted->value])
            ->whereNull('archived_at')
            ->get()
            ->keyBy('id');

        if ($programs->count() !== $inputs->pluck('id')->unique()->count()) {
            throw new DomainValidationException(
                'PROGRAM_NOT_ACQUIRABLE',
                'Satu atau lebih Program tidak tersedia untuk checkout.',
                ['field' => 'programs'],
            );
        }

        $batchIds = $inputs->pluck('batch_id')->filter()->unique()->values();
        $batches = ProgramBatch::query()
            ->whereIn('id', $batchIds)
            ->where('status', BatchStatus::Open->value)
            ->get()
            ->keyBy('id');

        if ($batches->count() !== $batchIds->count()) {
            throw new DomainValidationException(
                'BATCH_NOT_ACQUIRABLE',
                'Satu atau lebih Batch tidak tersedia untuk checkout.',
                ['field' => 'programs'],
            );
        }

        $payload = $this->itemsPayload($inputs, $programs, $batches);

        return DB::transaction(function () use ($data, $user, $payload): Order {
            $order = Order::query()->create([
                'user_id' => $user->id,
                'status' => 'pending',
                'total' => $payload['total'],
                'currency' => 'IDR',
                'payment_provider' => $data['payment_provider'] ?? null,
                'payment_reference' => 'ORD-'.Str::upper((string) Str::ulid()),
                'meta' => $data['meta'] ?? null,
            ]);

            $order->items()->createMany($payload['items']);

            return $order->load(['items.program', 'items.batch']);
        });
    }

    private function itemsPayload(Collection $inputs, Collection $programs, Collection $batches): array
    {
        $totalMinor = 0;
        $items = [];

        foreach ($inputs as $input) {
            $program = $programs->get($input['id']);
            $batch = isset($input['batch_id']) ? $batches->get($input['batch_id']) : null;

            if ($batch !== null && $batch->program_id !== $program->id) {
                throw new DomainValidationException(
                    'BATCH_PROGRAM_MISMATCH',
                    'Batch bukan milik Program yang dipilih.',
                    ['field' => 'programs'],
                );
            }

            $unitPrice = $batch?->price_override ?? $program->base_price;
            $quantity = $input['quantity'] ?? 1;
            $totalMinor += $this->toMinor($unitPrice) * $quantity;
            $items[] = [
                'program_id' => $program->id,
                'program_batch_id' => $batch?->id,
                'program_name' => $program->name,
                'program_slug' => $program->slug,
                'batch_name' => $batch?->name,
                'batch_code' => $batch?->code,
                'unit_price' => $unitPrice,
                'currency' => $program->currency,
                'quantity' => $quantity,
                'snapshot' => [
                    'program' => ['name' => $program->name, 'slug' => $program->slug],
                    'batch' => $batch === null ? null : ['name' => $batch->name, 'code' => $batch->code],
                ],
            ];
        }

        return ['total' => $this->fromMinor($totalMinor), 'items' => $items];
    }

    private function toMinor(string $amount): int
    {
        [$whole, $fraction] = array_pad(explode('.', $amount, 2), 2, '0');

        return ((int) $whole * 100) + (int) substr(str_pad($fraction, 2, '0'), 0, 2);
    }

    private function fromMinor(int $amount): string
    {
        return sprintf('%d.%02d', intdiv($amount, 100), $amount % 100);
    }
}
