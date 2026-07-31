<?php

namespace App\Domain\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProgramLevelStoreRequest;
use App\Http\Requests\Admin\ProgramLevelUpdateRequest;
use App\Http\Requests\Admin\ProgramMasterIndexRequest;
use App\Http\Resources\ProgramLevelResource;
use App\Models\ProgramLevel;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class ProgramLevelController extends Controller
{
    private const COLUMNS = [
        'id',
        'code',
        'name',
        'row_status',
        'sort_order',
        'created_at',
    ];

    public function index(ProgramMasterIndexRequest $request): JsonResponse
    {
        $filters = $request->validated();
        $query = ProgramLevel::query()->select(self::COLUMNS);

        $this->applyFilters($query, $filters);
        $this->applySorting($query, $filters);

        $levels = $query->paginate($filters['per_page'] ?? 15);
        $data = ProgramLevelResource::collection($levels)
            ->response()
            ->getData(true);

        return $this->successResponse(
            $data,
            'Program levels retrieved successfully'
        );
    }

    public function store(ProgramLevelStoreRequest $request): JsonResponse
    {
        $level = ProgramLevel::query()->create($request->validated());

        $this->rotateProgramCaches();

        return $this->createdResponse(
            new ProgramLevelResource($level),
            'Program level created successfully'
        );
    }

    public function show(ProgramLevel $programLevel): JsonResponse
    {
        return $this->successResponse(
            new ProgramLevelResource($programLevel),
            'Program level retrieved successfully'
        );
    }

    public function update(
        ProgramLevelUpdateRequest $request,
        ProgramLevel $programLevel
    ): JsonResponse {
        $programLevel->update($request->validated());
        $this->rotateProgramCaches();

        return $this->successResponse(
            new ProgramLevelResource($programLevel->refresh()),
            'Program level updated successfully'
        );
    }

    public function destroy(ProgramLevel $programLevel): JsonResponse
    {
        $programLevel->update(['row_status' => -1]);
        $this->rotateProgramCaches();

        return $this->noContentResponse();
    }

    /**
     * @param array<string, mixed> $filters
     */
    private function applyFilters(Builder $query, array $filters): void
    {
        if (array_key_exists('row_status', $filters)) {
            $query->where('row_status', $filters['row_status']);
        }

        if (!empty($filters['search'])) {
            $search = '%'.Str::lower($filters['search']).'%';
            $query->where(function (Builder $query) use ($search): void {
                $query->whereRaw('LOWER(code) LIKE ?', [$search])
                    ->orWhereRaw('LOWER(name) LIKE ?', [$search]);
            });
        }
    }

    /**
     * @param array<string, mixed> $filters
     */
    private function applySorting(Builder $query, array $filters): void
    {
        $sortBy = $filters['sort_by'] ?? 'sort_order';
        $sortDir = $filters['sort_dir'] ?? 'asc';

        $query->orderBy($sortBy, $sortDir)
            ->orderBy('id', $sortDir);
    }

    private function rotateProgramCaches(): void
    {
        Cache::forever(
            'program-lookups:cache_version',
            Str::uuid()->toString()
        );
        Cache::forever('programs:cache_version', Str::uuid()->toString());
    }
}
