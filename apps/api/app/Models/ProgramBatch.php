<?php

namespace App\Models;

use App\Enums\BatchMode;
use App\Enums\BatchStatus;
use App\Traits\UserStamps;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProgramBatch extends Model
{
    use HasFactory, UserStamps;

    protected $fillable = [
        'program_id', 'name', 'code', 'registration_starts_at', 'registration_ends_at',
        'starts_at', 'ends_at', 'capacity', 'enrolled_count', 'mode', 'location',
        'timezone', 'price_override', 'status', 'allow_retakes', 'metadata',
        'created_by', 'updated_by',
    ];

    protected $attributes = [
        'enrolled_count' => 0,
        'mode' => 'ONLINE',
        'timezone' => 'Asia/Makassar',
        'status' => 'DRAFT',
        'allow_retakes' => false,
    ];

    protected $casts = [
        'registration_starts_at' => 'datetime',
        'registration_ends_at' => 'datetime',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'capacity' => 'integer',
        'enrolled_count' => 'integer',
        'mode' => BatchMode::class,
        'price_override' => 'decimal:2',
        'status' => BatchStatus::class,
        'allow_retakes' => 'boolean',
        'metadata' => 'array',
    ];

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(ProgramSession::class)->orderBy('starts_at');
    }

    public function accesses(): HasMany
    {
        return $this->hasMany(ProgramAccess::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function scopeOpen(Builder $query): Builder
    {
        return $query->where('status', BatchStatus::Open->value);
    }
}
