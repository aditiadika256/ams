<?php

namespace App\Models;

use App\Traits\UserStamps;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PhysicalRoom extends Model
{
    use HasFactory, UserStamps;

    protected $fillable = [
        'branch_id',
        'room_number',
        'room_name',
        'capacity',
        'facilities',
        'is_active',
        'row_status',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'capacity' => 'integer',
        'facilities' => 'array',
        'is_active' => 'boolean',
        'row_status' => 'integer',
    ];

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function scopeActive($query)
    {
        return $query->where('row_status', 1)->where('is_active', true);
    }
}
