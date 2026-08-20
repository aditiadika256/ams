<?php

namespace App\Models;

use App\Enums\SessionMode;
use App\Enums\SessionStatus;
use App\Traits\UserStamps;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProgramSession extends Model
{
    use HasFactory, UserStamps;

    protected $fillable = [
        'program_batch_id', 'title', 'description', 'starts_at', 'ends_at',
        'timezone', 'mode', 'location', 'meeting_url', 'capacity', 'reserved_count',
        'status', 'metadata', 'created_by', 'updated_by',
    ];

    protected $attributes = [
        'timezone' => 'Asia/Makassar',
        'mode' => 'ONLINE',
        'reserved_count' => 0,
        'status' => 'DRAFT',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'mode' => SessionMode::class,
        'capacity' => 'integer',
        'reserved_count' => 'integer',
        'status' => SessionStatus::class,
        'metadata' => 'array',
    ];

    public function batch(): BelongsTo
    {
        return $this->belongsTo(ProgramBatch::class, 'program_batch_id');
    }

    public function mentorAssignments(): HasMany
    {
        return $this->hasMany(SessionMentorAssignment::class)->orderBy('assigned_at');
    }

    public function scopeUpcoming(Builder $query): Builder
    {
        return $query->whereIn('status', [
            SessionStatus::Scheduled->value,
            SessionStatus::Ongoing->value,
        ])->where('ends_at', '>=', now());
    }
}
