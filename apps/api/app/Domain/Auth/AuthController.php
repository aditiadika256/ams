<?php

namespace App\Domain\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: 'Auth',
    description: 'Authentication endpoints'
)]
class AuthController extends Controller
{
    /**
     * Login user and return token
     */
    #[OA\Post(
        path: '/api/v1/auth/login',
        summary: 'Login user',
        tags: ['Auth'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['email', 'password'],
                properties: [
                    new OA\Property(property: 'email', type: 'string', format: 'email', example: 'superadmin@example.com'),
                    new OA\Property(property: 'password', type: 'string', format: 'password', example: 'password'),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Login successful',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'Login successful'),
                        new OA\Property(
                            property: 'data',
                            type: 'object',
                            properties: [
                                new OA\Property(
                                    property: 'user',
                                    type: 'object',
                                    properties: [
                                        new OA\Property(property: 'id', type: 'integer', example: 1),
                                        new OA\Property(property: 'name', type: 'string', example: 'Super Admin'),
                                        new OA\Property(property: 'email', type: 'string', format: 'email', example: 'superadmin@example.com'),
                                        new OA\Property(property: 'roles', type: 'array', items: new OA\Items(type: 'string'), example: ['superadmin']),
                                        new OA\Property(property: 'permissions', type: 'array', items: new OA\Items(type: 'string'), example: []),
                                    ]
                                ),
                                new OA\Property(property: 'token', type: 'string', example: '1|abc123...'),
                            ]
                        ),
                    ]
                )
            ),
            new OA\Response(response: 422, description: 'Validation error'),
            new OA\Response(response: 401, description: 'Invalid credentials'),
        ]
    )]
    public function login(LoginRequest $request)
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return $this->unauthorizedResponse('Invalid credentials');
        }

        $user = Auth::user();
        $token = $user->createToken('api-token')->plainTextToken;

        // Load user roles and permissions for resource
        $user->load(['roles.permissions']);

        return $this->successResponse([
            'user' => new UserResource($user),
            'token' => $token,
        ], 'Login successful');
    }

    /**
     * Get authenticated user profile
     */
    #[OA\Get(
        path: '/api/v1/auth/me',
        summary: 'Get authenticated user profile',
        tags: ['Auth'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'User profile retrieved successfully',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'User profile retrieved successfully'),
                        new OA\Property(
                            property: 'data',
                            type: 'object',
                            properties: [
                                new OA\Property(property: 'id', type: 'integer', example: 1),
                                new OA\Property(property: 'name', type: 'string', example: 'Super Admin'),
                                new OA\Property(property: 'email', type: 'string', format: 'email', example: 'superadmin@example.com'),
                                new OA\Property(property: 'roles', type: 'array', items: new OA\Items(type: 'string'), example: ['superadmin']),
                                new OA\Property(property: 'permissions', type: 'array', items: new OA\Items(type: 'string'), example: []),
                            ]
                        ),
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function me(Request $request)
    {
        $user = $request->user();
        $user->load(['roles.permissions']);

        return $this->successResponse(
            new UserResource($user),
            'User profile retrieved successfully'
        );
    }

    /**
     * Logout user and revoke token
     */
    #[OA\Post(
        path: '/api/v1/auth/logout',
        summary: 'Logout user',
        tags: ['Auth'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Logout successful',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'Logout successful'),
                        new OA\Property(property: 'data', type: 'null', nullable: true),
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return $this->successResponse(null, 'Logout successful');
    }
}

