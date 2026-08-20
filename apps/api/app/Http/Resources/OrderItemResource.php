<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class OrderItemResource extends BaseResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'program_id' => $this->program_id,
            'program_batch_id' => $this->program_batch_id,
            'program_name' => $this->program_name,
            'program_slug' => $this->program_slug,
            'batch_name' => $this->batch_name,
            'batch_code' => $this->batch_code,
            'unit_price' => $this->unit_price,
            'currency' => $this->currency,
            'quantity' => $this->quantity,
            'snapshot' => $this->snapshot,
        ];
    }

    public function with(Request $request): array
    {
        return [];
    }
}
