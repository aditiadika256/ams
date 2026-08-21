<?php

namespace App\Domain\Workspace;

use App\Http\Controllers\Controller;
use App\Models\MediaAsset;
use App\Models\ProgramAccess;
use App\Models\ProgramComponentContent;
use App\Support\Access\ComponentAccessGate;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class WorkspaceMediaController extends Controller
{
    public function show(
        int $programAccess,
        int $mediaAsset,
        ComponentAccessGate $componentGate,
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

        if ($content === null
            || ! $componentGate->allowsRead($user, $access, $content->programComponent->definition->code)
            || ! Storage::disk($asset->disk)->exists($asset->object_key)) {
            abort(404);
        }

        return Storage::disk($asset->disk)->download(
            $asset->object_key,
            $asset->original_name,
            [
                'Content-Type' => $asset->mime_type,
                'Cache-Control' => 'private, no-store',
                'X-Content-Type-Options' => 'nosniff',
            ],
        );
    }
}
