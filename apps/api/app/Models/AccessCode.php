<?php

namespace App\Models;

use App\Enums\CodeType;
use App\Traits\UserStamps;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AccessCode extends Model
{
    use HasFactory, UserStamps;

    protected $fillable = [
        'code_hash', 'code_hint', 'type', 'program_id', 'program_batch_id',
        'max_redemptions', 'redemptions_count', 'starts_at', 'ends_at', 'is_active',
        'eligibility', 'metadata', 'created_by', 'updated_by',
    ];

    protected $attributes = ['redemptions_count' => 0, 'is_active' => true];

    protected $casts = [
        'type' => CodeType::class,
        'max_redemptions' => 'integer',
        'redemptions_count' => 'integer',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'is_active' => 'boolean',
        'eligibility' => 'array',
        'metadata' => 'array',
    ];

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function batch(): BelongsTo
    {
        return $this->belongsTo(ProgramBatch::class, 'program_batch_id');
    }

    public function redemptions(): HasMany
    {
        return $this->hasMany(AccessCodeRedemption::class);
    }

    public function scopeRedeemable(Builder $query): Builder
    {
        return $query->where('is_active', true)
            ->where(fn (Builder $period) => $period->whereNull('starts_at')->orWhere('starts_at', '<=', now()))
            ->where(fn (Builder $period) => $period->whereNull('ends_at')->orWhere('ends_at', '>', now()))
            ->where(fn (Builder $quota) => $quota->whereNull('max_redemptions')
                ->orWhereColumn('redemptions_count', '<', 'max_redemptions'));
    }
}
