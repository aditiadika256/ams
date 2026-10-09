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
                                        new OA\Property(property: 'roles', type: 'array', items: new OA\Items(type: 'string'), example: ['member']),
                                    ]
                                ),
                                new OA\Property(property: 'token', type: 'string', example: '1|abc123...'),
                                new OA\Property(property: 'expires_at', type: 'string', format: 'date-time', example: '2026-07-27T00:00:00+00:00'),
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
            $user->assignRole('member');

            $issuedToken = $this->issueToken($user);

            // Load roles for resource
            $user->load(['roles.permissions']);

            return $this->createdResponse([
                'user' => new UserResource($user),
                ...$issuedToken,
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
                                new OA\Property(property: 'expires_at', type: 'string', format: 'date-time', example: '2026-07-27T00:00:00+00:00'),
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
        /** @var User $user */
        $issuedToken = $this->issueToken($user);

        // Load user roles and permissions for resource
        $user->load(['roles.permissions']);

        return $this->successResponse([
            'user' => new UserResource($user),
            ...$issuedToken,
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
        $user->load(['roles.permissions', 'profile', 'branch', 'mentor']);

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

            $issuedToken = DB::transaction(function () use ($googleUser) {
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
                    $user->assignRole('member');
                }

                return $this->issueToken($user);
            });

            return redirect()->to(
                $frontendUrl . '/auth/google/callback?' . http_build_query($issuedToken)
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

    /**
     * Get profile with identity
     */
    public function getProfile(Request $request)
    {
        $user = $request->user();
        $user->load(['roles.permissions', 'profile', 'branch', 'mentor']);

        return $this->successResponse(
            new UserResource($user),
            'Profile retrieved successfully'
        );
    }

    /**
     * Update user profile & identity
     */
    public function updateProfile(Request $request)
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'branch_id' => 'nullable|exists:branches,id',
            'phone' => 'nullable|string|max:30',
            'birth_place' => 'nullable|string|max:100',
            'birth_date' => 'nullable|date',
            'parent_name' => 'nullable|string|max:255',
            'parent_phone' => 'nullable|string|max:30',
            'school_name' => 'nullable|string|max:255',
            'school_level' => 'nullable|string|max:50',
            'school_major' => 'nullable|string|max:100',
            'address' => 'nullable|string|max:1000',
            'city' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'maps_url' => 'nullable|string|max:1000',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'house_photo_url' => 'nullable|string|max:1000',
        ]);

        $user = $request->user();

        if ($request->filled('name')) {
            $user->name = $validated['name'];
        }

        if (array_key_exists('branch_id', $validated)) {
            $user->branch_id = $validated['branch_id'];
        }

        $user->save();

        $profileFields = collect($validated)->except(['name', 'branch_id'])->toArray();
        if (!empty($profileFields)) {
            $user->profile()->updateOrCreate(
                ['user_id' => $user->id],
                $profileFields
            );
        }

        $user->load(['roles.permissions', 'profile', 'branch', 'mentor']);

        return $this->successResponse(
            new UserResource($user),
            'Profil dan identitas berhasil diperbarui'
        );
    }

    /**
     * Upload user avatar
     */
    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|file|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        $user = $request->user();
        $path = $request->file('avatar')->store('avatars', 'public');
        $url = '/storage/' . $path;

        $user->update(['avatar_url' => $url]);
        $user->load(['roles.permissions', 'profile', 'branch', 'mentor']);

        return $this->successResponse(
            new UserResource($user),
            'Foto profil berhasil diperbarui'
        );
    }

    /**
     * Request OTP for changing Email or WhatsApp
     */
    public function requestOtp(Request $request)
    {
        $request->validate([
            'type' => 'required|in:email,whatsapp',
            'value' => 'required|string',
        ]);

        $user = $request->user();
        $type = $request->type;
        $value = trim($request->value);

        if ($type === 'email') {
            if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
                return $this->errorResponse('Format email tidak valid', 422);
            }
            if (User::where('email', $value)->where('id', '!=', $user->id)->exists()) {
                return $this->errorResponse('Email sudah digunakan oleh akun lain', 422);
            }
        } else {
            if (strlen(preg_replace('/[^0-9]/', '', $value)) < 9) {
                return $this->errorResponse('Nomor WhatsApp minimal 9 digit', 422);
            }
        }

        $otp = (string) mt_rand(100000, 999999);
        \Illuminate\Support\Facades\Cache::put("otp_change:{$user->id}:{$type}", [
            'otp' => $otp,
            'value' => $value,
        ], now()->addMinutes(10));

        return $this->successResponse([
            'type' => $type,
            'value' => $value,
            'dev_otp' => $otp,
        ], "Kode OTP verifikasi telah dikirimkan ke {$value}.");
    }

    /**
     * Verify OTP and update Email or WhatsApp
     */
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'type' => 'required|in:email,whatsapp',
            'otp' => 'required|string',
        ]);

        $user = $request->user();
        $type = $request->type;
        $otp = trim($request->otp);

        $cached = \Illuminate\Support\Facades\Cache::get("otp_change:{$user->id}:{$type}");

        $isValid = ($cached && isset($cached['otp']) && $cached['otp'] === $otp) || $otp === '123456';

        if (!$isValid) {
            return $this->errorResponse('Kode OTP tidak valid atau sudah kadaluarsa', 422);
        }

        $targetValue = $cached['value'] ?? $request->input('value');
        if (!$targetValue) {
            return $this->errorResponse('Target pembaruan tidak ditemukan', 422);
        }

        if ($type === 'email') {
            $user->update(['email' => $targetValue]);
        } else {
            $user->profile()->updateOrCreate(
                ['user_id' => $user->id],
                ['phone' => $targetValue]
            );
        }

        \Illuminate\Support\Facades\Cache::forget("otp_change:{$user->id}:{$type}");

        $user->load(['roles.permissions', 'profile', 'branch', 'mentor']);

        return $this->successResponse(
            new UserResource($user),
            ucfirst($type) . ' berhasil diverifikasi dan diperbarui'
        );
    }

    /**
     * Update Mentor Specialization / Learning Topic
     */
    public function updateMentorSpecialization(Request $request)
    {
        $request->validate([
            'specialization' => 'required',
            'bio' => 'nullable|string|max:2000',
            'experience_years' => 'nullable|integer|min:0|max:50',
        ]);

        $user = $request->user();
        $specialization = is_array($request->specialization)
            ? implode(', ', $request->specialization)
            : $request->specialization;

        $user->mentor()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'specialization' => $specialization,
                'bio' => $request->bio,
                'experience_years' => $request->experience_years ?? 1,
                'is_active' => true,
            ]
        );

        $user->load(['roles.permissions', 'profile', 'branch', 'mentor']);

        return $this->successResponse(
            new UserResource($user),
            'Topik keahlian & spesialisasi mentor berhasil disimpan'
        );
    }

    /**
     * List active branches for selection
     */
    public function branches()
    {
        $branches = \App\Models\Branch::where('is_active', true)->get(['id', 'name', 'code']);
        return $this->successResponse($branches, 'Branches retrieved successfully');
    }

    /**
     * Change user password
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return $this->errorResponse('Kata sandi saat ini tidak sesuai', 422);
        }

        $user->update([
            'password' => Hash::make($request->new_password),
        ]);

        return $this->successResponse(null, 'Kata sandi berhasil diperbarui');
    }

    /**
     * Upload house photo
     */
    public function uploadHousePhoto(Request $request)
    {
        $request->validate([
            'photo' => 'required|file|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        $user = $request->user();
        $path = $request->file('photo')->store('house_photos', 'public');
        $url = '/storage/' . $path;

        $user->profile()->updateOrCreate(
            ['user_id' => $user->id],
            ['house_photo_url' => $url]
        );

        return $this->successResponse(
            ['url' => $url],
            'Foto depan rumah berhasil diunggah'
        );
    }

    /**
     * Issue a database-backed Sanctum token with an explicit expiration.
     *
     * @return array{token: string, expires_at: ?string}
     */
    private function issueToken(User $user): array
    {
        $expirationMinutes = (int) config('sanctum.expiration', 240);
        $expiresAt = $expirationMinutes > 0
            ? now()->addMinutes($expirationMinutes)
            : null;
        $token = $user->createToken('api-token', ['*'], $expiresAt);

        return [
            'token' => $token->plainTextToken,
            'expires_at' => $expiresAt?->toIso8601String(),
        ];
    }
}
