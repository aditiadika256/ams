<?php

namespace App\Domain\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProgramMasterIndexRequest;
use App\Http\Requests\Admin\ProgramTypeStoreRequest;
use App\Http\Requests\Admin\ProgramTypeUpdateRequest;
use App\Http\Resources\ProgramTypeResource;
use App\Models\ProgramType;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class ProgramTypeController extends Controller
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
        $query = ProgramType::query()->select(self::COLUMNS);

        $this->applyFilters($query, $filters);
        $this->applySorting($query, $filters);

        $types = $query->paginate($filters['per_page'] ?? 15);
        $data = ProgramTypeResource::collection($types)
            ->response()
            ->getData(true);

        return $this->successResponse(
            $data,
            'Program types retrieved successfully'
        );
    }

    public function store(ProgramTypeStoreRequest $request): JsonResponse
    {
        $type = ProgramType::query()->create($request->validated());

        $this->rotateProgramCaches();

        return $this->createdResponse(
            new ProgramTypeResource($type),
            'Program type created successfully'
        );
    }

    public function show(ProgramType $programType): JsonResponse
    {
        return $this->successResponse(
            new ProgramTypeResource($programType),
            'Program type retrieved successfully'
        );
    }

    public function update(
        ProgramTypeUpdateRequest $request,
        ProgramType $programType
    ): JsonResponse {
        $programType->update($request->validated());
        $this->rotateProgramCaches();

        return $this->successResponse(
            new ProgramTypeResource($programType->refresh()),
            'Program type updated successfully'
        );
    }

    public function destroy(ProgramType $programType): JsonResponse
    {
        $programType->update(['row_status' => -1]);
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
