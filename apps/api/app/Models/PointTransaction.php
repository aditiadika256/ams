<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PointTransaction extends Model
{
    protected $fillable = [
        'point_wallet_id', 'type', 'amount', 'balance_after',
        'source_type', 'source_id', 'description', 'expires_at',
    ];

    protected $casts = [
        'amount' => 'integer',
        'balance_after' => 'integer',
        'expires_at' => 'datetime',
    ];

    public function pointWallet(): BelongsTo
    {
        return $this->belongsTo(PointWallet::class);
    }
}
