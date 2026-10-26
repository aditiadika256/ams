<?php

namespace App\Models;

use App\Traits\UserStamps;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ExamSection extends Model
{
    use HasFactory, UserStamps;

    protected $fillable = [
        'package_id',
        'subject',
        'sort_order',
        'transition_mode',
        'break_duration_seconds',
        'section_timer_minutes',
        'num_questions',
        'bank_id',
        'difficulty_mix',
        'row_status',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'sort_order' => 'integer',
        'num_questions' => 'integer',
        'break_duration_seconds' => 'integer',
        'section_timer_minutes' => 'integer',
        'difficulty_mix' => 'array',
        'row_status' => 'integer',
    ];

    public function package(): BelongsTo
    {
        return $this->belongsTo(ExamPackage::class, 'package_id');
    }

    public function bank(): BelongsTo
    {
        return $this->belongsTo(QuestionBank::class, 'bank_id');
    }

    public function questions(): BelongsToMany
    {
        return $this->belongsToMany(Question::class, 'exam_section_questions', 'exam_section_id', 'question_id')
            ->withPivot(['sort_order', 'custom_weight', 'row_status'])
            ->withTimestamps()
            ->orderByPivot('sort_order');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('row_status', 1);
    }
}
