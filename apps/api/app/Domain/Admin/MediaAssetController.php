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
use Illuminate\Http\Request;

class MediaAssetController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/v1/admin/programs/{program}/media-assets",
     *     summary="Daftar media asset program",
     *     description="Mengambil daftar media asset privat yang terunggah pada program untuk keperluan konten kurikulum dan komponen",
     *     tags={"Program Management"},
     *     @OA\Parameter(name="program", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(
     *         response=200,
     *         description="Daftar media asset berhasil diambil",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Media assets retrieved successfully"),
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/MediaAssetResource"))
     *         )
     *     ),
     *     @OA\Response(response=403, description="Akses ditolak")
     * )
     */
    public function index(Request $request, Program $program): JsonResponse
    {
        $user = $request->user();
        if (! $user || (! $user->checkPermissionTo('program.view', 'web') && ! $user->checkPermissionTo('media-asset.upload', 'web'))) {
            abort(403);
        }

        $assets = $program->mediaAssets()->latest()->get();

        return $this->successResponse(
            MediaAssetResource::collection($assets),
            'Media assets retrieved successfully'
        );
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/programs/{program}/media-assets",
     *     summary="Unggah berkas media baru ke program",
     *     description="Mengunggah berkas media materi pembelajaran yang disimpan ke storage privat / Cloudflare R2 dengan CDN URL otomatis",
     *     tags={"Program Management"},
     *     @OA\Parameter(name="program", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 required={"file", "reason"},
     *                 @OA\Property(property="file", type="string", format="binary", description="Berkas yang diunggah (maks. 100MB)"),
     *                 @OA\Property(property="reason", type="string", example="Mengunggah modul praktikum PDF")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Berkas media berhasil diunggah",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Private media uploaded successfully"),
     *             @OA\Property(property="data", ref="#/components/schemas/MediaAssetResource")
     *         )
     *     ),
     *     @OA\Response(response=422, description="Validasi berkas gagal"),
     *     @OA\Response(response=403, description="Akses ditolak")
     * )
     */
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

    /**
     * @OA\Delete(
     *     path="/api/v1/admin/programs/{program}/media-assets/{mediaAsset}",
     *     summary="Hapus berkas media program",
     *     description="Menghapus berkas media dari database dan storage storage Cloudflare / lokal",
     *     tags={"Program Management"},
     *     @OA\Parameter(name="program", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="mediaAsset", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"reason"},
     *             @OA\Property(property="reason", type="string", example="Menghapus materi usang")
     *         )
     *     ),
     *     @OA\Response(response=204, description="Berkas media berhasil dihapus"),
     *     @OA\Response(response=404, description="Media tidak ditemukan"),
     *     @OA\Response(response=403, description="Akses ditolak")
     * )
     */
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

    /**
     * @OA\Get(
     *     path="/api/v1/admin/media-library",
     *     summary="Daftar berkas Media Library terpusat",
     *     description="Mengambil seluruh koleksi berkas media materi pembelajaran lintas program atau unassigned dengan filter pencarian, tipe mime, dan folder",
     *     tags={"Media Library"},
     *     @OA\Parameter(name="search", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="program_id", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="type", in="query", required=false, @OA\Schema(type="string", enum={"all", "pdf", "video", "audio", "image", "document"})),
     *     @OA\Parameter(name="folder", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="page", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Response(
     *         response=200,
     *         description="Daftar media library berhasil dimuat",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Media library retrieved successfully"),
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/MediaAssetResource"))
     *         )
     *     ),
     *     @OA\Response(response=403, description="Akses ditolak")
     * )
     */
    public function library(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user || (! $user->checkPermissionTo('program.view', 'web') && ! $user->checkPermissionTo('media-asset.upload', 'web') && ! $user->checkPermissionTo('component-definition.view', 'web'))) {
            abort(403);
        }

        $query = MediaAsset::query()->with(['program:id,name,slug', 'uploader:id,name']);

        if ($search = trim((string) $request->input('search'))) {
            $query->where(function ($q) use ($search): void {
                $q->where('original_name', 'ilike', "%{$search}%")
                    ->orWhere('object_key', 'ilike', "%{$search}%")
                    ->orWhere('folder', 'ilike', "%{$search}%")
                    ->orWhereHas('program', function ($pq) use ($search): void {
                        $pq->where('name', 'ilike', "%{$search}%");
                    });
            });
        }

        if ($programId = $request->input('program_id')) {
            if ($programId === 'none' || $programId === 'null') {
                $query->whereNull('program_id');
            } elseif (is_numeric($programId)) {
                $query->where('program_id', (int) $programId);
            }
        }

        if ($folder = $request->input('folder')) {
            if ($folder !== 'all') {
                $query->where('folder', $folder);
            }
        }

        if ($type = $request->input('type')) {
            switch (strtolower($type)) {
                case 'pdf':
                    $query->where(function ($q): void {
                        $q->where('mime_type', 'like', '%pdf%')->orWhere('extension', 'pdf');
                    });
                    break;
                case 'video':
                    $query->where(function ($q): void {
                        $q->where('mime_type', 'like', 'video/%')->orWhereIn('extension', ['mp4', 'webm', 'mov', 'mkv']);
                    });
                    break;
                case 'audio':
                    $query->where(function ($q): void {
                        $q->where('mime_type', 'like', 'audio/%')->orWhereIn('extension', ['mp3', 'wav', 'm4a', 'ogg']);
                    });
                    break;
                case 'image':
                    $query->where(function ($q): void {
                        $q->where('mime_type', 'like', 'image/%')->orWhereIn('extension', ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg']);
                    });
                    break;
                case 'document':
                    $query->whereIn('extension', ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv']);
                    break;
            }
        }

        $totalStorageBytes = (int) (clone $query)->sum('size_bytes');

        $perPage = (int) $request->input('per_page', 30);
        $assets = $perPage > 0
            ? $query->latest()->paginate($perPage)
            : $query->latest()->get();

        return $this->successResponse(
            MediaAssetResource::collection($assets),
            'Media library retrieved successfully',
            [
                'total_storage_bytes' => $totalStorageBytes,
                'total_storage_mb' => round($totalStorageBytes / (1024 * 1024), 2),
            ]
        );
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/media-library/upload",
     *     summary="Unggah berkas baru ke Media Library",
     *     description="Mengunggah berkas baru ke Media Library terpusat dengan dukungan penyimpanan Cloudflare R2 / CDN",
     *     tags={"Media Library"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 required={"file", "reason"},
     *                 @OA\Property(property="file", type="string", format="binary"),
     *                 @OA\Property(property="reason", type="string", example="Upload materi modul pembelajaran"),
     *                 @OA\Property(property="program_id", type="integer", nullable=true),
     *                 @OA\Property(property="folder", type="string", example="documents")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=201, description="Berkas berhasil diunggah ke Media Library"),
     *     @OA\Response(response=422, description="Validasi berkas gagal"),
     *     @OA\Response(response=403, description="Akses ditolak")
     * )
     */
    public function libraryUpload(
        MediaAssetStoreRequest $request,
        StoreMediaAsset $action,
    ): JsonResponse {
        $program = null;
        if ($programId = $request->input('program_id')) {
            $program = Program::query()->find($programId);
        }

        $asset = $action->handle(
            $program,
            $request->file('file'),
            $request->user(),
            $request->validated('reason'),
            $request->input('folder', 'general'),
        );

        return $this->createdResponse(new MediaAssetResource($asset), 'Media asset uploaded to library successfully');
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/admin/media-library/{mediaAsset}",
     *     summary="Hapus berkas dari Media Library",
     *     description="Menghapus berkas dari Media Library dan storage Cloudflare R2",
     *     tags={"Media Library"},
     *     @OA\Parameter(name="mediaAsset", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"reason"},
     *             @OA\Property(property="reason", type="string", example="Menghapus materi kadaluwarsa")
     *         )
     *     ),
     *     @OA\Response(response=204, description="Berkas media berhasil dihapus"),
     *     @OA\Response(response=403, description="Akses ditolak")
     * )
     */
    public function destroyDirect(
        MediaAssetDeleteRequest $request,
        MediaAsset $mediaAsset,
        DeleteMediaAsset $action,
    ): JsonResponse {
        $action->handle($mediaAsset, $request->user(), $request->validated('reason'));

        return $this->noContentResponse();
    }
}
