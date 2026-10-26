<?php

namespace App\Models;

use App\Traits\UserStamps;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AssessmentContext extends Model
{
    use HasFactory, UserStamps;

    protected $table = 'assessment_contexts';

    protected $fillable = [
        'title',
        'body_content',
        'media_url',
        'media_type',
        'row_status',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'row_status' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relationship: Butir-butir pertanyaan yang terikat pada wacana ini.
     */
    public function questions(): HasMany
    {
        return $this->hasMany(Question::class, 'context_id');
    }

    /**
     * Relationship: Pembuat wacana.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Relationship: Pengubah wacana terakhir.
     */
    public function editor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Scope: Hanya data wacana aktif.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('row_status', 1);
    }
}
