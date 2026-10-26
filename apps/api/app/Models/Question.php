<?php

namespace App\Models;

use App\Enums\QuestionType;
use App\Traits\UserStamps;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Question extends Model
{
    use HasFactory, UserStamps;

    protected $fillable = [
        'context_id',
        'bank_id',
        'type',
        'stem',
        'options',
        'answer_key',
        'difficulty',
        'estimated_seconds',
        'tags',
        'status',
        'row_status',
        'score_weight',
        'explanation',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'type' => QuestionType::class,
        'options' => 'array',
        'answer_key' => 'array',
        'tags' => 'array',
        'score_weight' => 'decimal:2',
        'estimated_seconds' => 'integer',
        'row_status' => 'integer',
    ];

    /**
     * Wacana induk tempat butir soal ini bernaung.
     */
    public function context(): BelongsTo
    {
        return $this->belongsTo(AssessmentContext::class, 'context_id');
    }

    /**
     * Bank soal tempat butir soal ini dikelompokkan.
     */
    public function bank(): BelongsTo
    {
        return $this->belongsTo(QuestionBank::class, 'bank_id');
    }

    /**
     * Scope: Hanya butir soal aktif.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('row_status', 1);
    }
}
