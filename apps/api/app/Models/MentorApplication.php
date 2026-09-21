<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MentorApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'email',
        'phone',
        'specialization',
        'ktp_number',
        'cv_url',
        'certificate_url',
        'teaching_video_url',
        'written_test_score',
        'interview_notes',
        'assigned_role',
        'status',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $casts = [
        'written_test_score' => 'decimal:2',
        'reviewed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
