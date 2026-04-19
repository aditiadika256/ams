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
            'price' => $this->price,
            'quantity' => $this->quantity,
            'program' => $this->whenLoaded('program', function () use ($request) {
                return new ProgramResource($this->program);
            }),
        ];
    }

    public function with(Request $request): array
    {
        return [];
    }
}

