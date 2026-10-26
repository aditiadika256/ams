<?php

namespace App\Domain\Admin;

use App\Http\Controllers\Controller;
use App\Models\PhysicalRoom;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: 'Admin - Physical Rooms',
    description: 'Endpoints for branch classroom and offline physical facility inventory'
)]
class PhysicalRoomController extends Controller
{
    #[OA\Get(
        path: '/api/v1/admin/physical-rooms',
        summary: 'List physical rooms per branch with capacity and facility filters',
        tags: ['Admin - Physical Rooms'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'branch_id', in: 'query', required: false, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'is_active', in: 'query', required: false, schema: new OA\Schema(type: 'boolean')),
            new OA\Parameter(name: 'search', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 1)),
            new OA\Parameter(name: 'per_page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 15)),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Rooms retrieved successfully'),
        ]
    )]
    public function index(Request $request): JsonResponse
    {
        $query = PhysicalRoom::with('branch:id,name,code')
            ->where('row_status', 1);

        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->query('branch_id'));
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', filter_var($request->query('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('room_name', 'ilike', "%{$search}%")
                  ->orWhere('room_number', 'ilike', "%{$search}%");
            });
        }

        $rooms = $query->orderBy('room_number')->paginate($request->query('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'Physical rooms retrieved successfully',
            'data' => $rooms->items(),
            'meta' => [
                'current_page' => $rooms->currentPage(),
                'last_page' => $rooms->lastPage(),
                'per_page' => $rooms->perPage(),
                'total' => $rooms->total(),
            ],
        ]);
    }

    #[OA\Post(
        path: '/api/v1/admin/physical-rooms',
        summary: 'Create a new physical classroom',
        tags: ['Admin - Physical Rooms'],
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['room_number', 'room_name', 'capacity'],
                properties: [
                    new OA\Property(property: 'branch_id', type: 'integer', nullable: true),
                    new OA\Property(property: 'room_number', type: 'string', example: 'R.101'),
                    new OA\Property(property: 'room_name', type: 'string', example: 'Ruang Teori Al-Khawarizmi'),
                    new OA\Property(property: 'capacity', type: 'integer', example: 35),
                    new OA\Property(property: 'facilities', type: 'array', items: new OA\Items(type: 'string'), example: ['AC', 'Projector', 'CCTV', 'WiFi']),
                    new OA\Property(property: 'is_active', type: 'boolean', default: true),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Room created successfully'),
            new OA\Response(response: 422, description: 'Validation failed'),
        ]
    )]
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'branch_id' => 'nullable|exists:branches,id',
            'room_number' => [
                'required',
                'string',
                'max:50',
                Rule::unique('physical_rooms')->where(function ($query) use ($request) {
                    return $query->where('branch_id', $request->input('branch_id'))
                                 ->where('row_status', 1);
                }),
            ],
            'room_name' => 'required|string|max:100',
            'capacity' => 'required|integer|min:1|max:500',
            'facilities' => 'nullable|array',
            'facilities.*' => 'string|max:50',
            'is_active' => 'boolean',
        ]);

        $room = PhysicalRoom::create([
            'branch_id' => $validated['branch_id'] ?? null,
            'room_number' => $validated['room_number'],
            'room_name' => $validated['room_name'],
            'capacity' => $validated['capacity'],
            'facilities' => $validated['facilities'] ?? ['AC', 'Projector', 'WiFi'],
            'is_active' => $validated['is_active'] ?? true,
            'row_status' => 1,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Physical room created successfully',
            'data' => $room->load('branch:id,name,code'),
        ], 201);
    }

    #[OA\Put(
        path: '/api/v1/admin/physical-rooms/{id}',
        summary: 'Update physical room details',
        tags: ['Admin - Physical Rooms'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Room updated successfully'),
            new OA\Response(response: 404, description: 'Room not found'),
        ]
    )]
    public function update(Request $request, $id): JsonResponse
    {
        $room = PhysicalRoom::where('row_status', 1)->find($id);
        if (! $room) {
            return response()->json(['success' => false, 'message' => 'Physical room not found'], 404);
        }

        $validated = $request->validate([
            'branch_id' => 'nullable|exists:branches,id',
            'room_number' => [
                'required',
                'string',
                'max:50',
                Rule::unique('physical_rooms')->where(function ($query) use ($request, $room) {
                    return $query->where('branch_id', $request->input('branch_id', $room->branch_id))
                                 ->where('row_status', 1)
                                 ->where('id', '!=', $room->id);
                }),
            ],
            'room_name' => 'required|string|max:100',
            'capacity' => 'required|integer|min:1|max:500',
            'facilities' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $room->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Physical room updated successfully',
            'data' => $room->load('branch:id,name,code'),
        ]);
    }

    #[OA\Delete(
        path: '/api/v1/admin/physical-rooms/{id}',
        summary: 'Soft delete a physical room',
        tags: ['Admin - Physical Rooms'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Room deleted successfully'),
        ]
    )]
    public function destroy(Request $request, $id): JsonResponse
    {
        $room = PhysicalRoom::find($id);
        if (! $room) {
            return response()->json(['success' => false, 'message' => 'Physical room not found'], 404);
        }

        $room->row_status = 0;
        $room->is_active = false;
        $room->save();

        return response()->json([
            'success' => true,
            'message' => 'Physical room deleted successfully',
        ]);
    }
}
