<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SessionAttendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'program_session_id',
        'program_access_id',
        'user_id',
        'status',
        'attended_at',
        'notes',
        'recorded_by',
    ];

    protected $casts = [
        'attended_at' => 'datetime',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(ProgramSession::class, 'program_session_id');
    }

    public function programAccess(): BelongsTo
    {
        return $this->belongsTo(ProgramAccess::class, 'program_access_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function recorder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
