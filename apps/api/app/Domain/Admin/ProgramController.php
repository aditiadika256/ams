<?php

namespace App\Domain\Admin;

use App\Actions\Programs\CloneProgram;
use App\Actions\Programs\CreateProgram;
use App\Actions\Programs\DeleteProgram;
use App\Actions\Programs\TransitionProgram;
use App\Actions\Programs\UpdateProgram;
use App\Enums\ProgramStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProgramCloneRequest;
use App\Http\Requests\Admin\ProgramIndexRequest;
use App\Http\Requests\Admin\ProgramStoreRequest;
use App\Http\Requests\Admin\ProgramTransitionRequest;
use App\Http\Requests\Admin\ProgramUpdateRequest;
use App\Http\Resources\AdminProgramResource;
use App\Models\Program;
use App\Queries\AdminProgramQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class ProgramController extends Controller
{
    public function index(ProgramIndexRequest $request, AdminProgramQuery $query): JsonResponse
    {
        $data = AdminProgramResource::collection($query->paginate($request->validated()))
            ->response()
            ->getData(true);

        return $this->successResponse($data, 'Programs retrieved successfully');
    }

    public function store(
        ProgramStoreRequest $request,
        CreateProgram $action,
        AdminProgramQuery $query,
    ): JsonResponse {
        $program = $action->handle($request->validated(), $request->user());

        return $this->createdResponse(new AdminProgramResource($query->load($program)), 'Program created successfully');
    }

    public function show(Program $program, AdminProgramQuery $query): JsonResponse
    {
        Gate::authorize('view', $program);

        return $this->successResponse(new AdminProgramResource($query->load($program)), 'Program retrieved successfully');
    }

    public function update(
        ProgramUpdateRequest $request,
        Program $program,
        UpdateProgram $action,
        AdminProgramQuery $query,
    ): JsonResponse {
        $updated = $action->handle($program, $request->validated(), $request->user());

        return $this->successResponse(new AdminProgramResource($query->load($updated)), 'Program updated successfully');
    }

    public function destroy(Program $program, DeleteProgram $action): JsonResponse
    {
        Gate::authorize('delete', $program);
        $action->handle($program);

        return $this->noContentResponse();
    }

    public function publish(
        ProgramTransitionRequest $request,
        Program $program,
        TransitionProgram $action,
        AdminProgramQuery $query,
    ): JsonResponse {
        return $this->transition($request, $program, ProgramStatus::Published, 'publish', $action, $query);
    }

    public function unpublish(
        ProgramTransitionRequest $request,
        Program $program,
        TransitionProgram $action,
        AdminProgramQuery $query,
    ): JsonResponse {
        return $this->transition($request, $program, ProgramStatus::Unpublished, 'publish', $action, $query);
    }

    public function archive(
        ProgramTransitionRequest $request,
        Program $program,
        TransitionProgram $action,
        AdminProgramQuery $query,
    ): JsonResponse {
        return $this->transition($request, $program, ProgramStatus::Archived, 'archive', $action, $query);
    }

    public function restore(
        ProgramTransitionRequest $request,
        Program $program,
        TransitionProgram $action,
        AdminProgramQuery $query,
    ): JsonResponse {
        return $this->transition($request, $program, ProgramStatus::Draft, 'archive', $action, $query);
    }

    public function clone(
        ProgramCloneRequest $request,
        Program $program,
        CloneProgram $action,
        AdminProgramQuery $query,
    ): JsonResponse {
        Gate::authorize('clone', $program);
        $data = $request->validated();
        $clone = $action->handle($program, $data['name'], $data['slug'], $request->user(), $data['reason']);

        return $this->createdResponse(new AdminProgramResource($query->load($clone)), 'Program cloned successfully');
    }

    private function transition(
        ProgramTransitionRequest $request,
        Program $program,
        ProgramStatus $target,
        string $ability,
        TransitionProgram $action,
        AdminProgramQuery $query,
    ): JsonResponse {
        Gate::authorize($ability, $program);
        $updated = $action->handle($program, $target, $request->user(), $request->validated('reason'));

        return $this->successResponse(new AdminProgramResource($query->load($updated)), 'Program status updated successfully');
    }
}
