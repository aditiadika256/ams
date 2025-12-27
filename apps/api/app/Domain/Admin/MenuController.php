<?php

namespace App\Domain\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\MenuResource;
use App\Models\Menu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
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
    )]
    public function index(Request $request)
    {
        $layout = $request->query('layout');
        $section = $request->query('section');
        if ($layout && $section) {
            $key = "menus:{$layout}:{$section}";
            $menus = Cache::remember($key, 300, function () use ($layout, $section) {
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

        return $this->successResponse(MenuResource::collection($menus), 'Menus retrieved successfully');
    }

    #[OA\Post(
        path: '/api/v1/admin/menus',
        summary: 'Create menu item',
        tags: ['Admin Menus'],
        security: [['bearerAuth' => []]],
    )]
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'icon' => ['nullable', 'string', 'max:100'],
            'url' => ['required', 'string', 'max:255'],
            'layout' => ['required', 'in:users,admin'],
            'section' => ['required', 'in:topbar,bottomnavigation,sidebar,header'],
            'parent_id' => ['nullable', 'integer', 'exists:menus,id'],
            'order' => ['nullable', 'integer', 'min:0'],
        ]);

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
            'section' => ['sometimes', 'required', 'in:topbar,bottomnavigation,sidebar,header'],
            'parent_id' => ['nullable', 'integer', 'exists:menus,id'],
            'order' => ['nullable', 'integer', 'min:0'],
        ]);

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
        foreach (['users:topbar', 'users:bottomnavigation', 'admin:sidebar', 'admin:header'] as $suffix) {
            Cache::forget("menus:{$suffix}");
        }
    }
}
