<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class OrderResource extends BaseResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'status' => $this->status,
            'total' => $this->total,
            'currency' => $this->currency,
            'payment_provider' => $this->payment_provider,
            'payment_reference' => $this->payment_reference,
            'snap_token' => $this->snap_token,
            'meta' => $this->meta,
            'paid_at' => $this->paid_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
        ];
    }

    public function with(Request $request): array
    {
        return [];
    }
}
