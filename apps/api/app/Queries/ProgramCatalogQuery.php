<?php

namespace App\Queries;

use App\Enums\ProgramVisibility;
use App\Models\Program;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class ProgramCatalogQuery
{
    private const COLUMNS = [
        'id', 'name', 'slug', 'short_description', 'description', 'thumbnail_url',
        'cover_url', 'base_price', 'currency', 'visibility', 'status', 'published_at',
    ];

    public function paginate(array $filters): LengthAwarePaginator
    {
        return $this->baseQuery()
            ->where('visibility', ProgramVisibility::Public->value)
            ->when($filters['search'] ?? null, fn (Builder $query, string $search) => $query->where(
                fn (Builder $searchQuery) => $searchQuery
                    ->whereLike('name', "%{$search}%")
                    ->orWhereLike('short_description', "%{$search}%")
            ))
            ->when($filters['tag'] ?? null, fn (Builder $query, string $tag) => $query->whereHas(
                'tags',
                fn (Builder $tags) => $tags->where('code', $tag)
            ))
            ->when($filters['component'] ?? null, fn (Builder $query, string $component) => $query->whereHas(
                'components',
                fn (Builder $components) => $components->enabled()->whereHas(
                    'definition',
                    fn (Builder $definitions) => $definitions->available()->where('code', $component)
                )
            ))
            ->when(isset($filters['min_price']), fn (Builder $query) => $query->where('base_price', '>=', $filters['min_price']))
            ->when(isset($filters['max_price']), fn (Builder $query) => $query->where('base_price', '<=', $filters['max_price']))
            ->orderBy($filters['sort_by'] ?? 'published_at', $filters['sort_dir'] ?? 'desc')
            ->orderByDesc('id')
            ->paginate($filters['per_page'] ?? 15);
    }

    public function findVisible(string $identifier): Program
    {
        return $this->baseQuery()
            ->whereIn('visibility', [
                ProgramVisibility::Public->value,
                ProgramVisibility::Unlisted->value,
            ])
            ->where(fn (Builder $query) => $query
                ->where('slug', $identifier)
                ->when(ctype_digit($identifier), fn (Builder $byId) => $byId->orWhereKey((int) $identifier)))
            ->firstOrFail();
    }

    private function baseQuery(): Builder
    {
        return Program::query()
            ->select(self::COLUMNS)
            ->published()
            ->whereNull('archived_at')
            ->with([
                'tags' => fn ($query) => $query
                    ->select(['tags.id', 'tags.code', 'tags.name'])
                    ->orderBy('sort_order')
                    ->orderBy('id'),
                'components' => fn ($query) => $query
                    ->select([
                        'id', 'program_id', 'component_definition_id', 'label',
                        'sort_order', 'is_enabled',
                    ])
                    ->enabled()
                    ->whereHas('definition', fn (Builder $definitions) => $definitions->available())
                    ->with('definition:id,code,name')
                    ->orderBy('sort_order')
                    ->orderBy('id'),
            ]);
    }
}
