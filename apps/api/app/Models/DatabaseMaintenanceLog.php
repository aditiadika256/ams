<?php

namespace App\Models;

use App\Traits\UserStamps;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DatabaseMaintenanceLog extends Model
{
    use HasFactory, UserStamps;

    protected $fillable = [
        'action',
        'execution_time_ms',
        'status',
        'output_details',
        'triggered_by',
        'row_status',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'execution_time_ms' => 'integer',
        'output_details' => 'array',
        'row_status' => 'integer',
    ];

    public function triggeredUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'triggered_by');
    }

    public function scopeActive($query)
    {
        return $query->where('row_status', 1);
    }
}
