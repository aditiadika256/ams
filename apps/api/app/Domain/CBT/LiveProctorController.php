<?php

namespace App\Domain\CBT;

use App\Http\Controllers\Controller;
use App\Models\ExamAttempt;
use App\Models\ExamPackage;
use App\Models\ExamSessionToken;
use App\Models\ProctorLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: 'CBT - Live Proctoring',
    description: 'Endpoints for real-time exam monitoring, dynamic token generation, and proctor control'
)]
class LiveProctorController extends Controller
{
    #[OA\Get(
        path: '/api/v1/assessment/proctor/live',
        summary: 'List active student exam attempts for proctoring grid',
        tags: ['CBT - Live Proctoring'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'package_id', in: 'query', required: false, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'status', in: 'query', required: false, schema: new OA\Schema(type: 'string', enum: ['all', 'active', 'idle', 'warned', 'disqualified', 'completed', 'paused'])),
            new OA\Parameter(name: 'search', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'per_page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 24)),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Live attempts retrieved successfully'),
        ]
    )]
    public function liveAttempts(Request $request): JsonResponse
    {
        $query = ExamAttempt::with([
            'session.package:id,name,visual_mode,duration_minutes',
            'session.user:id,name,email',
            'proctorLogs' => function ($q) {
                $q->latest()->limit(5);
            },
        ])
        ->where('row_status', 1);

        if ($request->filled('package_id')) {
            $query->whereHas('session', function ($q) use ($request) {
                $q->where('package_id', $request->query('package_id'));
            });
        }

        if ($request->filled('status') && $request->query('status') !== 'all') {
            $query->where('proctor_status', $request->query('status'));
        }

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->whereHas('session.user', function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('email', 'ilike', "%{$search}%");
            });
        }

        $attempts = $query->latest('started_at')->paginate($request->query('per_page', 24));

        return response()->json([
            'success' => true,
            'message' => 'Live attempts retrieved successfully',
            'data' => $attempts->items(),
            'meta' => [
                'current_page' => $attempts->currentPage(),
                'last_page' => $attempts->lastPage(),
                'per_page' => $attempts->perPage(),
                'total' => $attempts->total(),
            ],
        ]);
    }

    #[OA\Post(
        path: '/api/v1/assessment/proctor/tokens/generate',
        summary: 'Generate dynamic 6-character exam session token with 30m TTL',
        tags: ['CBT - Live Proctoring'],
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'package_id', type: 'integer', example: 1),
                    new OA\Property(property: 'session_id', type: 'integer', nullable: true),
                    new OA\Property(property: 'ttl_minutes', type: 'integer', default: 30),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Token generated successfully'),
        ]
    )]
    public function generateToken(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'package_id' => 'required|exists:exam_packages,id',
            'session_id' => 'nullable|exists:exam_sessions,id',
            'ttl_minutes' => 'nullable|integer|min:5|max:180',
        ]);

        $ttlMinutes = $validated['ttl_minutes'] ?? 30;
        $expiresAt = now()->addMinutes($ttlMinutes);

        // Deactivate previous active tokens for this package/session
        ExamSessionToken::where('package_id', $validated['package_id'])
            ->when(!empty($validated['session_id']), fn ($q) => $q->where('session_id', $validated['session_id']))
            ->where('is_active', true)
            ->update(['is_active' => false]);

        // Generate 6-character uppercase alphanumeric code
        $tokenCode = strtoupper(Str::random(6));

        $token = ExamSessionToken::create([
            'package_id' => $validated['package_id'],
            'session_id' => $validated['session_id'] ?? null,
            'token_code' => $tokenCode,
            'is_active' => true,
            'expires_at' => $expiresAt,
            'row_status' => 1,
        ]);

        // Cache in Redis for instant student validation (< 2ms)
        Cache::put("cbt_token_{$tokenCode}", [
            'token_id' => $token->id,
            'package_id' => $token->package_id,
            'session_id' => $token->session_id,
            'expires_at' => $expiresAt->toIso8601String(),
        ], $expiresAt);

        return response()->json([
            'success' => true,
            'message' => 'Dynamic token generated successfully',
            'data' => $token,
        ], 201);
    }

    #[OA\Get(
        path: '/api/v1/assessment/proctor/tokens/active',
        summary: 'Get active tokens for exam packages',
        tags: ['CBT - Live Proctoring'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Active tokens retrieved'),
        ]
    )]
    public function activeTokens(Request $request): JsonResponse
    {
        $tokens = ExamSessionToken::with('package:id,name')
            ->active()
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Active tokens retrieved successfully',
            'data' => $tokens,
        ]);
    }

    #[OA\Post(
        path: '/api/v1/assessment/proctor/attempts/{attemptId}/action',
        summary: 'Perform proctor action on student attempt (warn, pause, resume, reset, disqualify, force_submit)',
        tags: ['CBT - Live Proctoring'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'attemptId', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['action'],
                properties: [
                    new OA\Property(property: 'action', type: 'string', enum: ['warn', 'pause', 'resume', 'reset', 'disqualify', 'force_submit']),
                    new OA\Property(property: 'reason', type: 'string', example: 'Terdeteksi berpindah tab browser lebih dari 3 kali'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Action executed successfully'),
            new OA\Response(response: 404, description: 'Attempt not found'),
        ]
    )]
    public function attemptAction(Request $request, $attemptId): JsonResponse
    {
        $validated = $request->validate([
            'action' => 'required|string|in:warn,pause,resume,reset,disqualify,force_submit',
            'reason' => 'nullable|string|max:500',
        ]);

        $attempt = ExamAttempt::with('session.user')->find($attemptId);

        if (! $attempt) {
            return response()->json([
                'success' => false,
                'message' => 'Exam attempt not found',
            ], 404);
        }

        $action = $validated['action'];
        $reason = $validated['reason'] ?? 'Aksi pengawas ujian';
        $newStatus = $attempt->proctor_status;
        $severity = 'warning';

        switch ($action) {
            case 'warn':
                $newStatus = 'warned';
                $severity = 'warning';
                break;
            case 'pause':
                $newStatus = 'paused';
                $severity = 'warning';
                break;
            case 'resume':
                $newStatus = 'active';
                $severity = 'info';
                break;
            case 'reset':
                $newStatus = 'active';
                $attempt->started_at = now();
                $severity = 'warning';
                break;
            case 'disqualify':
                $newStatus = 'disqualified';
                $severity = 'critical';
                $attempt->submitted_at = now();
                $attempt->score_total = 0;
                break;
            case 'force_submit':
                $newStatus = 'completed';
                $severity = 'info';
                $attempt->submitted_at = now();
                break;
        }

        $attempt->proctor_status = $newStatus;
        $attempt->save();

        ProctorLog::create([
            'exam_attempt_id' => $attempt->id,
            'user_id' => $attempt->session->user_id,
            'event_type' => "proctor_{$action}",
            'severity' => $severity,
            'details' => [
                'action' => $action,
                'reason' => $reason,
                'admin_id' => $request->user()->id,
                'admin_name' => $request->user()->name,
            ],
            'resolved_at' => now(),
            'row_status' => 1,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Proctor action '{$action}' applied successfully",
            'data' => [
                'attempt_id' => $attempt->id,
                'proctor_status' => $attempt->proctor_status,
                'action' => $action,
            ],
        ]);
    }

    #[OA\Get(
        path: '/api/v1/assessment/proctor/incidents',
        summary: 'List proctor incident logs and fraud feed',
        tags: ['CBT - Live Proctoring'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'severity', in: 'query', required: false, schema: new OA\Schema(type: 'string', enum: ['all', 'info', 'warning', 'critical'])),
            new OA\Parameter(name: 'per_page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 20)),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Incidents retrieved successfully'),
        ]
    )]
    public function incidents(Request $request): JsonResponse
    {
        $query = ProctorLog::with(['user:id,name,email', 'attempt.session.package:id,name'])
            ->where('row_status', 1);

        if ($request->filled('severity') && $request->query('severity') !== 'all') {
            $query->where('severity', $request->query('severity'));
        }

        $incidents = $query->latest()->paginate($request->query('per_page', 20));

        return response()->json([
            'success' => true,
            'message' => 'Incidents retrieved successfully',
            'data' => $incidents->items(),
            'meta' => [
                'current_page' => $incidents->currentPage(),
                'last_page' => $incidents->lastPage(),
                'per_page' => $incidents->perPage(),
                'total' => $incidents->total(),
            ],
        ]);
    }
}
