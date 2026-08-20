<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class ProgramResource extends BaseResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'short_description' => $this->short_description,
            'description' => $this->description,
            'thumbnail_url' => $this->thumbnail_url,
            'cover_url' => $this->cover_url,
            'base_price' => $this->base_price,
            'currency' => $this->currency,
            'visibility' => $this->visibility->value,
            'status' => $this->status->value,
            'published_at' => $this->published_at?->toIso8601String(),
            'tags' => $this->whenLoaded('tags', fn () => $this->tags->map(fn ($tag): array => [
                'id' => $tag->id,
                'code' => $tag->code,
                'name' => $tag->name,
            ])->values()),
            'components' => $this->whenLoaded('components', fn () => $this->components->map(fn ($component): array => [
                'code' => $component->definition->code,
                'name' => $component->definition->name,
                'label' => $component->label,
                'sort_order' => $component->sort_order,
            ])->values()),
        ];
    }

    public function with(Request $request): array
    {
        return [];
    }
}
