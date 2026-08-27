<?php

namespace App\Domain\Workspace;

use App\Actions\Components\SubmitProgramComponentForm;
use App\Enums\ComponentHandlerTemplate;
use App\Exceptions\DomainAuthorizationException;
use App\Http\Controllers\Controller;
use App\Http\Requests\WorkspaceComponentSubmissionRequest;
use App\Http\Resources\ProgramComponentSubmissionResource;
use App\Http\Resources\WorkspaceComponentContentResource;
use App\Models\ProgramAccess;
use App\Models\ProgramComponent;
use App\Models\ProgramComponentContent;
use App\Support\Access\ComponentAccessGate;
use Illuminate\Http\JsonResponse;

class WorkspaceComponentContentController extends Controller
{
    public function index(
        int $programAccess,
        int $programComponent,
        ComponentAccessGate $componentGate,
    ): JsonResponse {
        [$access, $component] = $this->resolveAccessAndComponent($programAccess, $programComponent);

        if (! $componentGate->allowsRead(request()->user(), $access, $component->definition->code)) {
            throw new DomainAuthorizationException(
                'COMPONENT_ACCESS_DENIED',
                'Isi component tidak tersedia untuk enrollment ini.',
                ['program_access_id' => $access->id, 'component' => $component->definition->code],
            );
        }

        $contents = $component->contents()
            ->published()
            ->with('mediaAsset')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Workspace component contents retrieved successfully',
            'data' => WorkspaceComponentContentResource::collection($contents)->resolve(),
            'meta' => [
                'component' => [
                    'id' => $component->id,
                    'code' => $component->definition->code,
                    'name' => $component->definition->name,
                    'label' => $component->label,
                    'handler_template' => $component->definition->handler_template->value,
                    'handler_key' => $component->definition->handler_key,
                ],
            ],
        ]);
    }

    public function submit(
        WorkspaceComponentSubmissionRequest $request,
        int $programAccess,
        int $programComponent,
        int $content,
        SubmitProgramComponentForm $action,
    ): JsonResponse {
        [$access, $component] = $this->resolveAccessAndComponent($programAccess, $programComponent);
        $contentModel = ProgramComponentContent::query()
            ->where('program_component_id', $component->id)
            ->findOrFail($content);
        $result = $action->handle(
            $request->user(),
            $access,
            $component,
            $contentModel,
            $request->validated('answers'),
        );
        $resource = new ProgramComponentSubmissionResource($result['submission']);

        return $result['created']
            ? $this->createdResponse($resource, 'Form submitted successfully')
            : $this->successResponse($resource, 'Form submission already recorded');
    }

    /** @return array{ProgramAccess, ProgramComponent} */
    private function resolveAccessAndComponent(int $accessId, int $componentId): array
    {
        $user = request()->user();
        $access = ProgramAccess::query()->forUser($user->id)->findOrFail($accessId);
        $component = ProgramComponent::query()
            ->where('program_id', $access->program_id)
            ->with('definition')
            ->findOrFail($componentId);

        if ($component->definition === null
            || $component->definition->trashed()
            || ! $component->definition->is_available
            || $component->definition->handler_template === ComponentHandlerTemplate::Native) {
            throw new DomainAuthorizationException(
                'COMPONENT_ACCESS_DENIED',
                'Component tidak tersedia melalui generic content endpoint.',
                ['component_id' => $component->id],
            );
        }

        return [$access, $component];
    }
}
