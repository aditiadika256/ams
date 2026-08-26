<?php

namespace App\Domain\Admin;

use App\Actions\Programs\SaveProgramBatch;
use App\Actions\Programs\TransitionBatch;
use App\Enums\BatchStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\DeliveryTransitionRequest;
use App\Http\Requests\Admin\ProgramBatchStoreRequest;
use App\Http\Requests\Admin\ProgramBatchUpdateRequest;
use App\Http\Resources\ProgramBatchResource;
use App\Models\Program;
use App\Models\ProgramBatch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProgramBatchController extends Controller
{
    public function index(Request $request, Program $program): JsonResponse
    {
        $this->authorizeRequest($request);
        $batches = $program->batches()
            ->orderByDesc('starts_at')
            ->orderBy('id')
            ->get();

        return $this->successResponse(ProgramBatchResource::collection($batches), 'Batches retrieved successfully');
    }

    public function store(
        ProgramBatchStoreRequest $request,
        Program $program,
        SaveProgramBatch $action,
    ): JsonResponse {
        $batch = $action->handle($program, $request->validated(), $request->user());

        return $this->createdResponse(new ProgramBatchResource($batch), 'Batch created successfully');
    }

    public function show(Request $request, Program $program, ProgramBatch $batch): JsonResponse
    {
        $this->authorizeRequest($request);
        $this->assertScoped($program, $batch);

        return $this->successResponse(
            new ProgramBatchResource($batch->load('sessions')),
            'Batch retrieved successfully',
        );
    }

    public function update(
        ProgramBatchUpdateRequest $request,
        Program $program,
        ProgramBatch $batch,
        SaveProgramBatch $action,
    ): JsonResponse {
        $this->assertScoped($program, $batch);
        $batch = $action->handle($program, $request->validated(), $request->user(), $batch);

        return $this->successResponse(new ProgramBatchResource($batch), 'Batch updated successfully');
    }

    public function destroy(Request $request, Program $program, ProgramBatch $batch): JsonResponse
    {
        $this->authorizeRequest($request);
        $this->assertScoped($program, $batch);
        abort_if($batch->status !== BatchStatus::Draft || $batch->sessions()->exists(), 409, 'Only empty draft batches can be deleted.');
        $batch->delete();

        return $this->noContentResponse();
    }

    public function transition(
        DeliveryTransitionRequest $request,
        Program $program,
        ProgramBatch $batch,
        TransitionBatch $action,
    ): JsonResponse {
        $this->assertScoped($program, $batch);
        $data = $request->validated();
        $batch = $action->handle($batch, BatchStatus::from($data['status']), $request->user(), $data['reason']);

        return $this->successResponse(new ProgramBatchResource($batch), 'Batch status updated successfully');
    }

    private function authorizeRequest(Request $request): void
    {
        abort_unless($request->user()?->checkPermissionTo('program-batch.manage', 'web'), 403);
    }

    private function assertScoped(Program $program, ProgramBatch $batch): void
    {
        abort_unless($batch->program_id === $program->id, 404);
    }
}
