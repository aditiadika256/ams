<?php

namespace App\Domain\Learning;

use App\Http\Controllers\Controller;
use App\Models\Program;
use App\Models\ProgramLesson;
use App\Models\ProgramModule;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * @OA\Tag(
 *     name="Learning - Curriculum",
 *     description="Curriculum, Module & Lesson Management"
 * )
 */
class CurriculumController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/v1/learning/programs/{program}/curriculum",
     *     summary="Get program curriculum",
     *     tags={"Learning - Curriculum"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="program", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Curriculum structure")
     * )
     */
    public function index(Program $program)
    {
        return response()->json($program->modules()->with('lessons')->get());
    }

    // --- Modules ---

    /**
     * @OA\Post(
     *     path="/api/v1/learning/programs/{program}/modules",
     *     summary="Create a module for a program",
     *     tags={"Learning - Curriculum"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="program", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"title"},
     *             @OA\Property(property="title", type="string", example="Module 1: Introduction"),
     *             @OA\Property(property="description", type="string", nullable=true),
     *             @OA\Property(property="order", type="integer", example=1),
     *             @OA\Property(property="is_published", type="boolean", example=true)
     *         )
     *     ),
     *     @OA\Response(response=201, description="Module created"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
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

    /**
     * @OA\Put(
     *     path="/api/v1/learning/modules/{module}",
     *     summary="Update a module",
     *     tags={"Learning - Curriculum"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="module", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         @OA\JsonContent(
     *             @OA\Property(property="title", type="string"),
     *             @OA\Property(property="description", type="string", nullable=true),
     *             @OA\Property(property="order", type="integer"),
     *             @OA\Property(property="is_published", type="boolean")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Module updated"),
     *     @OA\Response(response=404, description="Module not found")
     * )
     */
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

    /**
     * @OA\Delete(
     *     path="/api/v1/learning/modules/{module}",
     *     summary="Delete a module",
     *     tags={"Learning - Curriculum"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="module", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Module deleted"),
     *     @OA\Response(response=404, description="Module not found")
     * )
     */
    public function destroyModule(ProgramModule $module)
    {
        $module->delete();
        return response()->json(['message' => 'Module deleted']);
    }

    // --- Lessons ---

    /**
     * @OA\Post(
     *     path="/api/v1/learning/modules/{module}/lessons",
     *     summary="Create a lesson in a module",
     *     tags={"Learning - Curriculum"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="module", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"title", "content_type"},
     *             @OA\Property(property="title", type="string", example="Lesson 1: Getting Started"),
     *             @OA\Property(property="content_type", type="string", enum={"video", "text", "quiz", "assignment"}),
     *             @OA\Property(property="content_url", type="string", nullable=true),
     *             @OA\Property(property="content_body", type="string", nullable=true),
     *             @OA\Property(property="duration_minutes", type="integer", example=30),
     *             @OA\Property(property="order", type="integer", example=1),
     *             @OA\Property(property="is_published", type="boolean", example=true),
     *             @OA\Property(property="is_preview", type="boolean", example=false)
     *         )
     *     ),
     *     @OA\Response(response=201, description="Lesson created"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
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

    /**
     * @OA\Put(
     *     path="/api/v1/learning/lessons/{lesson}",
     *     summary="Update a lesson",
     *     tags={"Learning - Curriculum"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="lesson", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         @OA\JsonContent(
     *             @OA\Property(property="title", type="string"),
     *             @OA\Property(property="content_type", type="string", enum={"video", "text", "quiz", "assignment"}),
     *             @OA\Property(property="content_url", type="string", nullable=true),
     *             @OA\Property(property="content_body", type="string", nullable=true),
     *             @OA\Property(property="duration_minutes", type="integer"),
     *             @OA\Property(property="order", type="integer"),
     *             @OA\Property(property="is_published", type="boolean"),
     *             @OA\Property(property="is_preview", type="boolean")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Lesson updated"),
     *     @OA\Response(response=404, description="Lesson not found")
     * )
     */
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

    /**
     * @OA\Delete(
     *     path="/api/v1/learning/lessons/{lesson}",
     *     summary="Delete a lesson",
     *     tags={"Learning - Curriculum"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="lesson", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Lesson deleted"),
     *     @OA\Response(response=404, description="Lesson not found")
     * )
     */
    public function destroyLesson(ProgramLesson $lesson)
    {
        $lesson->delete();
        return response()->json(['message' => 'Lesson deleted']);
    }
}
