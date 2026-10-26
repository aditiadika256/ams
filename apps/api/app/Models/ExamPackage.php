<?php

namespace App\Models;

use App\Traits\UserStamps;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExamPackage extends Model
{
    use HasFactory, UserStamps;

    protected $fillable = [
        'name',
        'visual_mode',
        'scoring_mode',
        'negative_marking',
        'level',
        'duration_minutes',
        'randomize',
        'show_result_mode',
        'row_status',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'duration_minutes' => 'integer',
        'randomize' => 'boolean',
        'negative_marking' => 'boolean',
        'row_status' => 'integer',
    ];

    public function sections(): HasMany
    {
        return $this->hasMany(ExamSection::class, 'package_id')->orderBy('sort_order');
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(ExamSession::class, 'package_id');
    }

    public function tokens(): HasMany
    {
        return $this->hasMany(ExamSessionToken::class, 'package_id');
    }

    public function itemAnalysisParameters(): HasMany
    {
        return $this->hasMany(ItemAnalysisParameter::class, 'exam_package_id');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('row_status', 1);
    }
}
