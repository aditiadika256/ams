<?php

namespace App\Domain\Admin;

use App\Actions\Programs\ArchiveTag;
use App\Actions\Programs\SaveTag;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\TagStoreRequest;
use App\Http\Requests\Admin\TagUpdateRequest;
use App\Http\Resources\TagResource;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TagController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorizeRequest($request);
        $tags = Tag::query()
            ->when($request->filled('search'), fn ($query) => $query->where(
                fn ($nested) => $nested
                    ->where('name', 'like', '%'.$request->string('search').'%')
                    ->orWhere('code', 'like', '%'.$request->string('search').'%')
            ))
            ->when(! $request->boolean('include_archived'), fn ($query) => $query->whereNull('archived_at'))
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return $this->successResponse(TagResource::collection($tags), 'Tags retrieved successfully');
    }

    public function store(TagStoreRequest $request, SaveTag $action): JsonResponse
    {
        $tag = $action->handle($request->validated(), $request->user());

        return $this->createdResponse(new TagResource($tag), 'Tag created successfully');
    }

    public function show(Request $request, Tag $tag): JsonResponse
    {
        $this->authorizeRequest($request);

        return $this->successResponse(new TagResource($tag), 'Tag retrieved successfully');
    }

    public function update(TagUpdateRequest $request, Tag $tag, SaveTag $action): JsonResponse
    {
        $tag = $action->handle($request->validated(), $request->user(), $tag);

        return $this->successResponse(new TagResource($tag), 'Tag updated successfully');
    }

    public function destroy(Request $request, Tag $tag, ArchiveTag $action): JsonResponse
    {
        $this->authorizeRequest($request);
        $action->handle($tag, $request->user());

        return $this->noContentResponse();
    }

    private function authorizeRequest(Request $request): void
    {
        abort_unless($request->user()?->checkPermissionTo('program-tag.manage', 'web'), 403);
    }
}
