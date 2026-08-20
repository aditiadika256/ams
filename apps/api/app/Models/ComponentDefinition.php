<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ComponentDefinition extends Model
{
    use HasFactory;

    protected $fillable = [
        'code', 'name', 'description', 'config_schema', 'is_available', 'sort_order',
    ];

    protected $attributes = ['is_available' => true, 'sort_order' => 0];

    protected $casts = [
        'config_schema' => 'array',
        'is_available' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function programComponents(): HasMany
    {
        return $this->hasMany(ProgramComponent::class);
    }

    public function programs(): BelongsToMany
    {
        return $this->belongsToMany(Program::class, 'program_components')
            ->withPivot(['is_enabled', 'label', 'sort_order', 'configuration'])
            ->withTimestamps();
    }

    public function scopeAvailable(Builder $query): Builder
    {
        return $query->where('is_available', true);
    }
}
