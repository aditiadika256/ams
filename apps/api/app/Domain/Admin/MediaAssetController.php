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
}
