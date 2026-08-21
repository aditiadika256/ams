<?php

namespace App\Domain\Admin;

use App\Actions\Components\ArchiveProgramComponentContent;
use App\Actions\Components\RestoreProgramComponentContent;
use App\Actions\Components\SaveProgramComponentContent;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProgramComponentContentDeleteRequest;
use App\Http\Requests\Admin\ProgramComponentContentIndexRequest;
use App\Http\Requests\Admin\ProgramComponentContentRestoreRequest;
use App\Http\Requests\Admin\ProgramComponentContentStoreRequest;
use App\Http\Requests\Admin\ProgramComponentContentUpdateRequest;
use App\Http\Resources\ProgramComponentContentResource;
use App\Models\Program;
use App\Models\ProgramComponent;
use App\Models\ProgramComponentContent;
use Illuminate\Http\JsonResponse;

class ProgramComponentContentController extends Controller
{
    public function index(
        ProgramComponentContentIndexRequest $request,
        Program $program,
        ProgramComponent $programComponent,
    ): JsonResponse {
        $this->assertScope($program, $programComponent);
        $contents = $programComponent->contents()
            ->with('mediaAsset')
            ->when($request->boolean('include_archived'), fn ($query) => $query->withTrashed())
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return $this->successResponse(
            ProgramComponentContentResource::collection($contents),
            'Program component contents retrieved successfully',
        );
    }

    public function store(
        ProgramComponentContentStoreRequest $request,
        Program $program,
        ProgramComponent $programComponent,
        SaveProgramComponentContent $action,
    ): JsonResponse {
        $this->assertScope($program, $programComponent);
        $content = $action->handle($program, $programComponent, $request->validated(), $request->user());

        return $this->createdResponse(
            new ProgramComponentContentResource($content),
            'Program component content created successfully',
        );
    }

    public function show(
        ProgramComponentContentIndexRequest $request,
        Program $program,
        ProgramComponent $programComponent,
        ProgramComponentContent $content,
    ): JsonResponse {
        $this->assertScope($program, $programComponent, $content);
        $request->user()->can('view', $content) || abort(403);

        return $this->successResponse(
            new ProgramComponentContentResource($content->load('mediaAsset')),
            'Program component content retrieved successfully',
        );
    }

    public function update(
        ProgramComponentContentUpdateRequest $request,
        Program $program,
        ProgramComponent $programComponent,
        ProgramComponentContent $content,
        SaveProgramComponentContent $action,
    ): JsonResponse {
        $this->assertScope($program, $programComponent, $content);
        $saved = $action->handle($program, $programComponent, $request->validated(), $request->user(), $content);

        return $this->successResponse(
            new ProgramComponentContentResource($saved),
            'Program component content updated successfully',
        );
    }

    public function destroy(
        ProgramComponentContentDeleteRequest $request,
        Program $program,
        ProgramComponent $programComponent,
        ProgramComponentContent $content,
        ArchiveProgramComponentContent $action,
    ): JsonResponse {
        $this->assertScope($program, $programComponent, $content);
        $action->handle($content, $request->user(), $request->validated('reason'));

        return $this->noContentResponse();
    }

    public function restore(
        ProgramComponentContentRestoreRequest $request,
        Program $program,
        ProgramComponent $programComponent,
        ProgramComponentContent $content,
        RestoreProgramComponentContent $action,
    ): JsonResponse {
        $this->assertScope($program, $programComponent, $content);
        $restored = $action->handle($content, $request->user(), $request->validated('reason'));

        return $this->successResponse(
            new ProgramComponentContentResource($restored),
            'Program component content restored successfully',
        );
    }

    private function assertScope(
        Program $program,
        ProgramComponent $programComponent,
        ?ProgramComponentContent $content = null,
    ): void {
        if ($programComponent->program_id !== $program->id
            || ($content !== null && $content->program_component_id !== $programComponent->id)) {
            abort(404);
        }
    }
}
