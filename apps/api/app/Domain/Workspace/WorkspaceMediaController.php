<?php

namespace App\Domain\Workspace;

use App\Http\Controllers\Controller;
use App\Models\MediaAsset;
use App\Models\ProgramAccess;
use App\Models\ProgramComponentContent;
use App\Models\ProgramLesson;
use App\Support\Access\ComponentAccessGate;
use App\Support\Media\CloudflareMediaService;
use Symfony\Component\HttpFoundation\StreamedResponse;

class WorkspaceMediaController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/v1/workspace/accesses/{programAccess}/media-assets/{mediaAsset}",
     *     summary="Streaming atau unduh berkas media siswa",
     *     description="Menyajikan berkas media privat program (PDF, Video, Dokumen) dengan opsi inline streaming untuk View Page atau attachment untuk download",
     *     tags={"Workspace"},
     *     @OA\Parameter(name="programAccess", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="mediaAsset", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="inline", in="query", required=false, @OA\Schema(type="boolean"), description="Set 1/true untuk pratinjau inline viewer di browser tanpa dialog unduh"),
     *     @OA\Response(response=200, description="Berkas media disajikan (streamed/download)"),
     *     @OA\Response(response=403, description="Akses ditolak"),
     *     @OA\Response(response=404, description="Berkas atau akses tidak ditemukan")
     * )
     */
    public function show(
        int $programAccess,
        int $mediaAsset,
        ComponentAccessGate $componentGate,
        CloudflareMediaService $mediaService,
    ): StreamedResponse {
        $user = request()->user();
        $access = ProgramAccess::query()
            ->forUser($user->id)
            ->findOrFail($programAccess);
        $asset = MediaAsset::query()
            ->where('program_id', $access->program_id)
            ->findOrFail($mediaAsset);

        $content = ProgramComponentContent::query()
            ->published()
            ->where('media_asset_id', $asset->id)
            ->whereHas('programComponent', fn ($component) => $component
                ->where('program_id', $access->program_id)
                ->where('is_enabled', true)
                ->whereHas('definition', fn ($definition) => $definition
                    ->whereNull('deleted_at')
                    ->where('is_available', true)))
            ->with('programComponent.definition')
            ->first();

        $lessonExists = ProgramLesson::query()
            ->where('media_asset_id', $asset->id)
            ->where('is_published', true)
            ->whereHas('module', fn ($module) => $module
                ->where('program_id', $access->program_id)
                ->where('is_published', true))
            ->exists();
        $hasContentAccess = $content !== null
            && $componentGate->allowsRead($user, $access, $content->programComponent->definition->code);
        $hasMaterialAccess = $lessonExists && $componentGate->allowsRead($user, $access, 'material');

        if (! $hasContentAccess && ! $hasMaterialAccess) {
            abort(403, 'Anda tidak memiliki hak akses untuk membuka berkas media ini.');
        }

        $isInline = request()->boolean('inline') || request()->query('view') === '1';

        return $mediaService->createStreamResponse(
            $asset->disk,
            $asset->object_key,
            $asset->original_name,
            $asset->mime_type,
            $isInline,
        );
    }
}
