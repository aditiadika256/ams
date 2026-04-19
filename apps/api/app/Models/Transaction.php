<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'finance_transactions';

    protected $fillable = [
        'reference_number',
        'type',
        'category',
        'amount',
        'description',
        'transaction_date',
        'status',
        'payment_method',
        'attachment_url',
        'user_id',
        'related_id',
        'related_type'
    ];

    protected $casts = [
        'transaction_date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
