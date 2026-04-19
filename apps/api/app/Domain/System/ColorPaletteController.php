<?php

namespace App\Domain\System;

use App\Http\Controllers\Controller;
use App\Models\ColorPalette;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

/**
 * @OA\Tag(
 *     name="Theme - Color Palettes",
 *     description="Color palette management and theme settings"
 * )
 */
class ColorPaletteController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/v1/admin/theme/palettes",
     *     summary="List all color palettes",
     *     tags={"Theme - Color Palettes"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="List of color palettes"),
     *     @OA\Response(response=500, description="Server error")
     * )
     */
    public function index(): JsonResponse
    {
        try {
            $palettes = ColorPalette::all()->map(fn($p) => $p->toFrontend());
            return response()->json($palettes);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/v1/theme/palettes/active",
     *     summary="Get the active (default) color palette",
     *     tags={"Theme - Color Palettes"},
     *     @OA\Response(response=200, description="Active color palette"),
     *     @OA\Response(response=404, description="No palettes found")
     * )
     */
    public function active(): JsonResponse
    {
        try {
            $palette = ColorPalette::getActive();
            
            if (!$palette) {
                return response()->json(['error' => 'No palettes found'], 404);
            }

            return response()->json($palette->toFrontend());
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/theme/palettes",
     *     summary="Create a new color palette",
     *     tags={"Theme - Color Palettes"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name", "primary", "secondary", "destructive", "muted", "accent", "foreground", "background", "card", "cardForeground", "popover", "popoverForeground", "border", "input", "ring", "chartOne", "chartTwo", "chartThree", "chartFour", "chartFive"},
     *             @OA\Property(property="name", type="string", example="Ocean Blue"),
     *             @OA\Property(property="primary", type="string", example="#3B82F6"),
     *             @OA\Property(property="secondary", type="string", example="#64748B"),
     *             @OA\Property(property="destructive", type="string", example="#EF4444"),
     *             @OA\Property(property="muted", type="string", example="#F1F5F9"),
     *             @OA\Property(property="accent", type="string", example="#8B5CF6"),
     *             @OA\Property(property="foreground", type="string", example="#0F172A"),
     *             @OA\Property(property="background", type="string", example="#FFFFFF"),
     *             @OA\Property(property="card", type="string", example="#FFFFFF"),
     *             @OA\Property(property="cardForeground", type="string", example="#0F172A"),
     *             @OA\Property(property="popover", type="string", example="#FFFFFF"),
     *             @OA\Property(property="popoverForeground", type="string", example="#0F172A"),
     *             @OA\Property(property="border", type="string", example="#E2E8F0"),
     *             @OA\Property(property="input", type="string", example="#E2E8F0"),
     *             @OA\Property(property="ring", type="string", example="#3B82F6"),
     *             @OA\Property(property="chartOne", type="string", example="#3B82F6"),
     *             @OA\Property(property="chartTwo", type="string", example="#10B981"),
     *             @OA\Property(property="chartThree", type="string", example="#F59E0B"),
     *             @OA\Property(property="chartFour", type="string", example="#EF4444"),
     *             @OA\Property(property="chartFive", type="string", example="#8B5CF6")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Palette created"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'primary' => 'required|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'secondary' => 'required|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'destructive' => 'required|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'muted' => 'required|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'accent' => 'required|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'foreground' => 'required|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'background' => 'required|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'card' => 'required|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'cardForeground' => 'required|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'popover' => 'required|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'popoverForeground' => 'required|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'border' => 'required|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'input' => 'required|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'ring' => 'required|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'chartOne' => 'required|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'chartTwo' => 'required|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'chartThree' => 'required|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'chartFour' => 'required|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'chartFive' => 'required|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'darkColors' => 'sometimes|nullable|array',
                'darkColors.primary' => 'sometimes|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'darkColors.secondary' => 'sometimes|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'darkColors.destructive' => 'sometimes|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'darkColors.muted' => 'sometimes|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'darkColors.accent' => 'sometimes|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'darkColors.foreground' => 'sometimes|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'darkColors.background' => 'sometimes|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'darkColors.card' => 'sometimes|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'darkColors.cardForeground' => 'sometimes|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'darkColors.popover' => 'sometimes|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'darkColors.popoverForeground' => 'sometimes|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'darkColors.border' => 'sometimes|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'darkColors.input' => 'sometimes|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'darkColors.ring' => 'sometimes|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'darkColors.chartOne' => 'sometimes|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'darkColors.chartTwo' => 'sometimes|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'darkColors.chartThree' => 'sometimes|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'darkColors.chartFour' => 'sometimes|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'darkColors.chartFive' => 'sometimes|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
            ]);

            // Convert camelCase to snake_case for database
            $data = [
                'name' => $validated['name'],
                'primary' => $validated['primary'],
                'secondary' => $validated['secondary'],
                'destructive' => $validated['destructive'],
                'muted' => $validated['muted'],
                'accent' => $validated['accent'],
                'foreground' => $validated['foreground'],
                'background' => $validated['background'],
                'card' => $validated['card'],
                'card_foreground' => $validated['cardForeground'],
                'popover' => $validated['popover'],
                'popover_foreground' => $validated['popoverForeground'],
                'border' => $validated['border'],
                'input' => $validated['input'],
                'ring' => $validated['ring'],
                'chart_one' => $validated['chartOne'],
                'chart_two' => $validated['chartTwo'],
                'chart_three' => $validated['chartThree'],
                'chart_four' => $validated['chartFour'],
                'chart_five' => $validated['chartFive'],
                'dark_colors' => $validated['darkColors'] ?? null,
                'is_default' => false,
            ];

            $palette = ColorPalette::create($data);
            return response()->json($palette->toFrontend(), 201);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/theme/palettes/{id}",
     *     summary="Get a specific color palette",
     *     tags={"Theme - Color Palettes"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Palette details"),
     *     @OA\Response(response=404, description="Palette not found")
     * )
     */
    public function show(string $id): JsonResponse
    {
        try {
            $palette = ColorPalette::findOrFail($id);
            return response()->json($palette->toFrontend());
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'Palette not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * @OA\Put(
     *     path="/api/v1/admin/theme/palettes/{id}",
     *     summary="Update a color palette",
     *     tags={"Theme - Color Palettes"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="primary", type="string"),
     *             @OA\Property(property="secondary", type="string"),
     *             @OA\Property(property="destructive", type="string"),
     *             @OA\Property(property="muted", type="string"),
     *             @OA\Property(property="accent", type="string"),
     *             @OA\Property(property="foreground", type="string"),
     *             @OA\Property(property="background", type="string"),
     *             @OA\Property(property="card", type="string"),
     *             @OA\Property(property="cardForeground", type="string"),
     *             @OA\Property(property="popover", type="string"),
     *             @OA\Property(property="popoverForeground", type="string"),
     *             @OA\Property(property="border", type="string"),
     *             @OA\Property(property="input", type="string"),
     *             @OA\Property(property="ring", type="string"),
     *             @OA\Property(property="chartOne", type="string"),
     *             @OA\Property(property="chartTwo", type="string"),
     *             @OA\Property(property="chartThree", type="string"),
     *             @OA\Property(property="chartFour", type="string"),
     *             @OA\Property(property="chartFive", type="string")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Palette updated"),
     *     @OA\Response(response=404, description="Palette not found"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $palette = ColorPalette::findOrFail($id);

            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'primary' => 'sometimes|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'secondary' => 'sometimes|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'destructive' => 'sometimes|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'muted' => 'sometimes|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'accent' => 'sometimes|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'foreground' => 'sometimes|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'background' => 'sometimes|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'card' => 'sometimes|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'cardForeground' => 'sometimes|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'popover' => 'sometimes|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'popoverForeground' => 'sometimes|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'border' => 'sometimes|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'input' => 'sometimes|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'ring' => 'sometimes|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'chartOne' => 'sometimes|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'chartTwo' => 'sometimes|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'chartThree' => 'sometimes|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'chartFour' => 'sometimes|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
                'chartFive' => 'sometimes|regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/',
            ]);

            // Convert camelCase to snake_case
            $data = [];
            $camelToSnake = [
                'cardForeground' => 'card_foreground',
                'popoverForeground' => 'popover_foreground',
                'chartOne' => 'chart_one',
                'chartTwo' => 'chart_two',
                'chartThree' => 'chart_three',
                'chartFour' => 'chart_four',
                'chartFive' => 'chart_five',
            ];
            foreach ($validated as $key => $value) {
                if ($key === 'darkColors') {
                    $data['dark_colors'] = $value;
                } elseif (isset($camelToSnake[$key])) {
                    $data[$camelToSnake[$key]] = $value;
                } else {
                    $data[$key] = $value;
                }
            }

            $palette->update($data);
            return response()->json($palette->toFrontend());
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'Palette not found'], 404);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/theme/palettes/{id}/default",
     *     summary="Set a palette as the default",
     *     tags={"Theme - Color Palettes"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Palette set as default"),
     *     @OA\Response(response=404, description="Palette not found")
     * )
     */
    public function setDefault(string $id): JsonResponse
    {
        try {
            $palette = ColorPalette::findOrFail($id);
            $palette->setAsDefault();
            return response()->json($palette->toFrontend());
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'Palette not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/admin/theme/palettes/{id}",
     *     summary="Delete a color palette",
     *     tags={"Theme - Color Palettes"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=204, description="Palette deleted"),
     *     @OA\Response(response=403, description="Cannot delete default palette"),
     *     @OA\Response(response=404, description="Palette not found")
     * )
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $palette = ColorPalette::findOrFail($id);

            // Prevent deletion of default palette
            if ($palette->is_default) {
                return response()->json(['error' => 'Cannot delete the default palette'], 403);
            }

            $palette->delete();
            return response()->json(null, 204);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'Palette not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
