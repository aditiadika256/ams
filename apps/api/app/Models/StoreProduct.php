<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class StoreProduct extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name', 'slug', 'description', 'image_url',
        'price_points', 'price_cash', 'stock', 'is_active',
        'category', 'metadata',
    ];

    protected $casts = [
        'price_points' => 'integer',
        'price_cash' => 'decimal:2',
        'stock' => 'integer',
        'is_active' => 'boolean',
        'metadata' => 'array',
    ];

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}
