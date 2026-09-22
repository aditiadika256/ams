<?php

namespace App\Models;

use App\Enums\WalletType;
use App\Traits\HasBranchScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Wallet extends Model
{
    use HasBranchScope, HasFactory;

    protected $fillable = [
        'branch_id',
        'user_id',
        'type',
        'balance',
        'pending_balance',
    ];

    protected $casts = [
        'type' => WalletType::class,
        'balance' => 'decimal:2',
        'pending_balance' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(WalletTransaction::class)->orderByDesc('id');
    }

    public function withdrawals(): HasMany
    {
        return $this->hasMany(Withdrawal::class)->orderByDesc('id');
    }
}
