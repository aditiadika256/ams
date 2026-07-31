<?php

namespace App\Models;

use App\Traits\UserStamps;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProgramLevel extends Model
{
    use HasFactory, UserStamps;

    protected $fillable = [
        'code',
        'name',
        'row_status',
        'sort_order',
        'created_by',
        'updated_by',
    ];

    protected $attributes = [
        'row_status' => 1,
        'sort_order' => 0,
    ];

    protected function casts(): array
    {
        return [
            'row_status' => 'integer',
            'sort_order' => 'integer',
        ];
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('row_status', 1);
    }

    public function programs(): HasMany
    {
        return $this->hasMany(Program::class, 'program_level_id');
    }
}
