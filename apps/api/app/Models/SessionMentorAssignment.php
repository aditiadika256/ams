<?php

namespace App\Models;

use App\Traits\UserStamps;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SessionMentorAssignment extends Model
{
    use HasFactory, UserStamps;

    protected $fillable = [
        'program_session_id', 'mentor_id', 'role', 'status', 'assigned_at',
        'ended_at', 'metadata', 'created_by', 'updated_by',
    ];

    protected $attributes = ['role' => 'lead', 'status' => 'ACTIVE'];

    protected $casts = [
        'assigned_at' => 'datetime',
        'ended_at' => 'datetime',
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
}
