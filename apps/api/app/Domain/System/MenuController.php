<?php

namespace App\Domain\System;

use App\Http\Controllers\Controller;
use App\Http\Resources\MenuResource;
use App\Models\Menu;
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
            return $this->successResponse(MenuResource::collection($menus), 'Menus filtered retrieved successfully');
        }

        $roots = Menu::with('children.children')->whereNull('parent_id')->orderBy('order')->get();
        return $this->successResponse(MenuResource::collection($roots), 'Menu tree retrieved successfully');
    }
}
