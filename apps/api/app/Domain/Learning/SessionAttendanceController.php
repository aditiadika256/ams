<?php

namespace App\Domain\Learning;

use App\Domain\Finance\WalletService;
use App\Enums\WalletType;
use App\Http\Controllers\Controller;
use App\Models\Mentor;
use App\Models\MentorSessionLog;
use App\Models\ProgramAccess;
use App\Models\ProgramSession;
use App\Models\SessionAttendance;
use App\Models\SessionMentorAssignment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: 'Learning - Sessions & Attendance',
    description: 'Attendance, Session Logging, and Mentor Honor Management'
)]
class SessionAttendanceController extends Controller
{
    public function __construct(
        private readonly WalletService $walletService,
    ) {}

    /**
     * Get enrolled students and attendance status for a session.
     */
    public function index(Request $request, int $sessionId): JsonResponse
    {
        $session = ProgramSession::with('batch.program')->findOrFail($sessionId);

        // Get all active program accesses enrolled in this session's batch
        $enrolledAccesses = ProgramAccess::with('user:id,name,email,avatar_url')
            ->where('program_batch_id', $session->program_batch_id)
            ->whereIn('status', ['ACTIVE', 'WAITING'])
            ->get();

        $existingAttendances = SessionAttendance::where('program_session_id', $sessionId)
            ->get()
            ->keyBy('program_access_id');

        $students = $enrolledAccesses->map(function ($access) use ($existingAttendances) {
            $att = $existingAttendances->get($access->id);

            return [
                'program_access_id' => $access->id,
                'user_id' => $access->user_id,
                'name' => $access->user?->name ?? 'Student',
                'email' => $access->user?->email,
                'avatar_url' => $access->user?->avatar_url,
                'status' => $att?->status ?? 'absent',
                'attended_at' => $att?->attended_at,
                'notes' => $att?->notes,
            ];
        });

        $log = MentorSessionLog::where('program_session_id', $sessionId)->first();

        return response()->json([
            'success' => true,
            'data' => [
                'session' => [
                    'id' => $session->id,
                    'title' => $session->title,
                    'starts_at' => $session->starts_at,
                    'ends_at' => $session->ends_at,
                    'status' => $session->status,
                    'meeting_url' => $session->meeting_url,
                ],
                'students' => $students,
                'log' => $log,
            ],
        ]);
    }

