<?php

namespace App\Queries;

use App\Models\Program;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class AdminProgramQuery
{
    public function paginate(array $filters): LengthAwarePaginator
    {
        return $this->baseQuery()
            ->when($filters['search'] ?? null, fn (Builder $query, string $search) => $query->where(
                fn (Builder $searchQuery) => $searchQuery
                    ->whereLike('name', "%{$search}%")
                    ->orWhereLike('slug', "%{$search}%")
            ))
            ->when($filters['status'] ?? null, fn (Builder $query, string $status) => $query->where('status', $status))
            ->when($filters['visibility'] ?? null, fn (Builder $query, string $visibility) => $query->where('visibility', $visibility))
            ->when($filters['tag'] ?? null, fn (Builder $query, string $tag) => $query->whereHas(
                'tags',
                fn (Builder $tags) => $tags->where('code', $tag)
            ))
            ->when($filters['component'] ?? null, fn (Builder $query, string $component) => $query->whereHas(
                'components.definition',
                fn (Builder $definitions) => $definitions->where('code', $component)
            ))
            ->orderBy($filters['sort_by'] ?? 'updated_at', $filters['sort_dir'] ?? 'desc')
            ->orderByDesc('id')
            ->paginate($filters['per_page'] ?? 15);
    }

    public function load(Program $program): Program
    {
        return $program->load($this->relations());
    }

    private function baseQuery(): Builder
    {
        return Program::query()->with($this->relations());
    }

    private function relations(): array
    {
        return [
            'tags:id,code,name,sort_order,is_active,archived_at',
            'components' => fn ($query) => $query
                ->with('definition:id,code,name,handler_template,handler_key,icon,is_available')
                ->orderBy('sort_order')
                ->orderBy('id'),
            'children:id,name,slug',
        ];
    }
}
