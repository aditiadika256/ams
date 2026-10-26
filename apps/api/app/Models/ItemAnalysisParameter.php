<?php

namespace App\Models;

use App\Traits\UserStamps;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ItemAnalysisParameter extends Model
{
    use HasFactory, UserStamps;

    protected $fillable = [
        'exam_package_id',
        'question_id',
        'difficulty_b',
        'discrimination_a',
        'pseudo_guessing_c',
        'distractor_efficiency',
        'fit_status',
        'is_dropped',
        'sample_size',
        'analyzed_at',
        'row_status',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'difficulty_b' => 'decimal:3',
        'discrimination_a' => 'decimal:3',
        'pseudo_guessing_c' => 'decimal:3',
        'distractor_efficiency' => 'array',
        'is_dropped' => 'boolean',
        'sample_size' => 'integer',
        'analyzed_at' => 'datetime',
        'row_status' => 'integer',
    ];

    public function package(): BelongsTo
    {
        return $this->belongsTo(ExamPackage::class, 'exam_package_id');
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }
}
