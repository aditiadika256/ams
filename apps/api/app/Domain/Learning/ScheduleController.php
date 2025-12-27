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
     *     @OA\Response(response=200, description="List of schedules")
     * )
     */
    public function index(Mentor $mentor)
    {
        return response()->json($mentor->schedules);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/learning/mentors/{mentor}/schedules",
     *     summary="Update mentor schedules",
     *     tags={"Learning"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"schedules"},
     *             @OA\Property(
     *                 property="schedules",
     *                 type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="day_of_week", type="integer", example=1),
     *                     @OA\Property(property="start_time", type="string", example="09:00"),
     *                     @OA\Property(property="end_time", type="string", example="17:00")
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(response=200, description="Schedules updated")
     * )
     */
    public function update(Request $request, Mentor $mentor)
    {
        $request->validate([
            'schedules' => 'required|array',
            'schedules.*.day_of_week' => 'required|integer|between:0,6',
            'schedules.*.start_time' => 'required|date_format:H:i',
            'schedules.*.end_time' => 'required|date_format:H:i|after:schedules.*.start_time',
        ]);

        DB::transaction(function () use ($mentor, $request) {
            // Replace all schedules
            $mentor->schedules()->delete();

            $schedules = [];
            foreach ($request->schedules as $schedule) {
                $schedules[] = new MentorSchedule($schedule);
            }

            $mentor->schedules()->saveMany($schedules);
        });

        return response()->json($mentor->load('schedules'));
    }
}
