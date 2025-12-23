<?php

namespace App\Domain\CBT;

use App\Http\Controllers\Controller;
use App\Models\ExamAttempt;
use App\Models\ProctorEvent;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class ProctorController extends Controller
{
    #[OA\Post(
        path: '/exams/session/{attemptId}/log',
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
                    new OA\Property(property: 'meta', type: 'object', example: ['reason' => 'User switched tab'])
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Event logged'),
            new OA\Response(response: 404, description: 'Attempt not found')
        ]
    )]
    public function logEvent(Request $request, $attemptId)
    {
        $user = $request->user();
        
        $attempt = ExamAttempt::with('session')
            ->where('id', $attemptId)
            ->first();

        if (!$attempt) {
            return $this->notFoundResponse('Exam attempt not found');
        }

        if ($attempt->session->user_id !== $user->id) {
            return $this->unauthorizedResponse();
        }

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
        path: '/exams/session/{attemptId}/heartbeat',
        summary: 'Send a heartbeat',
        description: 'Updates the last activity timestamp of the attempt.',
        tags: ['CBT'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Heartbeat received'),
            new OA\Response(response: 404, description: 'Attempt not found')
        ]
    )]
    public function heartbeat(Request $request, $attemptId)
    {
        $user = $request->user();
        
        $attempt = ExamAttempt::with('session')
            ->where('id', $attemptId)
            ->first();

        if (!$attempt) {
            return $this->notFoundResponse('Exam attempt not found');
        }

        if ($attempt->session->user_id !== $user->id) {
            return $this->unauthorizedResponse();
        }

        if ($attempt->submitted_at) {
            return $this->errorResponse('Exam already submitted', 400);
        }

        // Update timestamps to show activity
        $attempt->touch();
        $attempt->session->touch();

        return $this->successResponse(['status' => 'alive'], 'Heartbeat received');
    }
}
