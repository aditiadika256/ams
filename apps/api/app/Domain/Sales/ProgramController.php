<?php

namespace App\Domain\Sales;

use App\Http\Controllers\Controller;
use App\Http\Requests\Sales\ProgramIndexRequest;
use App\Http\Requests\Sales\ProgramStoreRequest;
use App\Http\Requests\Sales\ProgramUpdateRequest;
use App\Http\Resources\ProgramResource;
use App\Models\Program;
use App\Models\ProgramLevel;
use App\Models\ProgramType;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: 'Programs',
    description: 'Program bimbel/tryout sales endpoints'
)]
class ProgramController extends Controller
{
    private const PROGRAM_COLUMNS = [
        'id',
        'name',
        'program_level_id',
        'program_type_id',
        'level',
        'type',
        'price',
        'active',
        'created_at',
        'updated_at',
    ];

    private const LOOKUP_RELATIONS = [
        'programLevel:id,code,name,row_status,sort_order',
        'programType:id,code,name,row_status,sort_order',
    ];

    #[OA\Get(
        path: '/api/v1/programs',
        summary: 'List programs',
        tags: ['Programs'],
        parameters: [
            new OA\QueryParameter(name: 'level', description: 'Filter by active program level code', required: false, schema: new OA\Schema(type: 'string')),
            new OA\QueryParameter(name: 'type', description: 'Filter by active program type code', required: false, schema: new OA\Schema(type: 'string')),
            new OA\QueryParameter(name: 'program_level_id', description: 'Filter by active program level ID', required: false, schema: new OA\Schema(type: 'integer')),
            new OA\QueryParameter(name: 'program_type_id', description: 'Filter by active program type ID', required: false, schema: new OA\Schema(type: 'integer')),
            new OA\QueryParameter(name: 'active', description: 'Filter active status (true|false)', required: false, schema: new OA\Schema(type: 'boolean')),
            new OA\QueryParameter(name: 'search', description: 'Search by name', required: false, schema: new OA\Schema(type: 'string')),
            new OA\QueryParameter(name: 'sort_by', description: 'Sort column (name|price|created_at)', required: false, schema: new OA\Schema(type: 'string')),
            new OA\QueryParameter(name: 'sort_dir', description: 'Sort direction (asc|desc)', required: false, schema: new OA\Schema(type: 'string')),
            new OA\QueryParameter(name: 'page', required: false, schema: new OA\Schema(type: 'integer', format: 'int32')),
            new OA\QueryParameter(name: 'per_page', required: false, schema: new OA\Schema(type: 'integer', format: 'int32')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Programs list'),
        ]
    )]
    public function index(ProgramIndexRequest $request): JsonResponse
    {
        $filters = $request->validated();

        $query = Program::query()
            ->select(self::PROGRAM_COLUMNS)
            ->with(self::LOOKUP_RELATIONS);

        if (isset($filters['level'])) {
            $query->where('level', $filters['level']);
        }

        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (isset($filters['program_level_id'])) {
            $query->where('program_level_id', $filters['program_level_id']);
        }

        if (isset($filters['program_type_id'])) {
            $query->where('program_type_id', $filters['program_type_id']);
        }

        if (array_key_exists('active', $filters)) {
            $query->where('active', $filters['active']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%');
            });
        }

        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortDir = $filters['sort_dir'] ?? 'desc';

        $query->orderBy($sortBy, $sortDir);

        $perPage = $filters['per_page'] ?? 15;

        $page = (int)($filters['page'] ?? 1);

        // Use a simpler cache key for the common active-only query
        $isSimpleActiveQuery = count($filters) === 1 && isset($filters['active']) && $filters['active'];
        $cacheVersion = Cache::get('programs:cache_version', 'initial');
        $cacheKey = $isSimpleActiveQuery
            ? sprintf('programs:%s:active:page:%d:per:%d', $cacheVersion, $page, $perPage)
            : sprintf('programs:%s:index:%s:page:%d:per:%d', $cacheVersion, md5(json_encode($filters)), $page, $perPage);

        $data = Cache::remember($cacheKey, 300, function () use ($query, $perPage) {
            $programs = $query->paginate($perPage);
            return ProgramResource::collection($programs)->response()->getData(true);
        });

        return $this->successResponse(
            $data,
            'Programs retrieved successfully'
        )->header('Cache-Control', 'public, max-age=0, no-cache, must-revalidate');
    }

    #[OA\Get(
        path: '/api/v1/programs/{id}',
        summary: 'Get program detail',
        tags: ['Programs'],
        parameters: [
            new OA\PathParameter(name: 'id', schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Program detail'),
            new OA\Response(response: 404, description: 'Program not found'),
        ]
    )]
    public function show(Program $program): JsonResponse
    {
        return $this->successResponse(
            new ProgramResource($program->load(self::LOOKUP_RELATIONS)),
            'Program retrieved successfully'
        );
    }

    #[OA\Post(
        path: '/api/v1/programs',
        summary: 'Create new program',
        tags: ['Programs'],
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name', 'program_level_id', 'program_type_id', 'price'],
                properties: [
                    new OA\Property(property: 'name', type: 'string', example: 'Paket Tryout CPNS'),
                    new OA\Property(property: 'program_level_id', type: 'integer', example: 4),
                    new OA\Property(property: 'program_type_id', type: 'integer', example: 1),
                    new OA\Property(property: 'price', type: 'integer', example: 250000),
                    new OA\Property(property: 'active', type: 'boolean', example: true),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Program created'),
            new OA\Response(response: 422, description: 'Validation error'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function store(ProgramStoreRequest $request): JsonResponse
    {
        $program = DB::transaction(function () use ($request): Program {
            $data = $this->synchronizeLookupCodes($request->validated());

            if (!array_key_exists('active', $data)) {
                $data['active'] = true;
            }

            return Program::query()->create($data);
        });
        $this->invalidateIndexCache();

        return $this->createdResponse(
            new ProgramResource($program->load(self::LOOKUP_RELATIONS)),
            'Program created successfully'
        );
    }

    #[OA\Put(
        path: '/api/v1/programs/{id}',
        summary: 'Update existing program',
        tags: ['Programs'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\PathParameter(name: 'id', schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'name', type: 'string', example: 'Paket Tryout CPNS'),
                    new OA\Property(property: 'program_level_id', type: 'integer', example: 4),
                    new OA\Property(property: 'program_type_id', type: 'integer', example: 1),
                    new OA\Property(property: 'price', type: 'integer', example: 275000),
                    new OA\Property(property: 'active', type: 'boolean', example: true),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Program updated'),
            new OA\Response(response: 404, description: 'Program not found'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function update(ProgramUpdateRequest $request, Program $program): JsonResponse
    {
        DB::transaction(function () use ($request, $program): void {
            $program->update(
                $this->synchronizeLookupCodes($request->validated())
            );
        });
        $this->invalidateIndexCache();

        return $this->successResponse(
            new ProgramResource($program->load(self::LOOKUP_RELATIONS)),
            'Program updated successfully'
        );
    }

    #[OA\Delete(
        path: '/api/v1/programs/{id}',
        summary: 'Delete program',
        tags: ['Programs'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\PathParameter(name: 'id', schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 204, description: 'Program deleted'),
            new OA\Response(response: 404, description: 'Program not found'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function destroy(Program $program): JsonResponse
    {
        if ($program->orderItems()->exists()) {
            return $this->errorResponse(
                'Program tidak dapat dihapus karena sudah digunakan dalam order.',
                422
            );
        }

        $program->delete();
        $this->invalidateIndexCache();

        return $this->noContentResponse();
    }

    private function invalidateIndexCache(): void
    {
        Cache::forever('programs:cache_version', Str::uuid()->toString());
    }

    /**
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    private function synchronizeLookupCodes(array $data): array
    {
        if (array_key_exists('program_level_id', $data)) {
            $data['level'] = $this->resolveProgramLevel(
                (int) $data['program_level_id']
            )->code;
        }

        if (array_key_exists('program_type_id', $data)) {
            $data['type'] = $this->resolveProgramType(
                (int) $data['program_type_id']
            )->code;
        }

        return $data;
    }

    private function resolveProgramLevel(int $id): ProgramLevel
    {
        $level = ProgramLevel::query()
            ->active()
            ->lockForUpdate()
            ->find($id, ['id', 'code']);

        if ($level === null) {
            throw ValidationException::withMessages([
                'program_level_id' => ['The selected program level is invalid or inactive.'],
            ]);
        }

        return $level;
    }

    private function resolveProgramType(int $id): ProgramType
    {
        $type = ProgramType::query()
            ->active()
            ->lockForUpdate()
            ->find($id, ['id', 'code']);

        if ($type === null) {
            throw ValidationException::withMessages([
                'program_type_id' => ['The selected program type is invalid or inactive.'],
            ]);
        }

        return $type;
    }
}
