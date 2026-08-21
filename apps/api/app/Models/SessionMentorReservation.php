<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SessionMentorReservation extends Model
{
    protected $fillable = [
        'session_mentor_assignment_id', 'program_session_id', 'program_access_id',
        'status', 'idempotency_key', 'reserved_at', 'released_at',
    ];

    protected $attributes = ['status' => 'ACTIVE'];

    protected $casts = [
        'reserved_at' => 'datetime',
        'released_at' => 'datetime',
    ];

    public function assignment(): BelongsTo
    {
        return $this->belongsTo(SessionMentorAssignment::class, 'session_mentor_assignment_id');
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(ProgramSession::class, 'program_session_id');
    }

    public function programAccess(): BelongsTo
    {
        return $this->belongsTo(ProgramAccess::class);
    }
}
