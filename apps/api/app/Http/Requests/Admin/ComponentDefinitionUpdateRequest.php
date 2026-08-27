<?php

namespace App\Http\Requests\Admin;

use App\Enums\ComponentHandlerTemplate;
use App\Http\Requests\BaseFormRequest;
use App\Models\ComponentDefinition;
use App\Support\Components\ComponentHandlerRegistry;
use Illuminate\Validation\Rule;

class ComponentDefinitionUpdateRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('componentDefinition')) ?? false;
    }

    public function rules(): array
    {
        /** @var ComponentDefinition $definition */
        $definition = $this->route('componentDefinition');
        $template = $this->input('handler_template', $definition->handler_template->value);
        $native = $template === ComponentHandlerTemplate::Native->value;

        return [
            'code' => ['prohibited'],
            'name' => ['sometimes', 'required', 'string', 'max:120'],
            'description' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'handler_template' => ['sometimes', Rule::enum(ComponentHandlerTemplate::class)],
            'handler_key' => [
                Rule::requiredIf($native && $this->has('handler_template')),
                Rule::prohibitedIf(! $native),
                'nullable', 'string', 'max:80',
                Rule::in(app(ComponentHandlerRegistry::class)->nativeKeys()),
                Rule::unique(ComponentDefinition::class, 'handler_key')->ignore($definition->id),
            ],
            'icon' => ['sometimes', 'nullable', 'string', 'max:80', 'alpha_dash:ascii'],
            'config_schema' => ['sometimes', 'nullable', 'array'],
            'sort_order' => ['sometimes', 'integer', 'min:0', 'max:65535'],
        ];
    }
}
