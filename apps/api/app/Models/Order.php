<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Traits\UserStamps;

class Order extends Model
{
    use HasFactory, UserStamps;

    protected $fillable = [
        'user_id',
        'status',
        'total',
        'payment_provider',
        'payment_reference',
        'snap_token',
        'meta',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'total' => 'integer',
        'meta' => 'array',
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
        return $this->belongsToMany(Program::class, 'order_items')->withPivot(['price', 'quantity']);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }
}

