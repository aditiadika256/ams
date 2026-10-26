<?php

namespace App\Models;

use App\Traits\UserStamps;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WalletHold extends Model
{
    use HasFactory, UserStamps;

    protected $fillable = [
        'user_id',
        'wallet_id',
        'amount',
        'reason',
        'release_condition',
        'status',
        'released_at',
        'row_status',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'released_at' => 'datetime',
        'row_status' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function wallet(): BelongsTo
    {
        return $this->belongsTo(Wallet::class);
    }

    public function scopeActive($query)
    {
        return $query->where('row_status', 1);
    }
}
