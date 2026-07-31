<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$permissions): Response
    {
        if (!$request->user()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
            ], 401);
        }

        // Super Admin Bypass
        if ($request->user()->hasRole('superadmin') || $request->user()->hasRole('superadmin', 'web')) {
            return $next($request);
        }

        $allPermissions = [];
        foreach ($permissions as $permission) {
            foreach (explode('|', $permission) as $p) {
                $allPermissions[] = trim($p);
            }
        }

        $hasPermission = collect($allPermissions)->contains(
            fn (string $permission): bool => $request->user()
                ->checkPermissionTo($permission, 'web')
        );

        if (!$hasPermission) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Required permission: ' . implode(', ', $allPermissions),
            ], 403);
        }

        return $next($request);
    }
}
