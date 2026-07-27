<?php

namespace App\Domain\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

/**
 * @OA\Tag(
 *     name="Admin - Roles",
 *     description="Role & Permission Management"
 * )
 */
class RoleController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/v1/admin/roles",
     *     tags={"Admin - Roles"},
     *     summary="List all roles",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="List of roles")
     * )
     */
    public function index(Request $request)
    {
        $validated = $request->validate([
            'guard_name' => [
                'sometimes',
                'string',
                Rule::in(array_keys(config('auth.guards'))),
            ],
        ]);

        $roles = Role::query()
            ->with('permissions')
            ->when(
                $validated['guard_name'] ?? null,
                fn ($query, $guardName) => $query->where('guard_name', $guardName)
            )
            ->orderBy('name')
            ->get();

        return $this->successResponse($roles, 'Roles retrieved successfully');
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/permissions",
     *     tags={"Admin - Roles"},
     *     summary="List all permissions",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="List of permissions")
     * )
     */
    public function permissions()
    {
        $permissions = Permission::all();
        return $this->successResponse($permissions, 'Permissions retrieved successfully');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/roles",
     *     tags={"Admin - Roles"},
     *     summary="Create a new role",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name"},
     *             @OA\Property(property="name", type="string", example="manager"),
     *             @OA\Property(property="permissions", type="array", @OA\Items(type="string"))
     *         )
     *     ),
     *     @OA\Response(response=201, description="Role created successfully")
     * )
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:roles,name',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        $role = Role::create(['name' => $validated['name']]);

        if (isset($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        return $this->successResponse($role->load('permissions'), 'Role created successfully', 201);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/roles/{id}",
     *     tags={"Admin - Roles"},
     *     summary="Get role details",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Role details")
     * )
     */
    public function show($id)
    {
        $role = Role::with('permissions')->findById($id);
        return $this->successResponse($role, 'Role retrieved successfully');
    }

    /**
     * @OA\Put(
     *     path="/api/v1/admin/roles/{id}",
     *     tags={"Admin - Roles"},
     *     summary="Update a role",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="permissions", type="array", @OA\Items(type="string"))
     *         )
     *     ),
     *     @OA\Response(response=200, description="Role updated successfully")
     * )
     */
    public function update(Request $request, $id)
    {
        $role = Role::findById($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|unique:roles,name,' . $id,
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        if (isset($validated['name'])) {
            $role->update(['name' => $validated['name']]);
        }

        if (isset($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        return $this->successResponse($role->load('permissions'), 'Role updated successfully');
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/admin/roles/{id}",
     *     tags={"Admin - Roles"},
     *     summary="Delete a role",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Role deleted successfully")
     * )
     */
    public function destroy($id)
    {
        $role = Role::findById($id);
        
        // Prevent deleting superadmin role
        if ($role->name === 'superadmin') {
            return response()->json(['message' => 'Cannot delete superadmin role'], 403);
        }

        $role->delete();

        return $this->successResponse(null, 'Role deleted successfully');
    }
}
