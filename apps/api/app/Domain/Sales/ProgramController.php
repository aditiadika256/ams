<?php

namespace App\Domain\Sales;

use App\Http\Controllers\Controller;
use App\Http\Requests\Sales\ProgramIndexRequest;
use App\Http\Resources\ProgramResource;
use App\Queries\ProgramCatalogQuery;
use Illuminate\Http\JsonResponse;

class ProgramController extends Controller
{
    public function __construct(private readonly ProgramCatalogQuery $catalog) {}

    public function index(ProgramIndexRequest $request): JsonResponse
    {
        $programs = $this->catalog->paginate($request->validated());
        $data = ProgramResource::collection($programs)->response()->getData(true);

        return $this->successResponse($data, 'Programs retrieved successfully')
            ->header('Cache-Control', 'public, max-age=0, no-cache, must-revalidate');
    }

    public function show(string $program): JsonResponse
    {
        return $this->successResponse(
            new ProgramResource($this->catalog->findVisible($program)),
            'Program retrieved successfully'
        );
    }
}
