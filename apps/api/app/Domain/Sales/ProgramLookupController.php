<?php

namespace App\Domain\Sales;

use App\Http\Controllers\Controller;
use App\Models\ProgramLevel;
use App\Models\ProgramType;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class ProgramLookupController extends Controller
{
    public function index(): JsonResponse
    {
        $cacheVersion = Cache::get('program-lookups:cache_version', 'initial');

        $data = Cache::remember(
            "program-lookups:{$cacheVersion}",
            3600,
            fn (): array => [
                'levels' => ProgramLevel::query()
                    ->active()
                    ->orderBy('sort_order')
                    ->orderBy('id')
                    ->get(['id', 'code', 'name'])
                    ->toArray(),
                'types' => ProgramType::query()
                    ->active()
                    ->orderBy('sort_order')
                    ->orderBy('id')
                    ->get(['id', 'code', 'name'])
                    ->toArray(),
            ]
        );

        return $this->successResponse(
            $data,
            'Program lookups retrieved successfully'
        )->header('Cache-Control', 'public, max-age=0, no-cache, must-revalidate');
    }
}
