<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use LogicException;

class AccessEvent extends Model
{
    use HasFactory;

    public const UPDATED_AT = null;

    protected $fillable = [
        'program_access_id', 'actor_user_id', 'actor_snapshot', 'action', 'reason',
        'correlation_id', 'before_state', 'after_state', 'metadata', 'created_at',
    ];

    protected $casts = [
        'actor_snapshot' => 'array',
        'before_state' => 'array',
        'after_state' => 'array',
        'metadata' => 'array',
        'created_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::updating(fn () => throw new LogicException('Access events are immutable.'));
        static::deleting(fn () => throw new LogicException('Access events are immutable.'));
    }

    public function access(): BelongsTo
    {
        return $this->belongsTo(ProgramAccess::class, 'program_access_id');
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_user_id');
    }
}
