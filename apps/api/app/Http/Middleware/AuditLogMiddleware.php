<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\AuditLog;

class AuditLogMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        // Minimal audit: log authenticated user and endpoint
        try {
            $user = $request->user();
            AuditLog::create([
                'user_id' => $user ? $user->id : null,
                'action' => $request->method() . ' ' . $request->path(),
                'entity' => null,
                'entity_id' => null,
                'payload' => ['ip' => $request->ip(), 'input' => $request->except(['password','_token'])],
            ]);
        } catch (\Throwable $e) {
            // swallow errors to not break requests
        }

        return $response;
    }
}
