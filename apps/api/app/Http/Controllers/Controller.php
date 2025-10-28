<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use Illuminate\Http\Request;

abstract class Controller
{
    use ApiResponse;

    /**
     * Get authenticated user
     *
     * @param Request $request
     * @return \App\Models\User|null
     */
    protected function user(Request $request)
    {
        return $request->user();
    }

    /**
     * Get authenticated user ID
     *
     * @param Request $request
     * @return int|null
     */
    protected function userId(Request $request): ?int
    {
        return $request->user()?->id;
    }

    /**
     * Get pagination limit from request
     *
     * @param Request $request
     * @param int $default
     * @param int $max
     * @return int
     */
    protected function getLimit(Request $request, int $default = 15, int $max = 100): int
    {
        $limit = (int) $request->input('limit', $default);
        return min(max($limit, 1), $max);
    }

    /**
     * Get pagination page from request
     *
     * @param Request $request
     * @return int
     */
    protected function getPage(Request $request): int
    {
        return max((int) $request->input('page', 1), 1);
    }

    /**
     * Get sort column from request
     *
     * @param Request $request
     * @param string $default
     * @param array $allowed
     * @return string
     */
    protected function getSort(Request $request, string $default = 'id', array $allowed = []): string
    {
        $sort = $request->input('sort', $default);
        
        if (!empty($allowed) && !in_array($sort, $allowed)) {
            return $default;
        }
        
        return $sort;
    }

    /**
     * Get sort direction from request
     *
     * @param Request $request
     * @param string $default
     * @return string
     */
    protected function getDirection(Request $request, string $default = 'asc'): string
    {
        $direction = strtolower($request->input('direction', $default));
        return in_array($direction, ['asc', 'desc']) ? $direction : $default;
    }

    /**
     * Format paginated response
     *
     * @param mixed $data
     * @param string $message
     * @return \Illuminate\Http\JsonResponse
     */
    protected function paginatedResponse($data, string $message = 'Data retrieved successfully')
    {
        return $this->successResponse($data, $message);
    }
}
