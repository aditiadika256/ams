<?php

namespace App\Models;

use App\Traits\UserStamps;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProgramComponent extends Model
{
    use HasFactory, UserStamps;

    protected $fillable = [
        'program_id', 'component_definition_id', 'is_enabled', 'label',
        'sort_order', 'configuration', 'created_by', 'updated_by',
    ];

    protected $attributes = ['is_enabled' => true, 'sort_order' => 0];

    protected $casts = [
        'is_enabled' => 'boolean',
        'sort_order' => 'integer',
        'configuration' => 'array',
    ];

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function definition(): BelongsTo
    {
        return $this->belongsTo(ComponentDefinition::class, 'component_definition_id');
    }

    public function scopeEnabled(Builder $query): Builder
    {
        return $query->where('is_enabled', true);
    }
}
