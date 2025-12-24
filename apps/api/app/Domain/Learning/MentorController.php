<?php

namespace App\Domain\Learning;

use App\Http\Controllers\Controller;
use App\Models\Mentor;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MentorController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/v1/learning/mentors",
     *     summary="List all mentors",
     *     tags={"Learning"},
     *     @OA\Response(response=200, description="List of mentors")
     * )
     */
    public function index(Request $request)
    {
        $query = Mentor::with('user');

        if ($request->has('specialization')) {
            $query->where('specialization', 'like', '%' . $request->specialization . '%');
        }

        return response()->json($query->paginate(20));
    }

    /**
     * @OA\Post(
     *     path="/api/v1/learning/mentors",
     *     summary="Create a mentor profile",
     *     tags={"Learning"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="user_id", type="integer"),
     *             @OA\Property(property="specialization", type="string"),
     *             @OA\Property(property="bio", type="string"),
     *             @OA\Property(property="experience_years", type="integer"),
     *             @OA\Property(property="social_links", type="object")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Mentor created")
     * )
     */
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id|unique:mentors,user_id',
            'specialization' => 'required|string',
            'bio' => 'nullable|string',
            'experience_years' => 'integer|min:0',
            'social_links' => 'nullable|array',
        ]);

        $mentor = Mentor::create($request->all());

        return response()->json($mentor, 201);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/learning/mentors/{mentor}",
     *     summary="Get mentor details",
     *     tags={"Learning"},
     *     @OA\Response(response=200, description="Mentor details")
     * )
     */
    public function show(Mentor $mentor)
    {
        return response()->json($mentor->load('user', 'schedules'));
    }

    /**
     * @OA\Put(
     *     path="/api/v1/learning/mentors/{mentor}",
     *     summary="Update mentor profile",
     *     tags={"Learning"},
     *     @OA\Response(response=200, description="Mentor updated")
     * )
     */
    public function update(Request $request, Mentor $mentor)
    {
        $request->validate([
            'specialization' => 'string',
            'bio' => 'nullable|string',
            'experience_years' => 'integer|min:0',
            'social_links' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $mentor->update($request->all());

        return response()->json($mentor);
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/learning/mentors/{mentor}",
     *     summary="Delete mentor profile",
     *     tags={"Learning"},
     *     @OA\Response(response=200, description="Mentor deleted")
     * )
     */
    public function destroy(Mentor $mentor)
    {
        $mentor->delete();
        return response()->json(['message' => 'Mentor deleted successfully']);
    }
}
