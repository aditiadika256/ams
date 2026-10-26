<?php

namespace App\Models;

use App\Traits\UserStamps;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProctorLog extends Model
{
    use HasFactory, UserStamps;

    protected $fillable = [
        'exam_attempt_id',
        'user_id',
        'event_type',
        'severity',
        'details',
        'resolved_at',
        'row_status',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'details' => 'array',
        'resolved_at' => 'datetime',
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
}
