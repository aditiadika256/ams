<?php

namespace App\Domain\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;

/**
 * @OA\Tag(
 *     name="Admin - Users",
 *     description="User Management"
 * )
 */
class UserController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/v1/admin/users",
     *     tags={"Admin - Users"},
     *     summary="List all users",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="page", in="query", description="Page number", required=false, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="limit", in="query", description="Items per page", required=false, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="role", in="query", description="Filter by role name", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="branch_id", in="query", description="Filter by branch ID", required=false, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="search", in="query", description="Search by name or email", required=false, @OA\Schema(type="string")),
     *     @OA\Response(response=200, description="List of users")
     * )
     */
    public function index(Request $request)
    {
        $query = User::with(['roles', 'branch']);

        // Filter by Branch (Scoping)
        if ($request->has('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }
        
        // If current user is Branch Manager, enforce branch scope
        if ($request->user()->hasRole('manajer_cabang') && !$request->user()->hasRole('superadmin')) {
             $query->where('branch_id', $request->user()->branch_id);
        }

        // Filter by Role
        if ($request->has('role')) {
            $query->role($request->role);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->has('fields')) {
            $fields = collect(explode(',', $request->query('fields')))
                ->map(fn($field) => trim($field))
                ->filter()
                ->unique()
                ->values()
                ->all();

            if (!empty($fields)) {
                $query->select($fields);
            }
        } else {
            $query->with(['roles', 'branch']);
        }

        $users = $query->latest()
            ->paginate($this->getLimit($request));

        return $this->paginatedResponse($users, 'Users retrieved successfully');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/users",
     *     tags={"Admin - Users"},
     *     summary="Create a new user",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name", "email", "password", "role"},
     *             @OA\Property(property="name", type="string", example="John Doe"),
     *             @OA\Property(property="email", type="string", format="email", example="john@example.com"),
     *             @OA\Property(property="password", type="string", format="password", example="password123"),
     *             @OA\Property(property="role", type="string", example="student"),
     *             @OA\Property(property="branch_id", type="integer", nullable=true)
     *         )
     *     ),
     *     @OA\Response(response=201, description="User created successfully")
     * )
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|exists:roles,name',
            'branch_id' => 'nullable|exists:branches,id',
        ]);

        // Branch Manager restriction
        if ($request->user()->hasRole('manajer_cabang') && !$request->user()->hasRole('superadmin')) {
            $validated['branch_id'] = $request->user()->branch_id;
        }

        $validated['password'] = Hash::make($validated['password']);
        
        $user = User::create($validated);
        $user->assignRole($validated['role']);

        return $this->successResponse($user->load('roles', 'branch'), 'User created successfully', 201);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/users/{id}",
     *     tags={"Admin - Users"},
     *     summary="Get user details",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="User details")
     * )
     */
    public function show($id)
    {
        $user = User::with(['roles', 'branch'])->findOrFail($id);

        // Branch Manager restriction
        if (request()->user()->hasRole('manajer_cabang') && !request()->user()->hasRole('superadmin')) {
            if ($user->branch_id !== request()->user()->branch_id) {
                return response()->json(['message' => 'Unauthorized to view user from another branch'], 403);
            }
        }

        return $this->successResponse($user, 'User details retrieved successfully');
    }

    /**
     * @OA\Put(
     *     path="/api/v1/admin/users/{id}",
     *     tags={"Admin - Users"},
     *     summary="Update a user",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="email", type="string", format="email"),
     *             @OA\Property(property="password", type="string", format="password"),
     *             @OA\Property(property="role", type="string"),
     *             @OA\Property(property="branch_id", type="integer")
     *         )
     *     ),
     *     @OA\Response(response=200, description="User updated successfully")
     * )
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // Branch Manager restriction
        if ($request->user()->hasRole('manajer_cabang') && !$request->user()->hasRole('superadmin')) {
             if ($user->branch_id !== $request->user()->branch_id) {
                 return response()->json(['message' => 'Unauthorized to update user from another branch'], 403);
             }
        }
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8',
            'role' => 'nullable|exists:roles,name',
            'branch_id' => 'nullable|exists:branches,id',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        // Branch Manager restriction
        if ($request->user()->hasRole('manajer_cabang') && !$request->user()->hasRole('superadmin')) {
             if (isset($validated['branch_id']) && $validated['branch_id'] != $request->user()->branch_id) {
                 return response()->json(['message' => 'Unauthorized to assign user to another branch'], 403);
             }
        }

        $user->update($validated);

        if (isset($validated['role'])) {
            $user->syncRoles([$validated['role']]);
        }

        return $this->successResponse($user->load('roles', 'branch'), 'User updated successfully');
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/admin/users/{id}",
     *     tags={"Admin - Users"},
     *     summary="Delete a user",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="User deleted successfully")
     * )
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);

        // Branch Manager restriction
        if (request()->user()->hasRole('manajer_cabang') && !request()->user()->hasRole('superadmin')) {
            if ($user->branch_id !== request()->user()->branch_id) {
                return response()->json(['message' => 'Unauthorized to delete user from another branch'], 403);
            }
        }
        
        // Prevent deleting self
        if (auth()->id() == $id) {
            return response()->json(['message' => 'Cannot delete yourself'], 403);
        }
        
        $user->delete();

        return $this->successResponse(null, 'User deleted successfully');
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/branches",
     *     tags={"Admin - Users"},
     *     summary="List all branches",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="List of branches")
     * )
     */
    public function branches()
    {
        $branches = \App\Models\Branch::where('is_active', true)->get();
        return $this->successResponse($branches, 'Branches retrieved successfully');
    }
}
