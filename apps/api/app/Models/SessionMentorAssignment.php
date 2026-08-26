<?php

namespace App\Models;

use App\Traits\UserStamps;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SessionMentorAssignment extends Model
{
    use HasFactory, UserStamps;

    protected $fillable = [
        'program_session_id', 'mentor_id', 'role', 'status', 'assigned_at',
        'ended_at', 'capacity', 'reserved_count', 'metadata', 'created_by', 'updated_by',
    ];

    protected $attributes = ['role' => 'lead', 'status' => 'ACTIVE', 'reserved_count' => 0];

    protected $casts = [
        'assigned_at' => 'datetime',
        'ended_at' => 'datetime',
        'capacity' => 'integer',
        'reserved_count' => 'integer',
        'metadata' => 'array',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(ProgramSession::class, 'program_session_id');
    }

    public function mentor(): BelongsTo
    {
        return $this->belongsTo(Mentor::class);
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(SessionMentorReservation::class);
    }
}
