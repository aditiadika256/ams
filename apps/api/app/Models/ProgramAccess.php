<?php

namespace App\Models;

use App\Enums\AccessSource;
use App\Enums\AccessStatus;
use App\Traits\UserStamps;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProgramAccess extends Model
{
    use HasFactory, UserStamps;

    protected $fillable = [
        'user_id', 'program_id', 'program_batch_id', 'parent_program_access_id',
        'source_type', 'source_id', 'grant_key', 'status', 'starts_at', 'ends_at',
        'activated_at', 'completed_at', 'suspended_at', 'revoked_at', 'archived_at',
        'last_accessed_at', 'progress_percent', 'progress_breakdown', 'progress_calculated_at',
        'metadata', 'created_by', 'updated_by',
    ];

    protected $attributes = ['status' => 'WAITING', 'progress_percent' => '0.00'];

    protected $casts = [
        'source_type' => AccessSource::class,
        'status' => AccessStatus::class,
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'activated_at' => 'datetime',
        'completed_at' => 'datetime',
        'suspended_at' => 'datetime',
        'revoked_at' => 'datetime',
        'archived_at' => 'datetime',
        'last_accessed_at' => 'datetime',
        'progress_percent' => 'decimal:2',
        'progress_breakdown' => 'array',
        'progress_calculated_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function batch(): BelongsTo
    {
        return $this->belongsTo(ProgramBatch::class, 'program_batch_id');
    }

    public function nextSession(): BelongsTo
    {
        return $this->belongsTo(ProgramSession::class, 'next_session_id');
    }

    public function parentAccess(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_program_access_id');
    }

    public function derivedAccesses(): HasMany
    {
        return $this->hasMany(self::class, 'parent_program_access_id');
    }

    public function events(): HasMany
    {
        return $this->hasMany(AccessEvent::class)->orderBy('created_at');
    }

    public function examSessions(): HasMany
    {
        return $this->hasMany(ExamSession::class);
    }

    public function activities(): HasMany
    {
        return $this->hasMany(ProgramAccessActivity::class);
    }

    public function certificate(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(ProgramCertificate::class);
    }

    public function mentorReservations(): HasMany
    {
        return $this->hasMany(SessionMentorReservation::class);
    }

    public function componentSubmissions(): HasMany
    {
        return $this->hasMany(ProgramComponentSubmission::class);
    }

    public function scopeForUser(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', AccessStatus::Active->value)
            ->where(fn (Builder $period) => $period->whereNull('starts_at')->orWhere('starts_at', '<=', now()))
            ->where(fn (Builder $period) => $period->whereNull('ends_at')->orWhere('ends_at', '>', now()));
    }

    public function scopeNotArchived(Builder $query): Builder
    {
        return $query->whereNull('archived_at');
    }
}
