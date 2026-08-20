<?php

namespace App\Domain\Workspace;

use App\Exceptions\DomainAuthorizationException;
use App\Http\Controllers\Controller;
use App\Models\ProgramAccess;
use App\Support\Access\ComponentAccessGate;
use Illuminate\Http\JsonResponse;

class WorkspaceCurriculumController extends Controller
{
    public function __invoke(int $programAccess, ComponentAccessGate $componentGate): JsonResponse
    {
        $user = request()->user();
        $access = ProgramAccess::query()
            ->forUser($user->id)
            ->findOrFail($programAccess);

        if (! $componentGate->allows($user, $access, 'material')) {
            throw new DomainAuthorizationException(
                'COMPONENT_ACCESS_DENIED',
                'Akses materi tidak tersedia untuk enrollment ini.',
                ['program_access_id' => $access->id, 'component' => 'material'],
            );
        }

        $modules = $access->program()->firstOrFail()
            ->modules()
            ->where('is_published', true)
            ->with(['lessons' => fn ($lessons) => $lessons
                ->where('is_published', true)
                ->orderBy('order')])
            ->orderBy('order')
            ->get();

        return $this->successResponse($modules, 'Curriculum retrieved successfully');
    }
}
