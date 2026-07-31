<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class ProgramLevelResource extends BaseResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
            'row_status' => $this->row_status,
            'sort_order' => $this->sort_order,
        ];
    }

    public function with(Request $request): array
    {
        return [];
    }
}
