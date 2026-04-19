<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Traits\UserStamps;

class ExamAttempt extends Model
{
    use HasFactory, UserStamps;

    protected $fillable = [
        'session_id',
        'started_at',
        'submitted_at',
        'score_total',
        'meta',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'submitted_at' => 'datetime',
        'score_total' => 'decimal:2',
        'meta' => 'array',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(ExamSession::class, 'session_id');
    }

    public function answers(): HasMany
    {
        return $this->hasMany(ExamAnswer::class, 'attempt_id');
    }

    public function proctorEvents(): HasMany
    {
        return $this->hasMany(ProctorEvent::class, 'attempt_id');
    }
}
