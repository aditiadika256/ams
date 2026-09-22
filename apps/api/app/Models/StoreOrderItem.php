<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StoreOrderItem extends Model
{
    protected $fillable = [
        'store_order_id', 'store_product_id', 'product_name',
        'quantity', 'points_each', 'cash_each',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'points_each' => 'integer',
        'cash_each' => 'decimal:2',
    ];

    public function storeOrder(): BelongsTo
    {
        return $this->belongsTo(StoreOrder::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(StoreProduct::class, 'store_product_id');
    }
}
