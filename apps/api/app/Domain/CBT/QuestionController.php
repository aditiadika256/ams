<?php

namespace App\Domain\CBT;

use App\Enums\QuestionType;
use App\Http\Controllers\Controller;
use App\Models\Question;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: 'Assessment Questions',
    description: 'Layer 1 CBT: Master Question Bank Endpoints'
)]
class QuestionController extends Controller
{
    /**
     * List all assessment questions with filter & search.
     */
    #[OA\Get(
        path: '/api/v1/assessment/questions',
        summary: 'List assessment questions (Layer 1 CBT)',
        description: 'Retrieves a paginated list of question items with context relation.',
        tags: ['Assessment Questions'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'search', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'context_id', in: 'query', required: false, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'difficulty', in: 'query', required: false, schema: new OA\Schema(type: 'string', enum: ['easy', 'medium', 'hard', 'hots'])),
            new OA\Parameter(name: 'type', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'status', in: 'query', required: false, schema: new OA\Schema(type: 'string', enum: ['draft', 'under_review', 'approved', 'revision_needed'])),
            new OA\Parameter(name: 'page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 1)),
            new OA\Parameter(name: 'per_page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 15)),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Questions retrieved successfully',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'Questions retrieved successfully'),
                        new OA\Property(property: 'data', type: 'array', items: new OA\Items(type: 'object')),
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function index(Request $request): JsonResponse
    {
        $query = Question::query()
            ->active()
            ->with(['context:id,title,media_type']);

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('stem', 'ilike', "%{$search}%")
                  ->orWhere('explanation', 'ilike', "%{$search}%");
            });
        }

        if ($request->filled('context_id')) {
            $query->where('context_id', (int) $request->query('context_id'));
        }

        if ($request->filled('difficulty')) {
            $query->where('difficulty', $request->query('difficulty'));
        }

        if ($request->filled('type')) {
            $query->where('type', $request->query('type'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        $perPage = (int) $request->query('per_page', 15);
        $questions = $query->latest('id')->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Questions retrieved successfully',
            'data' => $questions->items(),
            'meta' => [
                'current_page' => $questions->currentPage(),
                'last_page' => $questions->lastPage(),
                'per_page' => $questions->perPage(),
                'total' => $questions->total(),
            ],
        ]);
    }

    /**
     * Store a new question.
     */
    #[OA\Post(
        path: '/api/v1/assessment/questions',
        summary: 'Create a new question',
        description: 'Creates a question item, optionally tied to a stimulus context.',
        tags: ['Assessment Questions'],
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['stem', 'type'],
                properties: [
                    new OA\Property(property: 'context_id', type: 'integer', nullable: true, example: 1),
                    new OA\Property(property: 'stem', type: 'string', example: 'Berapakah nilai $$x$$ jika $$2x + 4 = 10$$?'),
                    new OA\Property(property: 'type', type: 'string', example: 'single'),
                    new OA\Property(property: 'options', type: 'array', items: new OA\Items(type: 'object')),
                    new OA\Property(property: 'answer_key', type: 'object'),
                    new OA\Property(property: 'difficulty', type: 'string', enum: ['easy', 'medium', 'hard', 'hots'], default: 'medium'),
                    new OA\Property(property: 'estimated_seconds', type: 'integer', default: 60),
                    new OA\Property(property: 'tags', type: 'array', items: new OA\Items(type: 'string')),
                    new OA\Property(property: 'score_weight', type: 'number', format: 'float', default: 1.00),
                    new OA\Property(property: 'explanation', type: 'string', nullable: true),
                    new OA\Property(property: 'status', type: 'string', enum: ['draft', 'under_review', 'approved'], default: 'draft'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Question created successfully'),
            new OA\Response(response: 422, description: 'Validation failed'),
        ]
    )]
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'context_id' => 'nullable|integer|exists:assessment_contexts,id',
            'bank_id' => 'nullable|integer|exists:question_banks,id',
            'stem' => 'required|string',
            'type' => 'required|string',
            'options' => 'nullable|array',
            'answer_key' => 'nullable|array',
            'difficulty' => 'nullable|string|in:easy,medium,hard,hots',
            'estimated_seconds' => 'nullable|integer|min:10|max:1800',
            'tags' => 'nullable|array',
            'score_weight' => 'nullable|numeric|min:0|max:100',
            'explanation' => 'nullable|string',
            'status' => 'nullable|string|in:draft,under_review,approved,revision_needed',
        ]);

        // Default fallbacks
        $validated['difficulty'] = $validated['difficulty'] ?? 'medium';
        $validated['estimated_seconds'] = $validated['estimated_seconds'] ?? 60;
        $validated['score_weight'] = $validated['score_weight'] ?? 1.00;
        $validated['status'] = $validated['status'] ?? 'draft';

        $question = Question::create($validated);
        $question->load('context:id,title,media_type');

        return response()->json([
            'success' => true,
            'message' => 'Question created successfully',
            'data' => $question,
        ], 201);
    }

    /**
     * Get single question detail.
     */
    #[OA\Get(
        path: '/api/v1/assessment/questions/{id}',
        summary: 'Get question detail',
        tags: ['Assessment Questions'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Question retrieved successfully'),
            new OA\Response(response: 404, description: 'Question not found'),
        ]
    )]
    public function show(int $id): JsonResponse
    {
        $question = Question::query()
            ->active()
            ->with(['context:id,title,body_content,media_url,media_type'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Question retrieved successfully',
            'data' => $question,
        ]);
    }

    /**
     * Update an existing question.
     */
    #[OA\Put(
        path: '/api/v1/assessment/questions/{id}',
        summary: 'Update question',
        tags: ['Assessment Questions'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'context_id', type: 'integer', nullable: true),
                    new OA\Property(property: 'stem', type: 'string'),
                    new OA\Property(property: 'type', type: 'string'),
                    new OA\Property(property: 'options', type: 'array', items: new OA\Items(type: 'object')),
                    new OA\Property(property: 'answer_key', type: 'object'),
                    new OA\Property(property: 'difficulty', type: 'string'),
                    new OA\Property(property: 'estimated_seconds', type: 'integer'),
                    new OA\Property(property: 'tags', type: 'array', items: new OA\Items(type: 'string')),
                    new OA\Property(property: 'score_weight', type: 'number'),
                    new OA\Property(property: 'explanation', type: 'string', nullable: true),
                    new OA\Property(property: 'status', type: 'string'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Question updated successfully'),
            new OA\Response(response: 404, description: 'Question not found'),
        ]
    )]
    public function update(Request $request, int $id): JsonResponse
    {
        $question = Question::query()->active()->findOrFail($id);

        $validated = $request->validate([
            'context_id' => 'nullable|integer|exists:assessment_contexts,id',
            'bank_id' => 'nullable|integer|exists:question_banks,id',
            'stem' => 'sometimes|required|string',
            'type' => 'sometimes|required|string',
            'options' => 'nullable|array',
            'answer_key' => 'nullable|array',
            'difficulty' => 'nullable|string|in:easy,medium,hard,hots',
            'estimated_seconds' => 'nullable|integer|min:10|max:1800',
            'tags' => 'nullable|array',
            'score_weight' => 'nullable|numeric|min:0|max:100',
            'explanation' => 'nullable|string',
            'status' => 'nullable|string|in:draft,under_review,approved,revision_needed',
        ]);

        $question->update($validated);
        $question->load('context:id,title,media_type');

        return response()->json([
            'success' => true,
            'message' => 'Question updated successfully',
            'data' => $question,
        ]);
    }

    /**
     * Soft delete a question.
     */
    #[OA\Delete(
        path: '/api/v1/assessment/questions/{id}',
        summary: 'Delete question',
        tags: ['Assessment Questions'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Question deleted successfully'),
            new OA\Response(response: 404, description: 'Question not found'),
        ]
    )]
    public function destroy(int $id): JsonResponse
    {
        $question = Question::query()->active()->findOrFail($id);
        $question->update(['row_status' => -1]);

        return response()->json([
            'success' => true,
            'message' => 'Question deleted successfully',
        ]);
    }
}
