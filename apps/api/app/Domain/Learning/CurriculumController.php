<?php

namespace App\Domain\Learning;

use App\Http\Controllers\Controller;
use App\Models\Program;
use App\Models\ProgramLesson;
use App\Models\ProgramModule;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CurriculumController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/v1/learning/programs/{program}/curriculum",
     *     summary="Get program curriculum",
     *     tags={"Learning"},
     *     @OA\Response(response=200, description="Curriculum structure")
     * )
     */
    public function index(Program $program)
    {
        return response()->json($program->modules()->with('lessons')->get());
    }

    // --- Modules ---

    public function storeModule(Request $request, Program $program)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'order' => 'integer',
            'is_published' => 'boolean',
        ]);

        $module = $program->modules()->create($request->all());

        return response()->json($module, 201);
    }

    public function updateModule(Request $request, ProgramModule $module)
    {
        $request->validate([
            'title' => 'string|max:255',
            'description' => 'nullable|string',
            'order' => 'integer',
            'is_published' => 'boolean',
        ]);

        $module->update($request->all());

        return response()->json($module);
    }

    public function destroyModule(ProgramModule $module)
    {
        $module->delete();
        return response()->json(['message' => 'Module deleted']);
    }

    // --- Lessons ---

    public function storeLesson(Request $request, ProgramModule $module)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content_type' => 'required|in:video,text,quiz,assignment',
            'content_url' => 'nullable|string',
            'content_body' => 'nullable|string',
            'duration_minutes' => 'integer',
            'order' => 'integer',
            'is_published' => 'boolean',
            'is_preview' => 'boolean',
        ]);

        $data = $request->all();
        if (!isset($data['slug'])) {
            $data['slug'] = Str::slug($data['title']);
        }

        $lesson = $module->lessons()->create($data);

        return response()->json($lesson, 201);
    }

    public function updateLesson(Request $request, ProgramLesson $lesson)
    {
        $request->validate([
            'title' => 'string|max:255',
            'content_type' => 'in:video,text,quiz,assignment',
            'content_url' => 'nullable|string',
            'content_body' => 'nullable|string',
            'duration_minutes' => 'integer',
            'order' => 'integer',
            'is_published' => 'boolean',
            'is_preview' => 'boolean',
        ]);

        $data = $request->all();
        if (isset($data['title']) && !isset($data['slug'])) {
            $data['slug'] = Str::slug($data['title']);
        }

        $lesson->update($data);

        return response()->json($lesson);
    }

    public function destroyLesson(ProgramLesson $lesson)
    {
        $lesson->delete();
        return response()->json(['message' => 'Lesson deleted']);
    }
}
