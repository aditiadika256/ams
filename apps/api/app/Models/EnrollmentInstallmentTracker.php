<?php

namespace App\Models;

use App\Traits\UserStamps;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EnrollmentInstallmentTracker extends Model
{
    use HasFactory, UserStamps;

    protected $fillable = [
        'program_access_id',
        'program_installment_id',
        'status',
        'due_date',
        'paid_at',
        'amount_paid',
        'bypassed_by',
        'bypass_reason',
        'row_status',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'due_date' => 'datetime',
        'paid_at' => 'datetime',
        'amount_paid' => 'decimal:2',
        'row_status' => 'integer',
    ];

    public function programAccess(): BelongsTo
    {
        return $this->belongsTo(ProgramAccess::class, 'program_access_id');
    }

    public function installment(): BelongsTo
    {
        return $this->belongsTo(ProgramInstallment::class, 'program_installment_id');
    }

    public function bypassUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'bypassed_by');
    }

    public function scopeActive($query)
    {
        return $query->where('row_status', 1);
    }
}
