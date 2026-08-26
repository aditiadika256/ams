<?php

namespace App\Domain\CBT;

use App\Http\Controllers\Controller;
use App\Models\ExamAttempt;
use App\Models\ProctorEvent;
use App\Support\Access\AssessmentAccessAuthorizer;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: 'CBT - Proctoring',
    description: 'Exam proctoring and monitoring endpoints'
)]
class ProctorController extends Controller
{
    public function __construct(private readonly AssessmentAccessAuthorizer $assessmentAccess) {}

    #[OA\Post(
        path: '/api/v1/exams/{attempt}/log',
        summary: 'Log a proctoring event',
        description: 'Logs events like focus lost, tab switch, etc.',
        tags: ['CBT'],
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['type'],
                properties: [
                    new OA\Property(property: 'type', type: 'string', example: 'focus_lost'),
                    new OA\Property(property: 'meta', type: 'object', example: ['reason' => 'User switched tab']),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Event logged'),
            new OA\Response(response: 404, description: 'Attempt not found'),
        ]
    )]
    public function logEvent(Request $request, $attemptId)
    {
        $user = $request->user();

        $attempt = ExamAttempt::with('session.programAccess')
            ->where('id', $attemptId)
            ->first();

        if (! $attempt) {
            return $this->notFoundResponse('Exam attempt not found');
        }

        if ($attempt->session->user_id !== $user->id) {
            return $this->unauthorizedResponse();
        }

        $this->assessmentAccess->authorize(
            $user,
            $attempt->session->programAccess,
            $attempt->session->package_id,
        );

        if ($attempt->submitted_at) {
            return $this->errorResponse('Exam already submitted', 400);
        }

        $event = ProctorEvent::create([
            'attempt_id' => $attempt->id,
            'type' => $request->type,
            'meta' => $request->meta,
        ]);

        return $this->successResponse($event, 'Event logged successfully');
    }

    #[OA\Post(
        path: '/api/v1/exams/{attempt}/heartbeat',
        summary: 'Send a heartbeat',
        description: 'Updates the last activity timestamp of the attempt.',
        tags: ['CBT'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Heartbeat received'),
            new OA\Response(response: 404, description: 'Attempt not found'),
        ]
    )]
    public function heartbeat(Request $request, $attemptId)
    {
        $user = $request->user();

        $attempt = ExamAttempt::with('session.programAccess')
            ->where('id', $attemptId)
            ->first();

        if (! $attempt) {
            return $this->notFoundResponse('Exam attempt not found');
        }

        if ($attempt->session->user_id !== $user->id) {
            return $this->unauthorizedResponse();
        }

        $this->assessmentAccess->authorize(
            $user,
            $attempt->session->programAccess,
            $attempt->session->package_id,
        );

        if ($attempt->submitted_at) {
            return $this->errorResponse('Exam already submitted', 400);
        }

        // Update timestamps to show activity
        $attempt->touch();
        $attempt->session->touch();

        return $this->successResponse(['status' => 'alive'], 'Heartbeat received');
    }
}
