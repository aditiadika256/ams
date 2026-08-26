<?php

namespace App\Domain\Admin;

use App\Actions\Programs\SyncProgramRelations;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProgramRelationsUpdateRequest;
use App\Models\Program;
use Illuminate\Http\JsonResponse;

class ProgramRelationController extends Controller
{
    public function update(
        ProgramRelationsUpdateRequest $request,
        Program $program,
        SyncProgramRelations $action,
    ): JsonResponse {
        $data = $request->validated();
        $children = $action->handle($program, $data['children'], $request->user(), $data['reason']);

        return $this->successResponse(
            $children->map(fn (Program $child): array => [
                'id' => $child->id,
                'name' => $child->name,
                'slug' => $child->slug,
                'sort_order' => $child->pivot->sort_order,
                'is_required' => $child->pivot->is_required,
            ])->values(),
            'Program relations updated successfully',
        );
    }
}
