<?php

namespace App\Domain\Learning;

use App\Http\Controllers\Controller;
use App\Models\Mentor;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Role;

class MentorController extends Controller
{
    public function candidates()
    {
        $users = User::query()
            ->select(['id', 'name', 'email'])
            ->with('roles:id,name')
            ->whereNotIn('id', Mentor::query()->select('user_id'))
            ->orderBy('name')
            ->get();

        return $this->successResponse($users, 'Mentor candidates retrieved successfully');
    }

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
        $query = Mentor::with(['user:id,name,email']);

        if ($request->has('specialization')) {
            $query->where('specialization', 'like', '%' . $request->specialization . '%');
        }

        $page = (int)($request->get('page', 1));
        $perPage = (int)($request->get('per_page', 20));

        $filters = [
            'specialization' => $request->get('specialization'),
        ];
        $cacheVersion = (int) Cache::get('mentors:index:version', 1);

        $cacheKey = sprintf(
            'mentors:index:v%d:%s:page:%d:per:%d',
            $cacheVersion,
            md5(json_encode($filters)),
            $page,
            $perPage
        );

        $payload = Cache::remember($cacheKey, 60, function () use ($query, $perPage) {
            $mentors = $query->paginate($perPage);
            return [
                'data' => $mentors->items(),
                'links' => [
                    'first' => $mentors->url(1),
                    'last' => $mentors->url($mentors->lastPage()),
                    'prev' => $mentors->previousPageUrl(),
                    'next' => $mentors->nextPageUrl(),
                ],
                'meta' => [
                    'current_page' => $mentors->currentPage(),
                    'from' => $mentors->firstItem(),
                    'last_page' => $mentors->lastPage(),
                    'path' => $mentors->path(),
                    'per_page' => $mentors->perPage(),
                    'to' => $mentors->lastItem(),
                    'total' => $mentors->total(),
                ],
            ];
        });

        return response()
            ->json($payload)
            ->header('Cache-Control', 'private, no-cache');
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
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id', 'unique:mentors,user_id'],
            'specialization' => ['required', 'string'],
            'bio' => ['nullable', 'string'],
            'experience_years' => ['sometimes', 'integer', 'min:0'],
            'social_links' => ['nullable', 'array'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $mentor = DB::transaction(function () use ($validated) {
            $user = User::query()
                ->whereKey($validated['user_id'])
                ->lockForUpdate()
                ->firstOrFail();

            if (Mentor::query()->where('user_id', $validated['user_id'])->exists()) {
                throw ValidationException::withMessages([
                    'user_id' => 'User ini sudah memiliki profil mentor.',
                ]);
            }

            $mentor = Mentor::create($validated);
            $mentorRole = Role::findByName('mentor_harian', 'web');

            $user->syncRoles([$mentorRole]);

            return $mentor;
        });
        $this->invalidateIndexCache();

        return response()->json($mentor->load('user.roles'), 201);
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
        $validated = $request->validate([
            'specialization' => ['sometimes', 'string'],
            'bio' => ['nullable', 'string'],
            'experience_years' => ['sometimes', 'integer', 'min:0'],
            'social_links' => ['nullable', 'array'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $mentor->update($validated);
        $this->invalidateIndexCache();

        return response()->json($mentor->load('user.roles'));
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
        $this->invalidateIndexCache();

        return response()->json(['message' => 'Mentor deleted successfully']);
    }

    private function invalidateIndexCache(): void
    {
        Cache::add('mentors:index:version', 1);
        Cache::increment('mentors:index:version');
    }
}
