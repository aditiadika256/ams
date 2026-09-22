<?php

namespace App\Domain\Certificate;

use App\Http\Controllers\Controller;
use App\Models\ExamAttempt;
use App\Models\ProgramAccess;
use App\Models\ProgramCertificate;
use App\Models\ProgramSession;
use App\Models\SessionAttendance;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CertificateController extends Controller
{
    /**
     * GET /api/v1/certificates/verify/{certificateNumber}
     * Public verification endpoint for authenticating issued certificates.
     */
    public function verify(string $certificateNumber): JsonResponse
    {
        $certificate = ProgramCertificate::with(['programAccess.user', 'programAccess.program'])
            ->where('certificate_number', $certificateNumber)
            ->first();

        if (! $certificate) {
            return response()->json([
                'success' => false,
                'message' => 'Nomor sertifikat tidak ditemukan atau tidak valid.',
            ], 404);
        }

        $isValid = $certificate->revoked_at === null;
        $snapshot = $certificate->snapshot ?? [];

        return response()->json([
            'success' => true,
            'data' => [
                'certificate_number' => $certificate->certificate_number,
                'is_valid' => $isValid,
                'status' => $isValid ? 'VALID' : 'REVOKED',
                'student_name' => $snapshot['user_name'] ?? $certificate->programAccess?->user?->name ?? 'Student',
                'program_name' => $snapshot['program_name'] ?? $certificate->programAccess?->program?->name ?? 'Program Arkanin',
                'batch_name' => $snapshot['batch_name'] ?? $certificate->programAccess?->batch?->name ?? 'Batch Standar',
                'issued_at' => $certificate->issued_at,
                'revoked_at' => $certificate->revoked_at,
                'verification_url' => url("/certificates/verify/{$certificate->certificate_number}"),
            ],
        ]);
    }

    /**
     * GET /api/v1/workspace/certificates/{accessId}
     * Check qualification and retrieve/auto-issue digital certificate for student.
     * Rule: Passing grade CBT lulus (score >= 60) AND Presensi kelas >= 80%.
     */
    public function showOrClaim(Request $request, int $accessId): JsonResponse
    {
        $user = $request->user();

        $access = ProgramAccess::with(['program', 'batch'])
            ->where('id', $accessId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        // 1. Evaluate CBT Score Requirement (passing score >= 60)
        $latestAttempt = ExamAttempt::whereHas('session', fn ($q) => $q->where('program_access_id', $access->id))
            ->orderByDesc('score_total')
            ->first();

        $cbtScore = $latestAttempt ? (float) $latestAttempt->score_total : 0.0;
        $cbtPassed = $cbtScore >= 60.0;

        // 2. Evaluate Attendance Requirement (presensi >= 80%)
        $totalSessions = 0;
        $presentSessions = 0;

        if ($access->program_batch_id) {
            $totalSessions = ProgramSession::where('program_batch_id', $access->program_batch_id)->count();
            $presentSessions = SessionAttendance::where('program_access_id', $access->id)
                ->where('status', 'present')
                ->count();
        }

        $attendanceRate = $totalSessions > 0 ? round(($presentSessions / $totalSessions) * 100, 1) : 100.0;
        $attendancePassed = $attendanceRate >= 80.0;

        $isEligible = $cbtPassed && $attendancePassed;

        // Find or Auto-Issue Certificate if eligible
        $certificate = ProgramCertificate::where('program_access_id', $access->id)->first();

        if (! $certificate && $isEligible) {
            $uniqueSerial = 'ARK-CERT-' . date('Ym') . '-' . strtoupper(Str::random(6));

            $certificate = ProgramCertificate::create([
                'program_access_id' => $access->id,
                'certificate_number' => $uniqueSerial,
                'snapshot' => [
                    'user_id' => $user->id,
                    'user_name' => $user->name,
                    'program_id' => $access->program_id,
                    'program_name' => $access->program?->name ?? 'Program Bimbingan',
                    'batch_id' => $access->program_batch_id,
                    'batch_name' => $access->batch?->name ?? 'Reguler',
                    'cbt_score' => $cbtScore,
                    'attendance_rate' => $attendanceRate,
                ],
                'issued_at' => now(),
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'is_eligible' => $isEligible,
                'criteria' => [
                    'cbt_score' => $cbtScore,
                    'cbt_passing_grade' => 60,
                    'cbt_passed' => $cbtPassed,
                    'attendance_rate' => $attendanceRate,
                    'attendance_min_required' => 80,
                    'attendance_passed' => $attendancePassed,
                    'total_sessions' => $totalSessions,
                    'present_sessions' => $presentSessions,
                ],
                'certificate' => $certificate ? [
                    'id' => $certificate->id,
                    'certificate_number' => $certificate->certificate_number,
                    'issued_at' => $certificate->issued_at,
                    'is_valid' => $certificate->revoked_at === null,
                    'student_name' => $user->name,
                    'program_name' => $access->program?->name,
                    'batch_name' => $access->batch?->name,
                    'snapshot' => $certificate->snapshot,
                    'verification_url' => url("/certificates/verify/{$certificate->certificate_number}"),
                ] : null,
            ],
        ]);
    }

    /**
     * GET /api/v1/workspace/my-certificates
     * List all certificates earned by the authenticated student.
     */
    public function myCertificates(Request $request): JsonResponse
    {
        $user = $request->user();

        $certificates = ProgramCertificate::whereHas('programAccess', fn ($q) => $q->where('user_id', $user->id))
            ->with(['programAccess.program', 'programAccess.batch'])
            ->latest('id')
            ->get()
            ->map(fn ($cert) => [
                'id' => $cert->id,
                'certificate_number' => $cert->certificate_number,
                'program_name' => $cert->programAccess?->program?->name ?? $cert->snapshot['program_name'] ?? 'Program',
                'batch_name' => $cert->programAccess?->batch?->name ?? $cert->snapshot['batch_name'] ?? 'Batch',
                'issued_at' => $cert->issued_at,
                'is_valid' => $cert->revoked_at === null,
                'snapshot' => $cert->snapshot,
                'verification_url' => url("/certificates/verify/{$cert->certificate_number}"),
            ]);

        return response()->json([
            'success' => true,
            'data' => $certificates,
        ]);
    }
}
