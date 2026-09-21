<?php

namespace App\Domain\Learning;

use App\Http\Controllers\Controller;
use App\Models\Mentor;
use App\Models\MentorApplication;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: 'Learning - Mentor Recruitment',
    description: 'Teacher / Mentor Recruitment and Onboarding Pipeline'
)]
class MentorApplicationController extends Controller
{
    /**
     * Public submission of teacher application form.
     */
    public function apply(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'email' => 'required|email|max:150',
            'phone' => 'required|string|max:30',
            'specialization' => 'required|string|max:150',
            'ktp_number' => 'nullable|string|max:30',
            'cv_url' => 'nullable|string|max:500',
            'certificate_url' => 'nullable|string|max:500',
            'teaching_video_url' => 'nullable|string|max:500',
        ]);

        $user = $request->user('sanctum');
        if (! $user) {
            $user = User::where('email', $validated['email'])->first();
        }

        $application = MentorApplication::create([
            'user_id' => $user?->id,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'specialization' => $validated['specialization'],
            'ktp_number' => $validated['ktp_number'] ?? null,
            'cv_url' => $validated['cv_url'] ?? null,
            'certificate_url' => $validated['certificate_url'] ?? null,
            'teaching_video_url' => $validated['teaching_video_url'] ?? null,
            'status' => 'applied',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Lamaran calon pengajar berhasil dikirim. Tim rekrutmen kami akan segera meninjau berkas Anda.',
            'data' => $application,
        ], 201);
    }

    /**
     * Admin ASA: List applications with status filter.
     */
    public function index(Request $request): JsonResponse
    {
        $query = MentorApplication::with(['reviewer:id,name', 'user:id,name,email']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(fn ($q) => $q->whereLike('name', "%{$search}%")->orWhereLike('email', "%{$search}%"));
        }

        $applications = $query->latest('id')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $applications,
        ]);
    }

    /**
     * Admin ASA: Show application details.
     */
    public function show(int $id): JsonResponse
    {
        $application = MentorApplication::with(['reviewer:id,name', 'user'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $application,
        ]);
    }

    /**
     * Admin ASA: Update selection status & evaluation notes.
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:applied,under_review,assessment,interview,hired,rejected,withdrawn',
            'written_test_score' => 'nullable|numeric|min:0|max:100',
            'interview_notes' => 'nullable|string',
            'assigned_role' => 'nullable|in:mentor_utama,mentor_harian',
        ]);

        $application = MentorApplication::findOrFail($id);
        $admin = $request->user();

        DB::transaction(function () use ($application, $validated, $admin) {
            $application->update([
                'status' => $validated['status'],
                'written_test_score' => $validated['written_test_score'] ?? $application->written_test_score,
                'interview_notes' => $validated['interview_notes'] ?? $application->interview_notes,
                'assigned_role' => $validated['assigned_role'] ?? $application->assigned_role,
                'reviewed_by' => $admin->id,
                'reviewed_at' => now(),
            ]);

            // If hired, link/create Mentor record and assign mentor role
            if ($validated['status'] === 'hired') {
                $user = $application->user;
                if (! $user) {
                    $user = User::where('email', $application->email)->first();
                }

                if ($user) {
                    Mentor::firstOrCreate(
                        ['user_id' => $user->id],
                        [
                            'specialization' => $application->specialization,
                            'bio' => "Pengajar Arkanin ({$application->assigned_role})",
                            'is_active' => true,
                        ]
                    );

                    if (method_exists($user, 'assignRole')) {
                        try {
                            $user->assignRole('mentor');
                        } catch (\Throwable) {
                            // Ignore if role not defined in spatie yet
                        }
                    }
                }
            }
        });

        return response()->json([
            'success' => true,
            'message' => "Status pelamar berhasil diperbarui menjadi {$validated['status']}.",
            'data' => $application->fresh(),
        ]);
    }
}
