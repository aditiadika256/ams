<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use LogicException;

class ProgramAccessActivity extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = [
        'program_access_id', 'component_code', 'activity_type', 'activity_key',
        'source_type', 'source_id', 'metadata', 'completed_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'completed_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::updating(fn () => throw new LogicException('Program access activities are append-only.'));
        static::deleting(fn () => throw new LogicException('Program access activities are append-only.'));
    }

    public function programAccess(): BelongsTo
    {
        return $this->belongsTo(ProgramAccess::class);
    }
}
