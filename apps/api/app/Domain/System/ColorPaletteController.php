<?php

namespace App\Domain\System;

use App\Http\Controllers\Controller;
use App\Models\ColorPalette;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class ColorPaletteController extends Controller
{
    /**
     * Display a listing of all color palettes
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
     * Get the active (default) color palette
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
     * Store a newly created color palette
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
     * Display the specified color palette
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
     * Update the specified color palette
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
            foreach ($validated as $key => $value) {
                if ($key === 'cardForeground') {
                    $data['card_foreground'] = $value;
                } elseif ($key === 'popoverForeground') {
                    $data['popover_foreground'] = $value;
                } elseif ($key === 'chartOne') {
                    $data['chart_one'] = $value;
                } elseif ($key === 'chartTwo') {
                    $data['chart_two'] = $value;
                } elseif ($key === 'chartThree') {
                    $data['chart_three'] = $value;
                } elseif ($key === 'chartFour') {
                    $data['chart_four'] = $value;
                } elseif ($key === 'chartFive') {
                    $data['chart_five'] = $value;
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
     * Set a palette as the default one
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
     * Remove the specified color palette
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
