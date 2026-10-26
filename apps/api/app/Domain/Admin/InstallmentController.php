<?php

namespace App\Domain\Admin;

use App\Http\Controllers\Controller;
use App\Models\EnrollmentInstallmentTracker;
use App\Models\Program;
use App\Models\ProgramAccess;
use App\Models\ProgramInstallment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: 'Admin - Installment & Drip Lock',
    description: 'Endpoints for student installment payment tracking, access locking, and branch manual bypass'
)]
class InstallmentController extends Controller
{
    #[OA\Get(
        path: '/api/v1/admin/enrollments/installments',
        summary: 'List enrollments with installment tracking statuses',
        tags: ['Admin - Installment & Drip Lock'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'status', in: 'query', required: false, schema: new OA\Schema(type: 'string', enum: ['all', 'pending', 'paid', 'overdue', 'bypassed'])),
            new OA\Parameter(name: 'program_id', in: 'query', required: false, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'search', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 1)),
            new OA\Parameter(name: 'per_page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 20)),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Installments retrieved successfully'),
        ]
    )]
    public function index(Request $request): JsonResponse
    {
        $query = ProgramAccess::with([
            'user:id,name,email',
            'program:id,title,code,price',
            'installmentTrackers.installment',
            'installmentTrackers.bypassUser:id,name',
        ]);

        if ($request->filled('program_id')) {
            $query->where('program_id', $request->query('program_id'));
        }

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('email', 'ilike', "%{$search}%");
            });
        }

        if ($request->filled('status') && $request->query('status') !== 'all') {
            $status = $request->query('status');
            $query->whereHas('installmentTrackers', function ($q) use ($status) {
                $q->where('status', $status);
            });
        }

        $enrollments = $query->latest()->paginate($request->query('per_page', 20));

        $data = [];
        foreach ($enrollments->items() as $access) {
            $trackers = $access->installmentTrackers;
            $allPaid = $trackers->isNotEmpty() && $trackers->every(fn ($t) => in_array($t->status, ['paid', 'bypassed']));
            $hasOverdue = $trackers->contains(fn ($t) => $t->status === 'overdue' || ($t->status === 'pending' && $t->due_date < now()));

            $overallStatus = 'FULL_PAID';
            if ($trackers->isEmpty()) {
                $overallStatus = 'REGULAR_ACCESS';
            } elseif ($hasOverdue) {
                $overallStatus = 'OVERDUE_LOCKED';
            } elseif (! $allPaid) {
                $overallStatus = 'PARTIAL_ACTIVE';
            }

            $data[] = [
                'access_id' => $access->id,
                'user_id' => $access->user_id,
                'user_name' => $access->user?->name,
                'user_email' => $access->user?->email,
                'program_id' => $access->program_id,
                'program_title' => $access->program?->title,
                'program_price' => (float) ($access->program?->price ?? 0),
                'overall_payment_status' => $overallStatus,
                'access_status' => $access->status,
                'starts_at' => $access->starts_at?->toIso8601String(),
                'trackers' => $trackers->map(fn ($t) => [
                    'id' => $t->id,
                    'term_number' => $t->installment?->term_number,
                    'title' => $t->installment?->title ?? "Termin {$t->installment?->term_number}",
                    'amount' => (float) $t->installment?->amount,
                    'amount_paid' => (float) $t->amount_paid,
                    'due_date' => $t->due_date?->toIso8601String(),
                    'paid_at' => $t->paid_at?->toIso8601String(),
                    'status' => $t->status === 'pending' && $t->due_date < now() ? 'overdue' : $t->status,
                    'bypassed_by' => $t->bypassUser?->name,
                    'bypass_reason' => $t->bypass_reason,
                ]),
            ];
        }

        return response()->json([
            'success' => true,
            'message' => 'Enrollment installments retrieved successfully',
            'data' => $data,
            'meta' => [
                'current_page' => $enrollments->currentPage(),
                'last_page' => $enrollments->lastPage(),
                'per_page' => $enrollments->perPage(),
                'total' => $enrollments->total(),
            ],
        ]);
    }

    #[OA\Post(
        path: '/api/v1/admin/enrollments/installments/{trackerId}/bypass',
        summary: 'Manual bypass an overdue or pending installment term',
        tags: ['Admin - Installment & Drip Lock'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'trackerId', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['reason'],
                properties: [
                    new OA\Property(property: 'reason', type: 'string', example: 'Dispensasi perpanjangan dari Kepala Cabang'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Bypass executed successfully'),
            new OA\Response(response: 404, description: 'Tracker not found'),
        ]
    )]
    public function manualBypass(Request $request, $trackerId): JsonResponse
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $tracker = EnrollmentInstallmentTracker::find($trackerId);
        if (! $tracker) {
            return response()->json(['success' => false, 'message' => 'Installment tracker record not found'], 404);
        }

        $tracker->status = 'bypassed';
        $tracker->bypassed_by = $request->user()->id;
        $tracker->bypass_reason = $validated['reason'];
        $tracker->save();

        return response()->json([
            'success' => true,
            'message' => 'Manual bypass granted successfully. Syllabus section unlocked for student.',
            'data' => $tracker,
        ]);
    }

    #[OA\Post(
        path: '/api/v1/admin/enrollments/installments/{trackerId}/mark-paid',
        summary: 'Mark an installment term as paid',
        tags: ['Admin - Installment & Drip Lock'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'trackerId', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(
            required: false,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'amount_paid', type: 'number', example: 500000),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Marked paid successfully'),
        ]
    )]
    public function markPaid(Request $request, $trackerId): JsonResponse
    {
        $tracker = EnrollmentInstallmentTracker::with('installment')->find($trackerId);
        if (! $tracker) {
            return response()->json(['success' => false, 'message' => 'Installment tracker not found'], 404);
        }

        $tracker->status = 'paid';
        $tracker->paid_at = now();
        $tracker->amount_paid = $request->input('amount_paid', $tracker->installment?->amount ?? 0);
        $tracker->save();

        return response()->json([
            'success' => true,
            'message' => 'Installment payment recorded successfully',
            'data' => $tracker,
        ]);
    }
}
