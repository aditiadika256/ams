<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Traits\UserStamps;

class ExamAnswer extends Model
{
    use HasFactory, UserStamps;

    protected $fillable = [
        'attempt_id',
        'question_id',
        'answer',
        'is_correct',
        'score',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'answer' => 'array',
        'is_correct' => 'boolean',
        'score' => 'decimal:2',
    ];

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(ExamAttempt::class, 'attempt_id');
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }
}
