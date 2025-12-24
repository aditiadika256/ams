<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Traits\UserStamps;

class Program extends Model
{
    use HasFactory, UserStamps;

    protected $fillable = [
        'name',
        'level',
        'type',
        'price',
        'active',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'price' => 'integer',
        'active' => 'boolean',
    ];

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function orders(): BelongsToMany
    {
        return $this->belongsToMany(Order::class, 'order_items')->withPivot(['price', 'quantity']);
    }

    public function modules(): HasMany
    {
        return $this->hasMany(ProgramModule::class)->orderBy('order');
    }

    public function scopeActive($query)
    {
        return $query->where('active', true);
    }
}

