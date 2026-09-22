<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StoreOrder extends Model
{
    protected $fillable = [
        'user_id', 'order_number', 'status', 'total_points', 'total_cash',
        'payment_method', 'shipping_name', 'shipping_phone', 'shipping_address',
        'shipping_city', 'shipping_postal_code', 'tracking_number', 'notes',
    ];

    protected $casts = [
        'total_points' => 'integer',
        'total_cash' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(StoreOrderItem::class);
    }
}
