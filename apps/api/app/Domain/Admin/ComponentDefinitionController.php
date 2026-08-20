<?php

namespace App\Domain\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ComponentDefinitionResource;
use App\Models\ComponentDefinition;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ComponentDefinitionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()?->checkPermissionTo('program-component.manage', 'web'), 403);

        $definitions = ComponentDefinition::query()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return $this->successResponse(
            ComponentDefinitionResource::collection($definitions),
            'Component definitions retrieved successfully',
        );
    }
}
