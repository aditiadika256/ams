# Color Palette API Documentation

## Endpoints

### Get All Palettes
```
GET /api/v1/theme/palettes
```
Returns all color palettes.

### Get Active Palette
```
GET /api/v1/theme/palettes/active
```
Returns the currently active/default palette.

### Create Palette
```
POST /api/v1/theme/palettes
Content-Type: application/json

{
  "name": "Palette Name",
  "primary": "#3b82f6",
  "secondary": "#8b5cf6",
  "destructive": "#ef4444",
  "muted": "#6b7280",
  "accent": "#06b6d4",
  "foreground": "#1f2937",
  "background": "#ffffff",
  "card": "#f9fafb",
  "cardForeground": "#1f2937",
  "popover": "#ffffff",
  "popoverForeground": "#1f2937",
  "border": "#e5e7eb",
  "input": "#e5e7eb",
  "ring": "#3b82f6",
  "chartOne": "#3b82f6",
  "chartTwo": "#8b5cf6",
  "chartThree": "#ec4899",
  "chartFour": "#f59e0b",
  "chartFive": "#10b981"
}
```

### Update Palette
```
PUT /api/v1/theme/palettes/{id}
Content-Type: application/json

{
  "name": "Updated Name",
  ...colors
}
```

### Set Default Palette
```
POST /api/v1/theme/palettes/{id}/default
```
Sets the specified palette as the active default.

### Delete Palette
```
DELETE /api/v1/theme/palettes/{id}
```

## Database Schema (Laravel)

```php
Schema::create('color_palettes', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('primary')->default('#3b82f6');
    $table->string('secondary')->default('#8b5cf6');
    $table->string('destructive')->default('#ef4444');
    $table->string('muted')->default('#6b7280');
    $table->string('accent')->default('#06b6d4');
    $table->string('foreground')->default('#1f2937');
    $table->string('background')->default('#ffffff');
    $table->string('card')->default('#f9fafb');
    $table->string('card_foreground')->default('#1f2937');
    $table->string('popover')->default('#ffffff');
    $table->string('popover_foreground')->default('#1f2937');
    $table->string('border')->default('#e5e7eb');
    $table->string('input')->default('#e5e7eb');
    $table->string('ring')->default('#3b82f6');
    $table->string('chart_one')->default('#3b82f6');
    $table->string('chart_two')->default('#8b5cf6');
    $table->string('chart_three')->default('#ec4899');
    $table->string('chart_four')->default('#f59e0b');
    $table->string('chart_five')->default('#10b981');
    $table->boolean('is_default')->default(false);
    $table->timestamps();
});
```

## Laravel Controller Example

```php
<?php

namespace App\Http\Controllers;

use App\Models\ColorPalette;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ColorPaletteController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(ColorPalette::all());
    }

    public function getActive(): JsonResponse
    {
        $palette = ColorPalette::where('is_default', true)->first();
        return response()->json($palette ?? ColorPalette::first());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'primary' => 'required|string',
            'secondary' => 'required|string',
            'destructive' => 'required|string',
            'muted' => 'required|string',
            'accent' => 'required|string',
            'foreground' => 'required|string',
            'background' => 'required|string',
            'card' => 'required|string',
            'cardForeground' => 'required|string',
            'popover' => 'required|string',
            'popoverForeground' => 'required|string',
            'border' => 'required|string',
            'input' => 'required|string',
            'ring' => 'required|string',
            'chartOne' => 'required|string',
            'chartTwo' => 'required|string',
            'chartThree' => 'required|string',
            'chartFour' => 'required|string',
            'chartFive' => 'required|string',
        ]);

        $palette = ColorPalette::create($validated);
        return response()->json($palette, 201);
    }

    public function update(Request $request, ColorPalette $palette): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'primary' => 'sometimes|string',
            'secondary' => 'sometimes|string',
            'destructive' => 'sometimes|string',
            'muted' => 'sometimes|string',
            'accent' => 'sometimes|string',
            'foreground' => 'sometimes|string',
            'background' => 'sometimes|string',
            'card' => 'sometimes|string',
            'cardForeground' => 'sometimes|string',
            'popover' => 'sometimes|string',
            'popoverForeground' => 'sometimes|string',
            'border' => 'sometimes|string',
            'input' => 'sometimes|string',
            'ring' => 'sometimes|string',
            'chartOne' => 'sometimes|string',
            'chartTwo' => 'sometimes|string',
            'chartThree' => 'sometimes|string',
            'chartFour' => 'sometimes|string',
            'chartFive' => 'sometimes|string',
        ]);

        $palette->update($validated);
        return response()->json($palette);
    }

    public function setDefault(ColorPalette $palette): JsonResponse
    {
        ColorPalette::where('is_default', true)->update(['is_default' => false]);
        $palette->update(['is_default' => true]);
        return response()->json($palette);
    }

    public function destroy(ColorPalette $palette): JsonResponse
    {
        if ($palette->is_default) {
            return response()->json(['error' => 'Cannot delete default palette'], 403);
        }
        $palette->delete();
        return response()->json(null, 204);
    }
}
```
