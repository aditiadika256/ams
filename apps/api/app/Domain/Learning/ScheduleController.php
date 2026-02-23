<?php

namespace App\Domain\Learning;

use App\Http\Controllers\Controller;
use App\Models\Mentor;
use App\Models\MentorSchedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ScheduleController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/v1/learning/mentors/{mentor}/schedules",
     *     summary="Get mentor schedules",
     *     tags={"Learning"},
     *     @OA\Parameter(
     *         name="start_date",
     *         in="query",
     *         description="Filter schedules starting from this date (Y-m-d)",
     *         required=false,
     *         @OA\Schema(type="string", format="date")
     *     ),
     *     @OA\Parameter(
     *         name="end_date",
     *         in="query",
     *         description="Filter schedules up to this date (Y-m-d)",
     *         required=false,
     *         @OA\Schema(type="string", format="date")
     *     ),
     *     @OA\Response(response=200, description="List of schedules")
     * )
     */
    public function index(Request $request, Mentor $mentor)
    {
        $query = $mentor->schedules();

        if ($request->has('start_date')) {
            $query->whereDate('start_time', '>=', $request->start_date);
        }
        
        if ($request->has('end_date')) {
            $query->whereDate('start_time', '<=', $request->end_date);
        }

        $schedules = $query->orderBy('start_time')->get();

        return response()->json($schedules);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/learning/mentors/{mentor}/schedules",
     *     summary="Create a new mentor schedule session",
     *     tags={"Learning"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"start_time", "end_time"},
     *             @OA\Property(property="title", type="string", example="PPC2+] 1SMP Athaya"),
     *             @OA\Property(property="description", type="string", example="B.Ing - P3"),
     *             @OA\Property(property="subject", type="string", example="B.Ing"),
     *             @OA\Property(property="location", type="string", example="Rumah Ibu Wiwik"),
     *             @OA\Property(property="status", type="string", example="scheduled"),
     *             @OA\Property(property="guest_email", type="string", example="student@example.com"),
     *             @OA\Property(property="color_hex", type="string", example="#5cda1c"),
     *             @OA\Property(property="start_time", type="string", format="date-time", example="2024-10-24 19:00:00"),
     *             @OA\Property(property="end_time", type="string", format="date-time", example="2024-10-24 20:30:00")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Schedule created")
     * )
     */
    public function store(Request $request, Mentor $mentor)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'subject' => 'nullable|string|max:100',
            'location' => 'nullable|string|max:255',
            'status' => 'nullable|string|in:scheduled,done,rescheduled,cancelled',
            'guest_email' => 'nullable|email|max:255',
            'color_hex' => 'nullable|string|max:7',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
        ]);

        $schedule = $mentor->schedules()->create($validated);

        return response()->json($schedule, 201);
    }

    /**
     * @OA\Put(
     *     path="/api/v1/learning/mentors/{mentor}/schedules/{schedule}",
     *     summary="Update a mentor schedule session",
     *     tags={"Learning"},
     *     @OA\Parameter(name="schedule", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="title", type="string"),
     *             @OA\Property(property="description", type="string"),
     *             @OA\Property(property="subject", type="string"),
     *             @OA\Property(property="location", type="string"),
     *             @OA\Property(property="status", type="string"),
     *             @OA\Property(property="guest_email", type="string"),
     *             @OA\Property(property="color_hex", type="string"),
     *             @OA\Property(property="start_time", type="string", format="date-time"),
     *             @OA\Property(property="end_time", type="string", format="date-time")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Schedule updated")
     * )
     */
    public function update(Request $request, Mentor $mentor, MentorSchedule $schedule)
    {
        if ($schedule->mentor_id !== $mentor->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'subject' => 'nullable|string|max:100',
            'location' => 'nullable|string|max:255',
            'status' => 'nullable|string|in:scheduled,done,rescheduled,cancelled',
            'guest_email' => 'nullable|email|max:255',
            'color_hex' => 'nullable|string|max:7',
            'start_time' => 'sometimes|required|date',
            'end_time' => 'sometimes|required|date|after:start_time',
        ]);

        $schedule->update($validated);

        return response()->json($schedule);
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/learning/mentors/{mentor}/schedules/{schedule}",
     *     summary="Delete a mentor schedule session",
     *     tags={"Learning"},
     *     @OA\Parameter(name="schedule", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=204, description="Schedule deleted")
     * )
     */
    public function destroy(Mentor $mentor, MentorSchedule $schedule)
    {
        if ($schedule->mentor_id !== $mentor->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $schedule->delete();

        return response()->noContent();
    }
}
