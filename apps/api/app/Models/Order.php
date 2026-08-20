<?php

namespace App\Models;

use App\Traits\UserStamps;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory, UserStamps;

    protected $fillable = [
        'user_id',
        'status',
        'total',
        'currency',
        'payment_provider',
        'payment_reference',
        'snap_token',
        'meta',
        'paid_at',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'total' => 'decimal:2',
        'meta' => 'array',
        'paid_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function programs(): BelongsToMany
    {
        return $this->belongsToMany(Program::class, 'order_items')
            ->withPivot(['program_batch_id', 'unit_price', 'currency', 'quantity'])
            ->withTimestamps();
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }
}
