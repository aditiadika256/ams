<?php

namespace App\Http\Requests\Admin;

use App\Enums\ComponentHandlerTemplate;
use App\Http\Requests\BaseFormRequest;
use App\Models\ComponentDefinition;
use App\Support\Components\ComponentHandlerRegistry;
use Illuminate\Validation\Rule;

class ComponentDefinitionStoreRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', ComponentDefinition::class) ?? false;
    }

    public function rules(): array
    {
        $template = $this->string('handler_template')->toString();
        $native = $template === ComponentHandlerTemplate::Native->value;

        return [
            'code' => [
                'required', 'string', 'max:80', 'lowercase', 'alpha_dash:ascii',
                Rule::unique(ComponentDefinition::class, 'code'),
            ],
            'name' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:2000'],
            'handler_template' => ['required', Rule::enum(ComponentHandlerTemplate::class)],
            'handler_key' => [
                Rule::requiredIf($native),
                Rule::prohibitedIf(! $native),
                'nullable', 'string', 'max:80',
                Rule::in(app(ComponentHandlerRegistry::class)->nativeKeys()),
                Rule::unique(ComponentDefinition::class, 'handler_key'),
            ],
            'icon' => ['nullable', 'string', 'max:80', 'alpha_dash:ascii'],
            'config_schema' => ['nullable', 'array'],
            'sort_order' => ['sometimes', 'integer', 'min:0', 'max:65535'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('code')) {
            $this->merge([
                'code' => str($this->input('code'))->trim()->lower()->slug('_')->toString(),
            ]);
        }
    }
}
