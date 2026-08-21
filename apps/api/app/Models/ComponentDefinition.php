<?php

namespace App\Models;

use App\Enums\ComponentHandlerTemplate;
use App\Traits\UserStamps;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ComponentDefinition extends Model
{
    use HasFactory, SoftDeletes, UserStamps;

    protected $fillable = [
        'code', 'name', 'description', 'handler_template', 'handler_key', 'icon',
        'config_schema', 'is_system', 'is_available', 'sort_order',
        'created_by', 'updated_by',
    ];

    protected $attributes = [
        'handler_template' => 'NATIVE',
        'is_system' => false,
        'is_available' => true,
        'sort_order' => 0,
    ];

    protected $casts = [
        'handler_template' => ComponentHandlerTemplate::class,
        'config_schema' => 'array',
        'is_system' => 'boolean',
        'is_available' => 'boolean',
        'sort_order' => 'integer',
        'deleted_at' => 'datetime',
    ];

    public function programComponents(): HasMany
    {
        return $this->hasMany(ProgramComponent::class);
    }

    public function programs(): BelongsToMany
    {
        return $this->belongsToMany(Program::class, 'program_components')
            ->withPivot(['is_enabled', 'label', 'sort_order', 'configuration'])
            ->wherePivotNull('deleted_at')
            ->withTimestamps();
    }

    public function scopeAvailable(Builder $query): Builder
    {
        return $query->where('is_available', true);
    }
}
