<?php

namespace App\Domain\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Laravel\Socialite\Facades\Socialite;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: 'Auth',
    description: 'Authentication endpoints'
)]
class AuthController extends Controller
{
    /**
     * Register a new user
     */
    #[OA\Post(
        path: '/api/v1/auth/register',
        summary: 'Register new user',
        tags: ['Auth'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name', 'email', 'password', 'password_confirmation'],
                properties: [
                    new OA\Property(property: 'name', type: 'string', example: 'John Doe'),
                    new OA\Property(property: 'email', type: 'string', format: 'email', example: 'john@example.com'),
                    new OA\Property(property: 'password', type: 'string', format: 'password', example: 'Password123'),
                    new OA\Property(property: 'password_confirmation', type: 'string', format: 'password', example: 'Password123'),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: 'Registration successful',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'Registration successful'),
                        new OA\Property(
                            property: 'data',
                            type: 'object',
                            properties: [
                                new OA\Property(
                                    property: 'user',
                                    type: 'object',
                                    properties: [
                                        new OA\Property(property: 'id', type: 'integer', example: 1),
                                        new OA\Property(property: 'name', type: 'string', example: 'John Doe'),
                                        new OA\Property(property: 'email', type: 'string', format: 'email', example: 'john@example.com'),
                                        new OA\Property(property: 'roles', type: 'array', items: new OA\Items(type: 'string'), example: ['student']),
                                    ]
                                ),
                                new OA\Property(property: 'token', type: 'string', example: '1|abc123...'),
                            ]
                        ),
                    ]
                )
            ),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function register(RegisterRequest $request)
    {
        return DB::transaction(function () use ($request) {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            // Assign default role
            $user->assignRole('student');

            $token = $user->createToken('api-token')->plainTextToken;

            // Load roles for resource
            $user->load(['roles.permissions']);

            return $this->createdResponse([
                'user' => new UserResource($user),
                'token' => $token,
            ], 'Registration successful');
        });
    }

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
     * Redirect to Google OAuth
     */
    #[OA\Get(
        path: '/api/v1/auth/google',
        summary: 'Get Google OAuth redirect URL',
        tags: ['Auth'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Google redirect URL retrieved',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'Google redirect URL retrieved'),
                        new OA\Property(property: 'data', type: 'string', example: 'https://accounts.google.com/o/oauth2/auth/...'),
                    ]
                )
            ),
        ]
    )]
    public function googleRedirect()
    {
        return $this->successResponse(
            Socialite::driver('google')->stateless()->redirect()->getTargetUrl(),
            'Google redirect URL retrieved'
        );
    }

    /**
     * Handle Google OAuth callback
     *
     * Google redirects the browser to this endpoint after the user authorises.
     * Instead of returning JSON (which would be displayed as raw text), we
     * redirect to the frontend callback page with the token (or error) in the
     * query string so the SPA can store the token and navigate the user.
     */
    #[OA\Get(
        path: '/api/v1/auth/google/callback',
        summary: 'Handle Google OAuth callback (redirects to frontend)',
        tags: ['Auth'],
        responses: [
            new OA\Response(
                response: 302,
                description: 'Redirects to frontend with token or error query parameter',
            ),
            new OA\Response(response: 401, description: 'Authentication failed — redirects to frontend with error'),
        ]
    )]
    public function googleCallback()
    {
        $frontendUrl = config('app.frontend_url', 'http://localhost:3000');

        try {
            $googleUser = Socialite::driver('google')->stateless()->user();

            $token = DB::transaction(function () use ($googleUser) {
                $user = User::updateOrCreate(
                    ['email' => $googleUser->getEmail()],
                    [
                        'name' => $googleUser->getName(),
                        'google_id' => $googleUser->getId(),
                        'provider' => 'google',
                        'avatar_url' => $googleUser->getAvatar(),
                    ]
                );

                // Assign default role if new user
                if ($user->wasRecentlyCreated) {
                    $user->assignRole('student');
                }

                return $user->createToken('api-token')->plainTextToken;
            });

            return redirect()->to(
                $frontendUrl . '/auth/google/callback?' . http_build_query(['token' => $token])
            );
        } catch (\Exception $e) {
            return redirect()->to(
                $frontendUrl . '/auth/google/callback?' . http_build_query([
                    'error' => 'Google authentication failed. Please try again.',
                ])
            );
        }
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

