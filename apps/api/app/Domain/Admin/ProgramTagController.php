<?php

namespace App\Domain\Admin;

use App\Actions\Programs\SyncProgramTags;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProgramTagsUpdateRequest;
use App\Http\Resources\TagResource;
use App\Models\Program;
use Illuminate\Http\JsonResponse;

class ProgramTagController extends Controller
{
    public function update(
        ProgramTagsUpdateRequest $request,
        Program $program,
        SyncProgramTags $action,
    ): JsonResponse {
        $data = $request->validated();
        $tags = $action->handle($program, $data['tag_ids'], $request->user(), $data['reason']);

        return $this->successResponse(TagResource::collection($tags), 'Program tags updated successfully');
    }
}
