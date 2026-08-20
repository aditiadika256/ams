<?php

namespace App\Domain\Access;

use App\Actions\Access\EnrollFreeProgram;
use App\Http\Controllers\Controller;
use App\Http\Requests\Access\FreeEnrollmentRequest;
use App\Http\Resources\ProgramAccessResource;
use Illuminate\Http\JsonResponse;

class FreeEnrollmentController extends Controller
{
    public function store(FreeEnrollmentRequest $request, EnrollFreeProgram $action): JsonResponse
    {
        $data = $request->validated();
        [$access, $wasExisting] = $action->handle(
            $request->user(),
            $data['program_id'],
            $data['program_batch_id'] ?? null,
        );

        return $wasExisting
            ? $this->successResponse(new ProgramAccessResource($access), 'Enrollment already exists')
            : $this->createdResponse(new ProgramAccessResource($access), 'Free enrollment created');
    }
}
