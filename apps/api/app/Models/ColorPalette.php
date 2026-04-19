<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ColorPalette extends Model
{
    protected $fillable = [
        'name',
        'primary',
        'secondary',
        'destructive',
        'muted',
        'accent',
        'foreground',
        'background',
        'card',
        'card_foreground',
        'popover',
        'popover_foreground',
        'border',
        'input',
        'ring',
        'chart_one',
        'chart_two',
        'chart_three',
        'chart_four',
        'chart_five',
        'is_default',
        'dark_colors',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'dark_colors' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the active (default) palette
     */
    public static function getActive(): ?self
    {
        return self::where('is_default', true)->first() ?? self::first();
    }

    /**
     * Set this palette as default
     */
    public function setAsDefault(): void
    {
        self::query()->update(['is_default' => false]);
        $this->update(['is_default' => true]);
    }

    /**
     * Export palette as array with camelCase keys for frontend
     */
    public function toFrontend(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'primary' => $this->primary,
            'secondary' => $this->secondary,
            'destructive' => $this->destructive,
            'muted' => $this->muted,
            'accent' => $this->accent,
            'foreground' => $this->foreground,
            'background' => $this->background,
            'card' => $this->card,
            'cardForeground' => $this->card_foreground,
            'popover' => $this->popover,
            'popoverForeground' => $this->popover_foreground,
            'border' => $this->border,
            'input' => $this->input,
            'ring' => $this->ring,
            'chartOne' => $this->chart_one,
            'chartTwo' => $this->chart_two,
            'chartThree' => $this->chart_three,
            'chartFour' => $this->chart_four,
            'chartFive' => $this->chart_five,
            'darkColors' => $this->dark_colors,
            'isDefault' => $this->is_default,
            'createdAt' => $this->created_at->toIso8601String(),
            'updatedAt' => $this->updated_at->toIso8601String(),
        ];
    }
}
