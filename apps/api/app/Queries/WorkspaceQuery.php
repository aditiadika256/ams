<?php

namespace App\Queries;

use App\Enums\AccessStatus;
use App\Enums\SessionStatus;
use App\Models\Program;
use App\Models\ProgramAccess;
use App\Models\ProgramSession;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class WorkspaceQuery
{
    private const ACCESS_COLUMNS = [
        'program_accesses.id', 'program_accesses.user_id', 'program_accesses.program_id',
        'program_accesses.program_batch_id', 'program_accesses.parent_program_access_id',
        'program_accesses.source_type', 'program_accesses.status', 'program_accesses.starts_at',
        'program_accesses.ends_at', 'program_accesses.activated_at', 'program_accesses.completed_at',
        'program_accesses.archived_at', 'program_accesses.last_accessed_at',
        'program_accesses.progress_percent', 'program_accesses.progress_breakdown',
        'program_accesses.progress_calculated_at',
        'program_accesses.created_at', 'program_accesses.updated_at',
    ];

    public function paginate(int $userId, array $filters): LengthAwarePaginator
    {
        return $this->baseQuery($userId)
            ->when(
                (bool) ($filters['archived'] ?? false),
                fn (Builder $query) => $query->whereNotNull('program_accesses.archived_at'),
                fn (Builder $query) => $query->whereNull('program_accesses.archived_at'),
            )
            ->when($filters['status'] ?? null, fn (Builder $query, string $status) => $query->where('program_accesses.status', $status))
            ->when($filters['search'] ?? null, fn (Builder $query, string $search) => $query->whereHas(
                'program',
                fn (Builder $program) => $program
                    ->whereLike('name', "%{$search}%")
                    ->orWhereLike('short_description', "%{$search}%"),
            ))
            ->when($filters['tag'] ?? null, fn (Builder $query, string $tag) => $query->whereHas(
                'program.tags',
                fn (Builder $tags) => $tags->where('code', $tag),
            ))
            ->tap(fn (Builder $query) => $this->applySort(
                $query,
                $filters['sort_by'] ?? 'last_accessed_at',
                $filters['sort_dir'] ?? 'desc',
            ))
            ->paginate($filters['per_page'] ?? 15);
    }

    public function findForUser(int $userId, int $accessId): ProgramAccess
    {
        $access = $this->baseQuery($userId)->findOrFail($accessId);
        $access->load([
            'nextSession.mentorAssignments' => fn ($query) => $query
                ->where('status', 'ACTIVE')
                ->select([
                    'id', 'program_session_id', 'mentor_id', 'role', 'status',
                    'capacity', 'reserved_count', 'assigned_at',
                ])
                ->with([
                    'mentor' => fn ($mentor) => $mentor
                        ->select(['id', 'user_id', 'specialization'])
                        ->with('user:id,name'),
                ]),
        ]);

        return $access;
    }

    public function summary(int $userId): array
    {
        $summary = array_fill_keys(array_map(fn (AccessStatus $status) => $status->value, AccessStatus::cases()), 0);
        $summary['ARCHIVED'] = 0;

        ProgramAccess::query()
            ->forUser($userId)
            ->selectRaw("CASE WHEN archived_at IS NOT NULL THEN 'ARCHIVED' ELSE status END AS workspace_group")
            ->selectRaw('COUNT(*) AS aggregate')
            ->groupByRaw("CASE WHEN archived_at IS NOT NULL THEN 'ARCHIVED' ELSE status END")
            ->get()
            ->each(function (ProgramAccess $row) use (&$summary): void {
                $summary[(string) $row->getAttribute('workspace_group')] = (int) $row->getAttribute('aggregate');
            });

        return $summary;
    }

    private function baseQuery(int $userId): Builder
    {
        return ProgramAccess::query()
            ->select(self::ACCESS_COLUMNS)
            ->addSelect([
                'next_session_id' => ProgramSession::query()
                    ->select('id')
                    ->whereColumn('program_batch_id', 'program_accesses.program_batch_id')
                    ->whereIn('status', [SessionStatus::Scheduled->value, SessionStatus::Ongoing->value])
                    ->where('ends_at', '>=', now())
                    ->orderBy('starts_at')
                    ->orderBy('id')
                    ->limit(1),
            ])
            ->forUser($userId)
            ->with([
                'program' => fn ($query) => $query
                    ->select([
                        'id', 'name', 'slug', 'short_description', 'description',
                        'thumbnail_url', 'cover_url', 'status', 'visibility',
                    ])
                    ->withCount('modules')
                    ->with([
                        'tags' => fn ($tags) => $tags
                            ->select(['tags.id', 'tags.code', 'tags.name'])
                            ->active()
                            ->orderBy('sort_order')
                            ->orderBy('tags.id'),
                        'components' => fn ($components) => $components
                            ->select([
                                'id', 'program_id', 'component_definition_id', 'label',
                                'sort_order', 'is_enabled',
                            ])
                            ->enabled()
                            ->whereHas('definition', fn (Builder $definitions) => $definitions->available())
                            ->with('definition:id,code,name,handler_template,handler_key,icon,is_available,deleted_at')
                            ->orderBy('sort_order')
                            ->orderBy('id'),
                    ]),
                'batch:id,program_id,name,code,starts_at,ends_at,mode,timezone,status',
                'nextSession:id,program_batch_id,title,starts_at,ends_at,timezone,mode,mentor_assignment_mode,location,meeting_url,status',
                'certificate:id,program_access_id,certificate_number,issued_at,revoked_at',
            ]);
    }

    private function applySort(Builder $query, string $sortBy, string $direction): void
    {
        if ($sortBy === 'name') {
            $query->orderBy(
                Program::query()->select('name')->whereColumn('programs.id', 'program_accesses.program_id'),
                $direction,
            );
        } else {
            if (in_array($sortBy, ['last_accessed_at', 'starts_at'], true)) {
                $query->orderByRaw("CASE WHEN program_accesses.{$sortBy} IS NULL THEN 1 ELSE 0 END");
            }

            $query->orderBy("program_accesses.{$sortBy}", $direction);
        }

        $query->orderByDesc('program_accesses.id');
    }
}