    /**
     * Save student attendance records for a session (Admin / Mentor).
     */
    public function recordAttendance(Request $request, int $sessionId): JsonResponse
    {
        $session = ProgramSession::findOrFail($sessionId);
        $user = $request->user();

        $validated = $request->validate([
            'attendances' => 'required|array|min:1',
            'attendances.*.program_access_id' => 'required|integer',
            'attendances.*.user_id' => 'required|integer',
            'attendances.*.status' => 'required|in:present,absent,late,excused',
            'attendances.*.notes' => 'nullable|string|max:255',
        ]);

        DB::transaction(function () use ($sessionId, $validated, $user) {
            foreach ($validated['attendances'] as $item) {
                SessionAttendance::updateOrCreate(
                    [
                        'program_session_id' => $sessionId,
                        'program_access_id' => $item['program_access_id'],
                    ],
                    [
                        'user_id' => $item['user_id'],
                        'status' => $item['status'],
                        'attended_at' => $item['status'] === 'present' ? now() : null,
                        'notes' => $item['notes'] ?? null,
                        'recorded_by' => $user->id,
                    ]
                );
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Presensi siswa berhasil disimpan.',
        ]);
    }

    /**
     * Mentor completes session, locks attendance, and auto-credits honor to mentor wallet.
     */
    public function completeAndLog(Request $request, int $sessionId): JsonResponse
    {
        $session = ProgramSession::findOrFail($sessionId);
        $user = $request->user();

        $mentor = Mentor::where('user_id', $user->id)->first();
        if (! $mentor) {
            return response()->json(['message' => 'Hanya mentor yang dapat mencatatkan sesi mengajar.'], 403);
        }

        $validated = $request->validate([
            'topic' => 'required|string|max:255',
            'notes' => 'nullable|string',
            'duration_minutes' => 'nullable|integer|min:15|max:480',
            'hourly_rate' => 'nullable|numeric|min:0',
        ]);

        $duration = $validated['duration_minutes'] ?? 90;
        $hourlyRate = $validated['hourly_rate'] ?? 75000.00; // default standard honor
        $presentCount = SessionAttendance::where('program_session_id', $sessionId)
            ->where('status', 'present')
            ->count();

        $totalHonor = round(($duration / 60) * (float) $hourlyRate, 2);

        $log = DB::transaction(function () use ($session, $mentor, $user, $validated, $duration, $hourlyRate, $presentCount, $totalHonor) {
            $log = MentorSessionLog::updateOrCreate(
                [
                    'program_session_id' => $session->id,
                    'mentor_id' => $mentor->id,
                ],
                [
                    'user_id' => $user->id,
                    'topic' => $validated['topic'],
                    'notes' => $validated['notes'] ?? null,
                    'student_count' => $presentCount,
                    'duration_minutes' => $duration,
                    'hourly_rate' => $hourlyRate,
                    'total_honor' => $totalHonor,
                    'status' => 'locked',
                    'locked_at' => now(),
                ]
            );

            // Auto-credit honor to Mentor Wallet
            if ($totalHonor > 0) {
                $wallet = $this->walletService->getOrCreateWallet($user, WalletType::Mentor);
                $this->walletService->credit(
                    $wallet,
                    $totalHonor,
                    MentorSessionLog::class,
                    (string) $log->id,
                    "Honor Mengajar Sesi #{$session->id}: {$validated['topic']} ({$duration} menit)"
                );
            }

            $session->update(['status' => 'COMPLETED']);

            return $log;
        });

        return response()->json([
            'success' => true,
            'message' => 'Sesi mengajar selesai. Presensi dikunci dan honor telah masuk ke Dompet Mentor Anda.',
            'data' => $log,
        ]);
    }

    /**
     * Mentor: List sessions assigned to the authenticated mentor.
     */
    public function mentorSchedules(Request $request): JsonResponse
    {
        $user = $request->user();
        $mentor = Mentor::where('user_id', $user->id)->first();
        if (! $mentor) {
            return response()->json(['success' => true, 'data' => []]);
        }

        $sessionIds = SessionMentorAssignment::where('mentor_id', $mentor->id)
            ->where('status', 'ACTIVE')
            ->pluck('program_session_id');

        $sessions = ProgramSession::with(['batch.program'])
            ->whereIn('id', $sessionIds)
            ->orderBy('starts_at')
            ->get()
            ->map(function ($s) use ($mentor) {
                $log = MentorSessionLog::where('program_session_id', $s->id)
                    ->where('mentor_id', $mentor->id)
                    ->first();

                return [
                    'id' => $s->id,
                    'title' => $s->title,
                    'program_name' => $s->batch?->program?->name ?? 'Program',
                    'batch_name' => $s->batch?->name,
                    'starts_at' => $s->starts_at,
                    'ends_at' => $s->ends_at,
                    'meeting_url' => $s->meeting_url,
                    'status' => $s->status,
                    'is_logged' => $log !== null,
                    'honor' => $log?->total_honor,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $sessions,
        ]);
    }

    /**
     * Mentor: List completed session logs (Rekapitulasi honor).
     */
    public function sessionLogs(Request $request): JsonResponse
    {
        $user = $request->user();
        $logs = MentorSessionLog::with(['session.batch.program'])
            ->where('user_id', $user->id)
            ->latest('id')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $logs,
        ]);
    }

    /**
     * Mentor: Generate Digital Payslip data for a completed session.
     */
    public function digitalPayslip(Request $request, int $logId): JsonResponse
    {
        $user = $request->user();
        $log = MentorSessionLog::with(['session.batch.program', 'mentor.user'])
            ->where('user_id', $user->id)
            ->findOrFail($logId);

        $payslipNumber = 'SLIP-' . str_pad((string) $log->id, 6, '0', STR_PAD_LEFT) . '-' . date('Ym');

        return response()->json([
            'success' => true,
            'data' => [
                'payslip_number' => $payslipNumber,
                'issued_at' => $log->locked_at ?? $log->created_at,
                'mentor' => [
                    'name' => $user->name,
                    'email' => $user->email,
                    'specialization' => $log->mentor->specialization,
                ],
                'session' => [
                    'id' => $log->session->id,
                    'title' => $log->session->title,
                    'program' => $log->session->batch?->program?->name,
                    'batch' => $log->session->batch?->name,
                    'topic' => $log->topic,
                    'student_count' => $log->student_count,
                    'duration_minutes' => $log->duration_minutes,
                ],
                'payment' => [
                    'hourly_rate' => $log->hourly_rate,
                    'total_honor' => $log->total_honor,
                    'status' => 'PAID_TO_WALLET',
                ],
            ],
        ]);
    }
}
