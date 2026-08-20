<?php

namespace App\Models;

use App\Traits\UserStamps;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProgramRelation extends Model
{
    use HasFactory, UserStamps;

    protected $fillable = [
        'parent_program_id', 'child_program_id', 'sort_order', 'is_required',
        'metadata', 'created_by', 'updated_by',
    ];

    protected $attributes = ['sort_order' => 0, 'is_required' => true];

    protected $casts = [
        'sort_order' => 'integer',
        'is_required' => 'boolean',
        'metadata' => 'array',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Program::class, 'parent_program_id');
    }

    public function child(): BelongsTo
    {
        return $this->belongsTo(Program::class, 'child_program_id');
    }
}
