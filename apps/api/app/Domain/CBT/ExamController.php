<?php

namespace App\Domain\CBT;

use App\Actions\Access\RecordProgramActivity;
use App\Http\Controllers\Controller;
use App\Http\Requests\Access\ExamPackageAccessRequest;
use App\Http\Requests\Access\ExamStartRequest;
use App\Models\ExamAnswer;
use App\Models\ExamAttempt;
use App\Models\ExamPackage;
use App\Models\ExamSession;
use App\Models\ProgramAccess;
use App\Models\Question;
use App\Models\User;
use App\Support\Access\AssessmentAccessAuthorizer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: 'CBT',
    description: 'Computer Based Test endpoints'
)]
class ExamController extends Controller
{
    public function __construct(
        private readonly AssessmentAccessAuthorizer $assessmentAccess,
        private readonly RecordProgramActivity $activities,
    ) {}

    /**
     * List available exam packages.
     */
    #[OA\Get(
        path: '/api/v1/exams/packages',
        summary: 'List exam packages',
        description: 'Retrieves a list of available exam packages.',
        tags: ['CBT'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Packages retrieved successfully',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'Packages retrieved successfully'),
                        new OA\Property(
                            property: 'data',
                            type: 'array',
                            items: new OA\Items(
                                properties: [
                                    new OA\Property(property: 'id', type: 'integer', example: 1),
                                    new OA\Property(property: 'title', type: 'string', example: 'Tryout SNBT 2025'),
                                    new OA\Property(property: 'description', type: 'string', example: 'Description here'),
                                    new OA\Property(property: 'duration', type: 'integer', example: 120),
                                    new OA\Property(property: 'status', type: 'string', example: 'active'),
                                ]
                            )
                        ),
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Unauthorized'),
        ]
    )]
    public function index(ExamPackageAccessRequest $request)
    {
        $access = ProgramAccess::query()
            ->forUser($request->user()->id)
            ->findOrFail($request->validated('program_access_id'));
        $packageIds = $this->assessmentAccess->authorizedPackageIds($request->user(), $access, true);
        $packages = ExamPackage::query()->whereKey($packageIds)->orderBy('id')->get();

        return $this->successResponse($packages, 'Packages retrieved successfully');
    }

    /**
     * Get a single exam package.
     */
    #[OA\Get(
        path: '/api/v1/exams/packages/{id}',
        summary: 'Get exam package details',
        description: 'Retrieves details for a specific exam package.',
        tags: ['CBT'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(
                name: 'id',
                description: 'Package ID',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer')
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Package details retrieved successfully',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'Package details retrieved successfully'),
                        new OA\Property(
                            property: 'data',
                            type: 'object',
                            properties: [
                                new OA\Property(property: 'id', type: 'integer', example: 1),
                                new OA\Property(property: 'name', type: 'string', example: 'Tryout SNBT 2025'),
                                new OA\Property(property: 'level', type: 'string', example: 'sma'),
                                new OA\Property(property: 'duration_minutes', type: 'integer', example: 120),
                                new OA\Property(property: 'randomize', type: 'boolean', example: true),
                                new OA\Property(property: 'show_result_mode', type: 'string', example: 'after'),
                            ]
                        ),
                    ]
                )
            ),
            new OA\Response(response: 404, description: 'Package not found'),
        ]
    )]
    public function show(ExamPackageAccessRequest $request, int $id)
    {
        $access = ProgramAccess::query()
            ->forUser($request->user()->id)
            ->findOrFail($request->validated('program_access_id'));
        $this->assessmentAccess->authorize($request->user(), $access, $id, true);
        $package = ExamPackage::find($id);

        if (! $package) {
            return response()->json(['message' => 'Package not found'], 404);
        }

        return $this->successResponse($package, 'Package details retrieved successfully');
    }

    /**
     * Start an exam session and attempt.
     */
    #[OA\Post(
        path: '/api/v1/exams/start',
        summary: 'Start an exam session',
        description: 'Creates or resumes an exam session and attempt.',
        tags: ['CBT'],
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['package_id'],
                properties: [
                    new OA\Property(property: 'package_id', type: 'integer', example: 1),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Exam started successfully',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'Exam started successfully'),
                        new OA\Property(
                            property: 'data',
                            properties: [
                                new OA\Property(property: 'session_id', type: 'integer', example: 1),
                                new OA\Property(property: 'attempt_id', type: 'integer', example: 1),
                                new OA\Property(property: 'restored', type: 'boolean', example: false),
                            ],
                            type: 'object'
                        ),
                    ]
                )
            ),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function start(ExamStartRequest $request)
    {
        $user = $request->user();
        $validated = $request->validated();
        $packageId = $validated['package_id'];
        $access = ProgramAccess::query()
            ->forUser($user->id)
            ->findOrFail($validated['program_access_id']);
        $this->assessmentAccess->authorize($user, $access, $packageId);

        // Check for existing session
        $session = ExamSession::where('user_id', $user->id)
            ->where('package_id', $packageId)
            ->where('program_access_id', $access->id)
            ->latest()
            ->first();

        // If no session or last session is finished, create new one
        if (! $session || $session->status === 'finished' || $session->status === 'expired') {
            $session = ExamSession::create([
                'user_id' => $user->id,
                'package_id' => $packageId,
                'program_access_id' => $access->id,
                'status' => 'scheduled',
            ]);
        }

        // Update session status if scheduled
        if ($session->status === 'scheduled') {
            $session->update([
                'status' => 'ongoing',
                'start_at' => now(),
            ]);
        }

        // Check for unfinished attempt
        $existingAttempt = $session->attempts()
            ->whereNull('submitted_at')
            ->latest()
            ->first();

        if ($existingAttempt) {
            return $this->successResponse([
                'session_id' => $session->id,
                'attempt_id' => $existingAttempt->id,
                'restored' => true,
            ], 'Resuming existing exam attempt');
        }

        // Create new attempt
        $attempt = $session->attempts()->create([
            'started_at' => now(),
            'score_total' => 0,
        ]);

        return $this->successResponse([
            'session_id' => $session->id,
            'attempt_id' => $attempt->id,
            'restored' => false,
        ], 'Exam started successfully');
    }

    /**
     * Get questions for an attempt.
     */
    #[OA\Get(
        path: '/api/v1/exams/{attempt}/questions',
        summary: 'Get questions for an attempt',
        description: 'Retrieves questions for the specified attempt. Generates them if not already created.',
        tags: ['CBT'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(
                name: 'attempt',
                description: 'Exam attempt ID',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer')
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Questions retrieved successfully',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'Questions retrieved successfully'),
                        new OA\Property(
                            property: 'data',
                            type: 'array',
                            items: new OA\Items(
                                properties: [
                                    new OA\Property(property: 'id', type: 'integer', example: 101),
                                    new OA\Property(property: 'question_id', type: 'integer', example: 50),
                                    new OA\Property(property: 'type', type: 'string', example: 'mcq'),
                                    new OA\Property(property: 'stem', type: 'string', example: 'What is 2+2?'),
                                    new OA\Property(property: 'options', type: 'object', example: ['A' => '3', 'B' => '4']),
                                    new OA\Property(property: 'user_answer', type: 'string', example: null, nullable: true),
                                    new OA\Property(property: 'flagged', type: 'boolean', example: false),
                                ]
                            )
                        ),
                    ]
                )
            ),
            new OA\Response(response: 404, description: 'Exam attempt not found'),
            new OA\Response(response: 401, description: 'Unauthorized'),
        ]
    )]
    public function getQuestions(Request $request, $attemptId)
    {
        $user = $request->user();

        $attempt = ExamAttempt::with(['session.package.sections', 'session.programAccess'])
            ->where('id', $attemptId)
            ->first();

        if (! $attempt) {
            return $this->notFoundResponse('Exam attempt not found');
        }

        // Verify ownership
        if ($attempt->session->user_id !== $user->id) {
            return $this->unauthorizedResponse();
        }

        $this->authorizeAttempt($user, $attempt, true);

        // Check if answers already generated
        $answers = $attempt->answers()->with('question')->get();

        if ($answers->isEmpty()) {
            // Generate questions
            $answers = $this->generateQuestions($attempt);
        }

        // Transform response (hide answer keys)
        $data = $answers->map(function ($ans) {
            $q = $ans->question;

            return [
                'id' => $ans->id, // answer id (to submit answer)
                'question_id' => $q->id,
                'type' => $q->type,
                'stem' => $q->stem,
                'options' => $q->options, // MCQ options
                // 'answer_key' => HIDDEN
                'user_answer' => $ans->answer,
                'flagged' => false,
            ];
        });

        return $this->successResponse($data, 'Questions retrieved successfully');
    }

    /**
     * Autosave answer.
     */
    #[OA\Post(
        path: '/api/v1/exams/{attempt}/answers',
        summary: 'Autosave answer',
        description: 'Saves the user answer for a specific question.',
        tags: ['CBT'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(
                name: 'attempt',
                description: 'Exam attempt ID',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer')
            ),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['question_id'],
                properties: [
                    new OA\Property(property: 'question_id', type: 'integer', example: 50),
                    new OA\Property(property: 'answer', type: 'string', example: 'B', nullable: true),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Answer saved',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'Answer saved'),
                        new OA\Property(property: 'data', example: null),
                    ]
                )
            ),
            new OA\Response(response: 404, description: 'Question not found in this attempt'),
            new OA\Response(response: 400, description: 'Exam already submitted'),
        ]
    )]
    public function saveAnswer(Request $request, $attemptId)
    {
        $request->validate([
            'question_id' => 'required|exists:questions,id',
            'answer' => 'nullable', // Can be string, array, etc.
        ]);

        $user = $request->user();

        $attempt = ExamAttempt::with('session.programAccess')->where('id', $attemptId)->first();

        if (! $attempt) {
            return $this->notFoundResponse('Exam attempt not found');
        }

        if ($attempt->session->user_id !== $user->id) {
            return $this->unauthorizedResponse();
        }

        $this->authorizeAttempt($user, $attempt);

        if ($attempt->submitted_at) {
            return $this->errorResponse('Exam already submitted', 400);
        }

        $answer = ExamAnswer::where('attempt_id', $attempt->id)
            ->where('question_id', $request->question_id)
            ->first();

        if (! $answer) {
            return $this->errorResponse('Question not found in this attempt', 404);
        }

        $answer->update([
            'answer' => $request->answer,
        ]);

        return $this->successResponse(null, 'Answer saved');
    }

    /**
     * Submit exam and calculate score.
     */
    #[OA\Post(
        path: '/api/v1/exams/{attempt}/submit',
        summary: 'Submit exam',
        description: 'Submits the exam, calculates the score, and finishes the session.',
        tags: ['CBT'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(
                name: 'attempt',
                description: 'Exam attempt ID',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer')
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Exam submitted successfully',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'Exam submitted successfully'),
                        new OA\Property(
                            property: 'data',
                            properties: [
                                new OA\Property(property: 'score', type: 'integer', example: 85),
                                new OA\Property(property: 'submitted_at', type: 'string', format: 'date-time'),
                            ],
                            type: 'object'
                        ),
                    ]
                )
            ),
            new OA\Response(response: 400, description: 'Exam already submitted'),
        ]
    )]
    public function submit(Request $request, $attemptId)
    {
        $user = $request->user();

        $attempt = ExamAttempt::with(['answers.question', 'session.programAccess'])
            ->where('id', $attemptId)
            ->first();

        if (! $attempt) {
            return $this->notFoundResponse('Exam attempt not found');
        }

        if ($attempt->session->user_id !== $user->id) {
            return $this->unauthorizedResponse();
        }

        $this->authorizeAttempt($user, $attempt);

        if ($attempt->submitted_at) {
            return $this->errorResponse('Exam already submitted', 400);
        }

        // Calculate Score
        $totalScore = 0;

        DB::transaction(function () use ($attempt, $user, &$totalScore) {
            $access = ProgramAccess::query()->lockForUpdate()->findOrFail($attempt->session->program_access_id);
            $attempt = ExamAttempt::query()
                ->with(['answers.question', 'session'])
                ->lockForUpdate()
                ->findOrFail($attempt->id);

            foreach ($attempt->answers as $ans) {
                $question = $ans->question;
                $isCorrect = false;
                $score = 0;

                // Simple scoring logic for MCQ
                // Assuming answer_key and answer are comparable arrays/values
                if ($question->type === 'mcq' || $question->type === 'single') {
                    $correctAnswer = $question->answer_key;
                    $userAnswer = $ans->answer;

                    // Loose comparison for flexibility, or strict if standardized
                    if ($correctAnswer == $userAnswer) {
                        $isCorrect = true;
                        $score = 1; // Default score
                        // TODO: Implement weighted scoring based on question difficulty
                    }
                }

                $ans->update([
                    'is_correct' => $isCorrect,
                    'score' => $score,
                ]);

                $totalScore += $score;
            }

            $attempt->update([
                'submitted_at' => now(),
                'score_total' => $totalScore,
            ]);

            // Mark session as finished
            $attempt->session->update([
                'status' => 'finished',
                'end_at' => now(),
            ]);

            $this->activities->handle(
                $access,
                'assessment',
                'assessment_submitted',
                "exam-attempt:{$attempt->id}",
                $user,
                ExamAttempt::class,
                (string) $attempt->id,
                [
                    'package_id' => $attempt->session->package_id,
                    'score' => $totalScore,
                ],
            );
        });

        $attempt->refresh();

        return $this->successResponse([
            'score' => $totalScore,
            'submitted_at' => $attempt->submitted_at,
        ], 'Exam submitted successfully');
    }

    /**
     * Get exam result.
     */
    #[OA\Get(
        path: '/api/v1/exams/{attempt}/result',
        summary: 'Get exam result',
        description: 'Retrieves the result of a submitted exam.',
        tags: ['CBT'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(
                name: 'attempt',
                description: 'Exam attempt ID',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer')
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Exam result retrieved',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'Exam result retrieved'),
                        new OA\Property(
                            property: 'data',
                            properties: [
                                new OA\Property(property: 'attempt_id', type: 'integer', example: 1),
                                new OA\Property(property: 'package_id', type: 'integer', example: 10),
                                new OA\Property(property: 'package_name', type: 'string', example: 'Tryout SNBT 1'),
                                new OA\Property(property: 'score_total', type: 'integer', example: 85),
                                new OA\Property(property: 'submitted_at', type: 'string', format: 'date-time'),
                            ],
                            type: 'object'
                        ),
                    ]
                )
            ),
            new OA\Response(response: 400, description: 'Exam not yet submitted'),
        ]
    )]
    public function getResult(Request $request, $attemptId)
    {
        $user = $request->user();
        $attempt = ExamAttempt::with(['session.package', 'session.programAccess'])
            ->where('id', $attemptId)
            ->first();

        if (! $attempt) {
            return $this->notFoundResponse('Exam attempt not found');
        }

        if ($attempt->session->user_id !== $user->id) {
            return $this->unauthorizedResponse();
        }

        $this->authorizeAttempt($user, $attempt, true);

        if (! $attempt->submitted_at) {
            return $this->errorResponse('Exam not yet submitted', 400);
        }

        return $this->successResponse([
            'attempt_id' => $attempt->id,
            'package_id' => $attempt->session->package_id,
            'package_name' => $attempt->session->package->name,
            'score_total' => $attempt->score_total,
            'submitted_at' => $attempt->submitted_at,
            // Add detailed breakdown if needed
        ], 'Exam result retrieved');
    }

    private function generateQuestions(ExamAttempt $attempt)
    {
        $package = $attempt->session->package;
        $sections = $package->sections;

        $generatedAnswers = collect([]);

        DB::transaction(function () use ($sections, $attempt, &$generatedAnswers) {
            foreach ($sections as $section) {
                // Simple random selection for now
                $questions = Question::where('bank_id', $section->bank_id)
                    ->inRandomOrder()
                    ->limit($section->num_questions)
                    ->get();

                foreach ($questions as $question) {
                    $ans = ExamAnswer::create([
                        'attempt_id' => $attempt->id,
                        'question_id' => $question->id,
                        'answer' => null,
                        'is_correct' => false,
                        'score' => 0,
                    ]);
                    $ans->setRelation('question', $question);
                    $generatedAnswers->push($ans);
                }
            }
        });

        return $generatedAnswers;
    }

    private function authorizeAttempt(User $user, ExamAttempt $attempt, bool $readOnly = false): void
    {
        $this->assessmentAccess->authorize(
            $user,
            $attempt->session->programAccess,
            $attempt->session->package_id,
            $readOnly,
        );
    }
}
