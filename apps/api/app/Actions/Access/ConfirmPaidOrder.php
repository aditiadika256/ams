<?php

namespace App\Actions\Access;

use App\Data\AccessGrantData;
use App\Enums\AccessSource;
use App\Exceptions\DomainConflictException;
use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ConfirmPaidOrder
{
    public function __construct(
        private readonly GrantProgramAccess $grant,
        private readonly GrantCollectionAccesses $grantCollection,
    ) {}

    public function handle(Order $order, string $grossAmount): Order
    {
        return DB::transaction(function () use ($order, $grossAmount): Order {
            $order = Order::query()->lockForUpdate()->findOrFail($order->id);

            if ($this->normalizeMoney($order->total) !== $this->normalizeMoney($grossAmount)) {
                throw new DomainConflictException(
                    'PAYMENT_AMOUNT_MISMATCH',
                    'Nominal callback tidak sama dengan total Order.',
                    ['order_id' => $order->id],
                );
            }

            $order->load(['items.program.outgoingRelations']);
            $correlationId = (string) Str::uuid();

            foreach ($order->items as $item) {
                $access = $this->grant->handle(new AccessGrantData(
                    userId: $order->user_id,
                    programId: $item->program_id,
                    batchId: $item->program_batch_id,
                    source: AccessSource::Payment,
                    sourceId: (string) $order->id,
                    grantKey: "payment:order:{$order->id}:item:{$item->id}",
                    metadata: ['order_item_id' => $item->id],
                    correlationId: $correlationId,
                ), null, 'Pembayaran Order terkonfirmasi.');

                if ($item->program->outgoingRelations->isNotEmpty()) {
                    $this->grantCollection->handle($access, null, 'Grant child dari pembelian collection.');
                }
            }

            if ($order->status !== 'paid') {
                $order->update(['status' => 'paid', 'paid_at' => now()]);
            }

            return $order->load(['items.program', 'items.batch']);
        });
    }

    public function mark(Order $order, string $status): Order
    {
        return DB::transaction(function () use ($order, $status): Order {
            $order = Order::query()->lockForUpdate()->findOrFail($order->id);

            if ($order->status !== 'paid') {
                $order->update(['status' => $status]);
            }

            return $order;
        });
    }

    private function normalizeMoney(string $amount): string
    {
        [$whole, $fraction] = array_pad(explode('.', $amount, 2), 2, '0');

        return ltrim($whole, '0').'.'.substr(str_pad($fraction, 2, '0'), 0, 2);
    }
}
