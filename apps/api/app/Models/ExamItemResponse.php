<?php

namespace App\Models;

use App\Traits\UserStamps;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExamItemResponse extends Model
{
    use HasFactory, UserStamps;

    protected $fillable = [
        'exam_attempt_id',
        'user_id',
        'question_id',
        'selected_option_id',
        'selected_option_key',
        'is_correct',
        'score_earned',
        'response_time_seconds',
        'tab_switch_count',
        'row_status',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'is_correct' => 'integer',
        'score_earned' => 'decimal:3',
        'response_time_seconds' => 'integer',
        'tab_switch_count' => 'integer',
        'row_status' => 'integer',
    ];

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(ExamAttempt::class, 'exam_attempt_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }
}
