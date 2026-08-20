<?php

namespace App\Domain\Admin;

use App\Actions\Programs\SyncProgramComponents;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProgramComponentsUpdateRequest;
use App\Http\Resources\ProgramComponentResource;
use App\Models\Program;
use Illuminate\Http\JsonResponse;

class ProgramComponentController extends Controller
{
    public function update(
        ProgramComponentsUpdateRequest $request,
        Program $program,
        SyncProgramComponents $action,
    ): JsonResponse {
        $data = $request->validated();
        $components = $action->handle($program, $data['components'], $request->user(), $data['reason']);

        return $this->successResponse(
            ProgramComponentResource::collection($components),
            'Program components updated successfully',
        );
    }
}
