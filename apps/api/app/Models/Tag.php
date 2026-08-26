<?php

namespace App\Models;

use App\Traits\UserStamps;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Tag extends Model
{
    use HasFactory, UserStamps;

    protected $fillable = [
        'code', 'name', 'description', 'sort_order', 'is_active', 'archived_at',
        'created_by', 'updated_by',
    ];

    protected $attributes = ['sort_order' => 0, 'is_active' => true];

    protected $casts = [
        'sort_order' => 'integer',
        'is_active' => 'boolean',
        'archived_at' => 'datetime',
    ];

    public function programs(): BelongsToMany
    {
        return $this->belongsToMany(Program::class)->withTimestamps();
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true)->whereNull('archived_at');
    }
}
