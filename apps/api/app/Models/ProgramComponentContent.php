<?php

namespace App\Models;

use App\Enums\ComponentContentStatus;
use App\Traits\UserStamps;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProgramComponentContent extends Model
{
    use HasFactory, SoftDeletes, UserStamps;

    protected $fillable = [
        'program_component_id', 'media_asset_id', 'title', 'slug', 'summary',
        'body', 'external_url', 'payload', 'status', 'published_at', 'sort_order',
        'created_by', 'updated_by',
    ];

    protected $attributes = [
        'status' => 'DRAFT',
        'sort_order' => 0,
    ];

    protected $casts = [
        'payload' => 'array',
        'status' => ComponentContentStatus::class,
        'published_at' => 'datetime',
        'sort_order' => 'integer',
        'deleted_at' => 'datetime',
    ];

    public function programComponent(): BelongsTo
    {
        return $this->belongsTo(ProgramComponent::class)->withTrashed();
    }

    public function mediaAsset(): BelongsTo
    {
        return $this->belongsTo(MediaAsset::class)->withTrashed();
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(ProgramComponentSubmission::class);
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query
            ->where('status', ComponentContentStatus::Published->value)
            ->whereNotNull('published_at');
    }
}
