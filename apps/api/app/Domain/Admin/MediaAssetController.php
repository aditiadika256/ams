<?php

namespace App\Domain\Admin;

use App\Actions\Components\DeleteMediaAsset;
use App\Actions\Components\StoreMediaAsset;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\MediaAssetDeleteRequest;
use App\Http\Requests\Admin\MediaAssetStoreRequest;
use App\Http\Resources\MediaAssetResource;
use App\Models\MediaAsset;
use App\Models\Program;
use Illuminate\Http\JsonResponse;

class MediaAssetController extends Controller
{
    public function store(
        MediaAssetStoreRequest $request,
        Program $program,
        StoreMediaAsset $action,
    ): JsonResponse {
        $asset = $action->handle(
            $program,
            $request->file('file'),
            $request->user(),
            $request->validated('reason'),
        );

        return $this->createdResponse(new MediaAssetResource($asset), 'Private media uploaded successfully');
    }

    public function destroy(
        MediaAssetDeleteRequest $request,
        Program $program,
        MediaAsset $mediaAsset,
        DeleteMediaAsset $action,
    ): JsonResponse {
        if ($mediaAsset->program_id !== $program->id) {
            abort(404);
        }

        $action->handle($mediaAsset, $request->user(), $request->validated('reason'));

        return $this->noContentResponse();
    }
}
