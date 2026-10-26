<?php

namespace App\Domain\CBT;

use App\Http\Controllers\Controller;
use App\Models\AssessmentContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: 'Assessment Contexts',
    description: 'Layer 1 CBT: Master Stimulus and Case Context Endpoints'
)]
class AssessmentContextController extends Controller
{
    /**
     * List all assessment contexts.
     */
    #[OA\Get(
        path: '/api/v1/assessment/contexts',
        summary: 'List assessment contexts (Layer 1 CBT)',
        description: 'Retrieves a paginated list of stimulus / wacana contexts.',
        tags: ['Assessment Contexts'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'search', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'media_type', in: 'query', required: false, schema: new OA\Schema(type: 'string', enum: ['image', 'audio', 'video'])),
            new OA\Parameter(name: 'page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 1)),
            new OA\Parameter(name: 'per_page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 15)),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Contexts retrieved successfully',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'Contexts retrieved successfully'),
                        new OA\Property(property: 'data', type: 'array', items: new OA\Items(type: 'object')),
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function index(Request $request): JsonResponse
    {
        $query = AssessmentContext::query()->active()->withCount('questions');

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ilike', "%{$search}%")
                  ->orWhere('body_content', 'ilike', "%{$search}%");
            });
        }

        if ($request->filled('media_type')) {
            $query->where('media_type', $request->query('media_type'));
        }

        $perPage = (int) $request->query('per_page', 15);
        $contexts = $query->latest('id')->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Contexts retrieved successfully',
            'data' => $contexts->items(),
            'meta' => [
                'current_page' => $contexts->currentPage(),
                'last_page' => $contexts->lastPage(),
                'per_page' => $contexts->perPage(),
                'total' => $contexts->total(),
            ],
        ]);
    }

    /**
     * Store a new assessment context.
     */
    #[OA\Post(
        path: '/api/v1/assessment/contexts',
        summary: 'Create assessment context',
        description: 'Creates a new stimulus / wacana for questions.',
        tags: ['Assessment Contexts'],
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['title', 'body_content'],
                properties: [
                    new OA\Property(property: 'title', type: 'string', example: 'Wacana Analisis Fiskal Negara'),
                    new OA\Property(property: 'body_content', type: 'string', example: 'Berikut adalah teks wacana bacaan panjang dengan rumus LaTeX $$E=mc^2$$...'),
                    new OA\Property(property: 'media_url', type: 'string', nullable: true, example: 'https://cdn.arkanin.my.id/stimulus/chart-1.png'),
                    new OA\Property(property: 'media_type', type: 'string', nullable: true, enum: ['image', 'audio', 'video'], example: 'image'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Context created successfully'),
            new OA\Response(response: 422, description: 'Validation failed'),
        ]
    )]
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'body_content' => 'required|string',
            'media_url' => 'nullable|url|max:500',
            'media_type' => 'nullable|string|in:image,audio,video',
        ]);

        $context = AssessmentContext::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Context created successfully',
            'data' => $context,
        ], 201);
    }

    /**
     * Get single assessment context with questions.
     */
    #[OA\Get(
        path: '/api/v1/assessment/contexts/{id}',
        summary: 'Get assessment context detail',
        tags: ['Assessment Contexts'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Context retrieved successfully'),
            new OA\Response(response: 404, description: 'Context not found'),
        ]
    )]
    public function show(int $id): JsonResponse
    {
        $context = AssessmentContext::query()
            ->active()
            ->with(['questions' => fn ($q) => $q->active()])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Context retrieved successfully',
            'data' => $context,
        ]);
    }

    /**
     * Update an assessment context.
     */
    #[OA\Put(
        path: '/api/v1/assessment/contexts/{id}',
        summary: 'Update assessment context',
        tags: ['Assessment Contexts'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'title', type: 'string'),
                    new OA\Property(property: 'body_content', type: 'string'),
                    new OA\Property(property: 'media_url', type: 'string', nullable: true),
                    new OA\Property(property: 'media_type', type: 'string', nullable: true),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Context updated successfully'),
            new OA\Response(response: 404, description: 'Context not found'),
        ]
    )]
    public function update(Request $request, int $id): JsonResponse
    {
        $context = AssessmentContext::query()->active()->findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'body_content' => 'sometimes|required|string',
            'media_url' => 'nullable|url|max:500',
            'media_type' => 'nullable|string|in:image,audio,video',
        ]);

        $context->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Context updated successfully',
            'data' => $context,
        ]);
    }

    /**
     * Soft delete an assessment context.
     */
    #[OA\Delete(
        path: '/api/v1/assessment/contexts/{id}',
        summary: 'Delete assessment context',
        tags: ['Assessment Contexts'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Context deleted successfully'),
            new OA\Response(response: 404, description: 'Context not found'),
        ]
    )]
    public function destroy(int $id): JsonResponse
    {
        $context = AssessmentContext::query()->active()->findOrFail($id);
        $context->update(['row_status' => -1]);

        return response()->json([
            'success' => true,
            'message' => 'Context deleted successfully',
        ]);
    }
}
