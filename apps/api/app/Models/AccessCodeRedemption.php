<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AccessCodeRedemption extends Model
{
    use HasFactory;

    protected $fillable = [
        'access_code_id', 'user_id', 'program_access_id', 'idempotency_key',
        'correlation_id', 'redeemed_at', 'metadata',
    ];

    protected $casts = ['redeemed_at' => 'datetime', 'metadata' => 'array'];

    public function code(): BelongsTo
    {
        return $this->belongsTo(AccessCode::class, 'access_code_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function access(): BelongsTo
    {
        return $this->belongsTo(ProgramAccess::class, 'program_access_id');
    }
}
