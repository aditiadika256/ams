<?php

namespace App\Models;

use App\Traits\UserStamps;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProgramInstallment extends Model
{
    use HasFactory, UserStamps;

    protected $fillable = [
        'program_id',
        'term_number',
        'title',
        'amount',
        'due_days_offset',
        'milestone_section_id',
        'row_status',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'term_number' => 'integer',
        'amount' => 'decimal:2',
        'due_days_offset' => 'integer',
        'row_status' => 'integer',
    ];

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function trackers(): HasMany
    {
        return $this->hasMany(EnrollmentInstallmentTracker::class, 'program_installment_id');
    }

    public function scopeActive($query)
    {
        return $query->where('row_status', 1);
    }
}
