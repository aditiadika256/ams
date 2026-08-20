<?php

namespace App\Models;

use App\Traits\UserStamps;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    use UserStamps;

    protected $fillable = [
        'user_id',
        'actor_snapshot',
        'action',
        'entity',
        'entity_id',
        'correlation_id',
        'reason',
        'before_state',
        'after_state',
        'payload',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'actor_snapshot' => 'array',
        'before_state' => 'array',
        'after_state' => 'array',
        'payload' => 'array',
    ];

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
