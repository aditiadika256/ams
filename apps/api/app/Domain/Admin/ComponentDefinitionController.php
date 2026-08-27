<?php

namespace App\Domain\Admin;

use App\Actions\Components\ArchiveComponentDefinition;
use App\Actions\Components\ForceDeleteComponentDefinition;
use App\Actions\Components\RestoreComponentDefinition;
use App\Actions\Components\SaveComponentDefinition;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ComponentDefinitionDeleteRequest;
use App\Http\Requests\Admin\ComponentDefinitionForceDeleteRequest;
use App\Http\Requests\Admin\ComponentDefinitionIndexRequest;
use App\Http\Requests\Admin\ComponentDefinitionRestoreRequest;
use App\Http\Requests\Admin\ComponentDefinitionStoreRequest;
use App\Http\Requests\Admin\ComponentDefinitionUpdateRequest;
use App\Http\Resources\ComponentDefinitionResource;
use App\Models\ComponentDefinition;
use Illuminate\Http\JsonResponse;

class ComponentDefinitionController extends Controller
{
    public function index(ComponentDefinitionIndexRequest $request): JsonResponse
    {
        $definitions = ComponentDefinition::query()
            ->withCount(['programComponents as usage_count' => fn ($query) => $query->withTrashed()])
            ->when($request->boolean('include_archived'), fn ($query) => $query->withTrashed())
            ->when($request->filled('search'), fn ($query) => $query->where(
                fn ($search) => $search
                    ->whereLike('name', '%'.$request->string('search').'%')
                    ->orWhereLike('code', '%'.$request->string('search').'%')
            ))
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return $this->successResponse(
            ComponentDefinitionResource::collection($definitions),
            'Component definitions retrieved successfully',
        );
    }

    public function store(ComponentDefinitionStoreRequest $request, SaveComponentDefinition $action): JsonResponse
    {
        $definition = $action->handle($request->validated(), $request->user());

        return $this->createdResponse(
            new ComponentDefinitionResource($definition->loadCount('programComponents')),
            'Component definition created successfully',
        );
    }

    public function show(ComponentDefinitionIndexRequest $request, ComponentDefinition $componentDefinition): JsonResponse
    {
        $request->user()->can('view', $componentDefinition) || abort(403);

        return $this->successResponse(
            new ComponentDefinitionResource($componentDefinition->loadCount('programComponents')),
            'Component definition retrieved successfully',
        );
    }

    public function update(
        ComponentDefinitionUpdateRequest $request,
        ComponentDefinition $componentDefinition,
        SaveComponentDefinition $action,
    ): JsonResponse {
        $definition = $action->handle($request->validated(), $request->user(), $componentDefinition);

        return $this->successResponse(
            new ComponentDefinitionResource($definition->loadCount('programComponents')),
            'Component definition updated successfully',
        );
    }

    public function destroy(
        ComponentDefinitionDeleteRequest $request,
        ComponentDefinition $componentDefinition,
        ArchiveComponentDefinition $action,
    ): JsonResponse {
        $action->handle($componentDefinition, $request->user(), $request->validated('reason'));

        return $this->noContentResponse();
    }

    public function restore(
        ComponentDefinitionRestoreRequest $request,
        ComponentDefinition $componentDefinition,
        RestoreComponentDefinition $action,
    ): JsonResponse {
        $definition = $action->handle($componentDefinition, $request->user(), $request->validated('reason'));

        return $this->successResponse(
            new ComponentDefinitionResource($definition->loadCount('programComponents')),
            'Component definition restored successfully',
        );
    }

    public function forceDelete(
        ComponentDefinitionForceDeleteRequest $request,
        ComponentDefinition $componentDefinition,
        ForceDeleteComponentDefinition $action,
    ): JsonResponse {
        $action->handle($componentDefinition, $request->user(), $request->validated('reason'));

        return $this->noContentResponse();
    }
}
