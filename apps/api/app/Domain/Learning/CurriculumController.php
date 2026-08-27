<?php

namespace App\Domain\Learning;

use App\Actions\Audit\RecordDomainAudit;
use App\Actions\Learning\SaveProgramLesson;
use App\Actions\Learning\SaveProgramModule;
use App\Http\Controllers\Controller;
use App\Http\Requests\Learning\ProgramContentDeleteRequest;
use App\Http\Requests\Learning\ProgramCurriculumIndexRequest;
use App\Http\Requests\Learning\ProgramLessonStoreRequest;
use App\Http\Requests\Learning\ProgramLessonUpdateRequest;
use App\Http\Requests\Learning\ProgramModuleStoreRequest;
use App\Http\Requests\Learning\ProgramModuleUpdateRequest;
use App\Http\Resources\ProgramLessonResource;
use App\Http\Resources\ProgramModuleResource;
use App\Models\Program;
use App\Models\ProgramLesson;
use App\Models\ProgramModule;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class CurriculumController extends Controller
{
    public function index(ProgramCurriculumIndexRequest $request, Program $program): JsonResponse
    {
        $modules = $program->modules()
            ->with('lessons.mediaAsset')
            ->orderBy('order')
            ->get();

        return $this->successResponse(ProgramModuleResource::collection($modules), 'Curriculum retrieved successfully');
    }

    public function storeModule(
        ProgramModuleStoreRequest $request,
        Program $program,
        SaveProgramModule $action,
    ): JsonResponse {
        $module = $action->handle($program, $request->validated(), $request->user());

        return $this->createdResponse(new ProgramModuleResource($module), 'Program module created successfully');
    }

    public function updateModule(
        ProgramModuleUpdateRequest $request,
        ProgramModule $module,
        SaveProgramModule $action,
    ): JsonResponse {
        $saved = $action->handle($module->program, $request->validated(), $request->user(), $module);

        return $this->successResponse(new ProgramModuleResource($saved), 'Program module updated successfully');
    }

    public function destroyModule(
        ProgramContentDeleteRequest $request,
        ProgramModule $module,
        RecordDomainAudit $audit,
    ): JsonResponse {
        DB::transaction(function () use ($request, $module, $audit): void {
            $model = ProgramModule::query()->lockForUpdate()->findOrFail($module->id);
            $before = $model->getAttributes();
            $audit->handle($model, 'program_module.deleted', $request->user(), $request->validated('reason'), $before);
            $model->delete();
        });

        return $this->noContentResponse();
    }

    public function storeLesson(
        ProgramLessonStoreRequest $request,
        ProgramModule $module,
        SaveProgramLesson $action,
    ): JsonResponse {
        $lesson = $action->handle($module, $request->validated(), $request->user());

        return $this->createdResponse(new ProgramLessonResource($lesson), 'Program lesson created successfully');
    }

    public function updateLesson(
        ProgramLessonUpdateRequest $request,
        ProgramLesson $lesson,
        SaveProgramLesson $action,
    ): JsonResponse {
        $saved = $action->handle($lesson->module, $request->validated(), $request->user(), $lesson);

        return $this->successResponse(new ProgramLessonResource($saved), 'Program lesson updated successfully');
    }

    public function destroyLesson(
        ProgramContentDeleteRequest $request,
        ProgramLesson $lesson,
        RecordDomainAudit $audit,
    ): JsonResponse {
        DB::transaction(function () use ($request, $lesson, $audit): void {
            $model = ProgramLesson::query()->lockForUpdate()->findOrFail($lesson->id);
            $before = $model->getAttributes();
            $audit->handle($model, 'program_lesson.deleted', $request->user(), $request->validated('reason'), $before);
            $model->delete();
        });

        return $this->noContentResponse();
    }
}
