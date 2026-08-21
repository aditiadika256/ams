<?php

namespace App\Domain\System;

use App\Http\Controllers\Controller;
use App\Http\Resources\MenuResource;
use App\Models\Menu;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: 'Menus',
    description: 'Public menu endpoints'
)]
class MenuController extends Controller
{
    #[OA\Get(
        path: '/api/v1/menus',
        summary: 'Get menu tree',
        tags: ['Menus'],
        responses: [
            new OA\Response(response: 200, description: 'Menu tree'),
        ]
    )]
    public function index(Request $request)
    {
        $validated = $request->validate([
            'layout' => ['nullable', 'in:users,admin'],
            'section' => ['nullable', 'in:topbar,bottomnavigation,sidebar,header'],
        ]);
        $layout = $validated['layout'] ?? null;
        $section = $validated['section'] ?? null;
        $permissionNames = $this->permissionNames($request->user());
        $cacheVersion = Cache::get('menus:cache_version', 'initial');
        if ($layout && $section) {
            $key = "menus:{$cacheVersion}:{$layout}:{$section}";
            $menus = Cache::remember($key, 3600, function () use ($layout, $section) {
                return Menu::query()
                    ->where('layout', $layout)
                    ->where('section', $section)
                    ->orderBy('parent_id')
                    ->orderBy('order')
                    ->get();
            });
            $visibleMenus = $this->filterFlatMenus($menus, $permissionNames);

            return $this->successResponse(MenuResource::collection($visibleMenus), 'Menus filtered retrieved successfully')
                ->header('Cache-Control', 'private, no-store, no-cache, must-revalidate');
        }

        $roots = Cache::remember("menus:{$cacheVersion}:tree", 3600, function () {
            return Menu::with('children.children')->whereNull('parent_id')->orderBy('order')->get();
        });
        $visibleRoots = $this->filterMenuTree($roots, $permissionNames);

        return $this->successResponse(MenuResource::collection($visibleRoots), 'Menu tree retrieved successfully')
            ->header('Cache-Control', 'private, no-store, no-cache, must-revalidate');
    }

    /** @param array<int, string> $permissionNames */
    private function filterFlatMenus(EloquentCollection $menus, array $permissionNames): EloquentCollection
    {
        return $menus
            ->filter(fn (Menu $menu): bool => $this->canView($menu, $permissionNames))
            ->values();
    }

    /** @param array<int, string> $permissionNames */
    private function filterMenuTree(EloquentCollection $menus, array $permissionNames): EloquentCollection
    {
        return $menus
            ->filter(function (Menu $menu) use ($permissionNames): bool {
                $hasVisibleChildren = false;
                if ($menu->relationLoaded('children')) {
                    $menu->setRelation('children', $this->filterMenuTree($menu->children, $permissionNames));
                    $hasVisibleChildren = $menu->children->isNotEmpty();
                }

                return $this->canView($menu, $permissionNames) || $hasVisibleChildren;
            })
            ->values();
    }

    /** @param array<int, string> $permissionNames */
    private function canView(Menu $menu, array $permissionNames): bool
    {
        return $menu->required_permission === null
            || in_array('*', $permissionNames, true)
            || in_array($menu->required_permission, $permissionNames, true);
    }

    /** @return array<int, string> */
    private function permissionNames(?User $user): array
    {
        if ($user === null) {
            return [];
        }

        if ($user->hasRole('superadmin', 'web')) {
            return ['*'];
        }

        return $user->getAllPermissions()
            ->where('guard_name', 'web')
            ->pluck('name')
            ->values()
            ->all();
    }
}
