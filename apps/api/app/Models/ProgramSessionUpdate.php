<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProgramSessionUpdate extends Model
{
    protected $fillable = [
        'recipient_user_id', 'program_access_id', 'mentor_id', 'program_session_id',
        'recipient_key', 'type', 'correlation_id', 'payload', 'occurred_at', 'acknowledged_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'occurred_at' => 'datetime',
        'acknowledged_at' => 'datetime',
    ];

    public function recipient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recipient_user_id');
    }

    public function access(): BelongsTo
    {
        return $this->belongsTo(ProgramAccess::class, 'program_access_id');
    }

    public function mentor(): BelongsTo
    {
        return $this->belongsTo(Mentor::class);
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(ProgramSession::class, 'program_session_id');
    }
}
