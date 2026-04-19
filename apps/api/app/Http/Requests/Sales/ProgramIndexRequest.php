<?php

namespace App\Http\Requests\Sales;

use App\Http\Requests\BaseFormRequest;

class ProgramIndexRequest extends BaseFormRequest
{
    protected function prepareForValidation(): void
    {
        if ($this->has('active')) {
            $active = $this->input('active');
            if ($active === 'true') {
                $this->merge(['active' => true]);
            } elseif ($active === 'false') {
                $this->merge(['active' => false]);
            }
        }
    }

    public function rules(): array
    {
        return [
            'level' => ['sometimes', 'string', 'in:sd,smp,sma,cpns'],
            'type' => ['sometimes', 'string', 'in:tryout,bimbel'],
            'active' => ['sometimes', 'boolean'],
            'search' => ['sometimes', 'string', 'max:255'],
            'sort_by' => ['sometimes', 'string', 'in:name,price,created_at'],
            'sort_dir' => ['sometimes', 'string', 'in:asc,desc'],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ];
    }
}

