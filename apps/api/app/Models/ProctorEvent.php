<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Traits\UserStamps;

class ProctorEvent extends Model
{
    use HasFactory, UserStamps;

    protected $fillable = [
        'attempt_id',
        'type',
        'meta',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'meta' => 'array',
    ];

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(ExamAttempt::class, 'attempt_id');
    }
}
