<?php

namespace App\Domain\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\MenuResource;
use App\Models\Menu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: 'Admin Menus',
    description: 'Menu management for superadmin'
)]
class MenuController extends Controller
{
    #[OA\Get(
        path: '/api/v1/admin/menus',
        summary: 'List menus (flat or tree)',
        tags: ['Admin Menus'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\QueryParameter(name: 'layout', description: 'Filter by layout (users|admin)', required: false, schema: new OA\Schema(type: 'string')),
            new OA\QueryParameter(name: 'section', description: 'Filter by section (topbar|bottomnavigation|sidebar|header)', required: false, schema: new OA\Schema(type: 'string')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Menus retrieved'),
            new OA\Response(response: 401, description: 'Unauthorized'),
        ]
    )]
    public function index(Request $request)
    {
        $layout = $request->query('layout');
        $section = $request->query('section');
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
        } else {
            $menus = Menu::query()->orderBy('parent_id')->orderBy('order')->get();
        }

        return $this->successResponse(MenuResource::collection($menus), 'Menus retrieved successfully')
            ->header('Cache-Control', 'private, no-store, no-cache, must-revalidate');
    }

    #[OA\Post(
        path: '/api/v1/admin/menus',
        summary: 'Create menu item',
        tags: ['Admin Menus'],
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name', 'url', 'layout'],
                properties: [
                    new OA\Property(property: 'name', type: 'string', example: 'Dashboard'),
                    new OA\Property(property: 'icon', type: 'string', example: 'lucide:home', nullable: true),
                    new OA\Property(property: 'url', type: 'string', example: '/admin/dashboard'),
                    new OA\Property(property: 'layout', type: 'string', enum: ['users', 'admin']),
                    new OA\Property(property: 'section', type: 'string', enum: ['topbar', 'bottomnavigation', 'sidebar', 'header'], nullable: true),
                    new OA\Property(property: 'parent_id', type: 'integer', nullable: true),
                    new OA\Property(property: 'order', type: 'integer', example: 0, nullable: true),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Menu created'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'icon' => ['nullable', 'string', 'max:100'],
            'url' => ['required', 'string', 'max:255'],
            'layout' => ['required', 'in:users,admin'],
            'section' => ['sometimes', 'nullable', 'string', 'in:topbar,bottomnavigation,sidebar,header'],
            'parent_id' => ['nullable', 'integer', 'exists:menus,id'],
            'order' => ['nullable', 'integer', 'min:0'],
        ]);

        // Set default section based on layout if not provided
        if (empty($validated['section'])) {
            $validated['section'] = $validated['layout'] === 'admin' ? 'sidebar' : 'topbar';
        }

        if ($validated['layout'] === 'admin' && !in_array($validated['section'], ['sidebar', 'header'])) {
            return $this->validationErrorResponse(['section' => ['Section harus sidebar atau header untuk layout admin']]);
        }
        if ($validated['layout'] === 'users' && !in_array($validated['section'], ['topbar', 'bottomnavigation'])) {
            return $this->validationErrorResponse(['section' => ['Section harus topbar atau bottomnavigation untuk layout users']]);
        }

        $validated['created_by'] = $this->userId($request);
        $validated['updated_by'] = $this->userId($request);

        $menu = Menu::create($validated);
        $this->flushCaches();
        return $this->createdResponse(new MenuResource($menu), 'Menu created successfully');
    }

    #[OA\Put(
        path: '/api/v1/admin/menus/{id}',
        summary: 'Update menu item',
        tags: ['Admin Menus'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Menu updated'),
            new OA\Response(response: 404, description: 'Menu not found'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function update(Request $request, int $id)
    {
        $menu = Menu::find($id);
        if (!$menu) {
            return $this->notFoundResponse('Menu not found');
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:100'],
            'icon' => ['nullable', 'string', 'max:100'],
            'url' => ['sometimes', 'required', 'string', 'max:255'],
            'layout' => ['sometimes', 'required', 'in:users,admin'],
            'section' => ['sometimes', 'nullable', 'string', 'in:topbar,bottomnavigation,sidebar,header'],
            'parent_id' => ['nullable', 'integer', 'exists:menus,id'],
            'order' => ['nullable', 'integer', 'min:0'],
        ]);

        // Set default section based on layout if not provided
        if (isset($validated['layout']) && empty($validated['section'])) {
            $validated['section'] = $validated['layout'] === 'admin' ? 'sidebar' : 'topbar';
        }

        if (isset($validated['layout']) && $validated['layout'] === 'admin' && isset($validated['section']) && !in_array($validated['section'], ['sidebar', 'header'])) {
            return $this->validationErrorResponse(['section' => ['Section harus sidebar atau header untuk layout admin']]);
        }
        if (isset($validated['layout']) && $validated['layout'] === 'users' && isset($validated['section']) && !in_array($validated['section'], ['topbar', 'bottomnavigation'])) {
            return $this->validationErrorResponse(['section' => ['Section harus topbar atau bottomnavigation untuk layout users']]);
        }

        $validated['updated_by'] = $this->userId($request);

        $menu->update($validated);
        $this->flushCaches();
        return $this->successResponse(new MenuResource($menu->refresh()), 'Menu updated successfully');
    }

    #[OA\Delete(
        path: '/api/v1/admin/menus/{id}',
        summary: 'Delete menu item',
        tags: ['Admin Menus'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 204, description: 'Menu deleted'),
            new OA\Response(response: 404, description: 'Menu not found'),
        ]
    )]
    public function destroy(int $id)
    {
        $menu = Menu::find($id);
        if (!$menu) {
            return $this->notFoundResponse('Menu not found');
        }

        DB::transaction(function () use ($menu) {
            $menu->children()->delete();
            $menu->delete();
        });
        $this->flushCaches();

        return $this->noContentResponse();
    }

    protected function flushCaches(): void
    {
        Cache::forever('menus:cache_version', Str::uuid()->toString());
        Cache::forget('menus:tree');

        foreach (['users:topbar', 'users:bottomnavigation', 'admin:sidebar', 'admin:header'] as $suffix) {
            Cache::forget("menus:{$suffix}");
        }
    }
}
