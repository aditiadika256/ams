<?php

namespace App\Models;

use App\Traits\UserStamps;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Program extends Model
{
    use HasFactory, UserStamps;

    protected $fillable = [
        'name',
        'program_level_id',
        'program_type_id',
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

    public function programLevel(): BelongsTo
    {
        return $this->belongsTo(ProgramLevel::class);
    }

    public function programType(): BelongsTo
    {
        return $this->belongsTo(ProgramType::class);
    }

    public function scopeActive($query)
    {
        return $query->where('active', true);
    }
}
