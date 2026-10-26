<?php

namespace App\Models;

use App\Traits\UserStamps;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExamSessionToken extends Model
{
    use HasFactory, UserStamps;

    protected $fillable = [
        'session_id',
        'package_id',
        'token_code',
        'is_active',
        'expires_at',
        'row_status',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'expires_at' => 'datetime',
        'row_status' => 'integer',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(ExamSession::class, 'session_id');
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(ExamPackage::class, 'package_id');
    }

    public function scopeActive($query)
    {
        return $query->where('row_status', 1)
                     ->where('is_active', true)
                     ->where('expires_at', '>', now());
    }
}
