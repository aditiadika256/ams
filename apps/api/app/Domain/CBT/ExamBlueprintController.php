<?php

namespace App\Domain\CBT;

use App\Http\Controllers\Controller;
use App\Models\ExamPackage;
use App\Models\ExamSection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: 'Assessment Blueprints',
    description: 'Layer 2 CBT: Blueprint Package Builder Endpoints'
)]
class ExamBlueprintController extends Controller
{
    /**
     * List all exam packages / blueprints.
     */
    #[OA\Get(
        path: '/api/v1/assessment/blueprints',
        summary: 'List assessment blueprints (Layer 2 CBT)',
        description: 'Retrieves a paginated list of blueprint exam packages with their sections.',
        tags: ['Assessment Blueprints'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'search', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'visual_mode', in: 'query', required: false, schema: new OA\Schema(type: 'string', enum: ['standard', 'cpns', 'utbk', 'akm', 'osn', 'omi'])),
            new OA\Parameter(name: 'scoring_mode', in: 'query', required: false, schema: new OA\Schema(type: 'string', enum: ['same_weight', 'custom_weight', 'scale_tkp', 'irt_2pl'])),
            new OA\Parameter(name: 'page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 1)),
            new OA\Parameter(name: 'per_page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 15)),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Blueprints retrieved successfully',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'Blueprints retrieved successfully'),
                        new OA\Property(property: 'data', type: 'array', items: new OA\Items(type: 'object')),
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function index(Request $request): JsonResponse
    {
        $query = ExamPackage::query()
            ->active()
            ->with(['sections' => fn ($q) => $q->active()->withCount('questions')]);

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where('name', 'ilike', "%{$search}%");
        }

        if ($request->filled('visual_mode')) {
            $query->where('visual_mode', $request->query('visual_mode'));
        }

        if ($request->filled('scoring_mode')) {
            $query->where('scoring_mode', $request->query('scoring_mode'));
        }

        $perPage = (int) $request->query('per_page', 15);
        $blueprints = $query->latest('id')->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Blueprints retrieved successfully',
            'data' => $blueprints->items(),
            'meta' => [
                'current_page' => $blueprints->currentPage(),
                'last_page' => $blueprints->lastPage(),
                'per_page' => $blueprints->perPage(),
                'total' => $blueprints->total(),
            ],
        ]);
    }

    /**
     * Store a new blueprint exam package with sections.
     */
    #[OA\Post(
        path: '/api/v1/assessment/blueprints',
        summary: 'Create assessment blueprint package',
        description: 'Creates a blueprint package with multi-sections and scoring configuration.',
        tags: ['Assessment Blueprints'],
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name', 'duration_minutes'],
                properties: [
                    new OA\Property(property: 'name', type: 'string', example: 'Tryout SKD CPNS 2026 Gelombang 1'),
                    new OA\Property(property: 'visual_mode', type: 'string', enum: ['standard', 'cpns', 'utbk', 'akm', 'osn', 'omi'], default: 'cpns'),
                    new OA\Property(property: 'scoring_mode', type: 'string', enum: ['same_weight', 'custom_weight', 'scale_tkp', 'irt_2pl'], default: 'same_weight'),
                    new OA\Property(property: 'negative_marking', type: 'boolean', default: false),
                    new OA\Property(property: 'level', type: 'string', default: 'cpns'),
                    new OA\Property(property: 'duration_minutes', type: 'integer', default: 100),
                    new OA\Property(property: 'randomize', type: 'boolean', default: true),
                    new OA\Property(property: 'show_result_mode', type: 'string', enum: ['immediate', 'after'], default: 'after'),
                    new OA\Property(property: 'sections', type: 'array', items: new OA\Items(type: 'object')),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Blueprint created successfully'),
            new OA\Response(response: 422, description: 'Validation failed'),
        ]
    )]
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'visual_mode' => 'nullable|string|in:standard,cpns,utbk,akm,osn,omi',
            'scoring_mode' => 'nullable|string|in:same_weight,custom_weight,scale_tkp,irt_2pl',
            'negative_marking' => 'nullable|boolean',
            'level' => 'nullable|string|max:50',
            'duration_minutes' => 'required|integer|min:1',
            'randomize' => 'nullable|boolean',
            'show_result_mode' => 'nullable|string|in:immediate,after',
            'sections' => 'nullable|array',
            'sections.*.subject' => 'required_with:sections|string|max:150',
            'sections.*.sort_order' => 'nullable|integer',
            'sections.*.transition_mode' => 'nullable|string|in:direct_continuous,intermission_break',
            'sections.*.break_duration_seconds' => 'nullable|integer',
            'sections.*.section_timer_minutes' => 'nullable|integer',
            'sections.*.num_questions' => 'nullable|integer',
            'sections.*.bank_id' => 'nullable|integer|exists:question_banks,id',
            'sections.*.question_ids' => 'nullable|array',
        ]);

        $blueprint = DB::transaction(function () use ($validated) {
            $package = ExamPackage::create([
                'name' => $validated['name'],
                'visual_mode' => $validated['visual_mode'] ?? 'standard',
                'scoring_mode' => $validated['scoring_mode'] ?? 'same_weight',
                'negative_marking' => $validated['negative_marking'] ?? false,
                'level' => $validated['level'] ?? 'umum',
                'duration_minutes' => $validated['duration_minutes'],
                'randomize' => $validated['randomize'] ?? true,
                'show_result_mode' => $validated['show_result_mode'] ?? 'after',
            ]);

            if (! empty($validated['sections'])) {
                foreach ($validated['sections'] as $index => $secData) {
                    $section = ExamSection::create([
                        'package_id' => $package->id,
                        'subject' => $secData['subject'],
                        'sort_order' => $secData['sort_order'] ?? ($index + 1),
                        'transition_mode' => $secData['transition_mode'] ?? 'direct_continuous',
                        'break_duration_seconds' => $secData['break_duration_seconds'] ?? 0,
                        'section_timer_minutes' => $secData['section_timer_minutes'] ?? null,
                        'num_questions' => $secData['num_questions'] ?? count($secData['question_ids'] ?? []),
                        'bank_id' => $secData['bank_id'] ?? 1,
                    ]);

                    if (! empty($secData['question_ids'])) {
                        $syncData = [];
                        foreach ($secData['question_ids'] as $qOrder => $qId) {
                            $syncData[$qId] = ['sort_order' => $qOrder + 1];
                        }
                        $section->questions()->sync($syncData);
                    }
                }
            }

            return $package->load(['sections.questions']);
        });

        return response()->json([
            'success' => true,
            'message' => 'Blueprint created successfully',
            'data' => $blueprint,
        ], 201);
    }

    /**
     * Get single blueprint package detail.
     */
    #[OA\Get(
        path: '/api/v1/assessment/blueprints/{id}',
        summary: 'Get assessment blueprint detail',
        tags: ['Assessment Blueprints'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Blueprint retrieved successfully'),
            new OA\Response(response: 404, description: 'Blueprint not found'),
        ]
    )]
    public function show(int $id): JsonResponse
    {
        $blueprint = ExamPackage::query()
            ->active()
            ->with(['sections' => fn ($q) => $q->active()->with('questions')])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Blueprint retrieved successfully',
            'data' => $blueprint,
        ]);
    }

    /**
     * Update blueprint package.
     */
    #[OA\Put(
        path: '/api/v1/assessment/blueprints/{id}',
        summary: 'Update assessment blueprint',
        tags: ['Assessment Blueprints'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Blueprint updated successfully'),
            new OA\Response(response: 404, description: 'Blueprint not found'),
        ]
    )]
    public function update(Request $request, int $id): JsonResponse
    {
        $package = ExamPackage::query()->active()->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'visual_mode' => 'nullable|string|in:standard,cpns,utbk,akm,osn,omi',
            'scoring_mode' => 'nullable|string|in:same_weight,custom_weight,scale_tkp,irt_2pl',
            'negative_marking' => 'nullable|boolean',
            'level' => 'nullable|string|max:50',
            'duration_minutes' => 'sometimes|required|integer|min:1',
            'randomize' => 'nullable|boolean',
            'show_result_mode' => 'nullable|string|in:immediate,after',
        ]);

        $package->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Blueprint updated successfully',
            'data' => $package->load('sections'),
        ]);
    }

    /**
     * Soft delete blueprint package.
     */
    #[OA\Delete(
        path: '/api/v1/assessment/blueprints/{id}',
        summary: 'Delete assessment blueprint',
        tags: ['Assessment Blueprints'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Blueprint deleted successfully'),
            new OA\Response(response: 404, description: 'Blueprint not found'),
        ]
    )]
    public function destroy(int $id): JsonResponse
    {
        $package = ExamPackage::query()->active()->findOrFail($id);
        $package->update(['row_status' => -1]);

        return response()->json([
            'success' => true,
            'message' => 'Blueprint deleted successfully',
        ]);
    }
}
