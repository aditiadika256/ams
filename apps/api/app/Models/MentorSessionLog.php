<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MentorSessionLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'program_session_id',
        'mentor_id',
        'user_id',
        'topic',
        'notes',
        'student_count',
        'duration_minutes',
        'hourly_rate',
        'total_honor',
        'status',
        'locked_at',
    ];

    protected $casts = [
        'duration_minutes' => 'integer',
        'student_count' => 'integer',
        'hourly_rate' => 'decimal:2',
        'total_honor' => 'decimal:2',
        'locked_at' => 'datetime',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(ProgramSession::class, 'program_session_id');
    }

    public function mentor(): BelongsTo
    {
        return $this->belongsTo(Mentor::class, 'mentor_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
