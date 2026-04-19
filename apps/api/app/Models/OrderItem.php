<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Traits\UserStamps;

class OrderItem extends Model
{
    use HasFactory, UserStamps;

    protected $fillable = [
        'order_id',
        'program_id',
        'price',
        'quantity',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'price' => 'integer',
        'quantity' => 'integer',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }
}

