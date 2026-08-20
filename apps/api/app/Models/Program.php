<?php

namespace App\Models;

use App\Enums\ProgramStatus;
use App\Enums\ProgramVisibility;
use App\Traits\UserStamps;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Program extends Model
{
    use HasFactory, UserStamps;

    protected $fillable = [
        'name', 'slug', 'short_description', 'description', 'thumbnail_url',
        'cover_url', 'base_price', 'currency', 'visibility', 'status',
        'completion_rule', 'published_at', 'archived_at', 'created_by', 'updated_by',
    ];

    protected $attributes = [
        'base_price' => '0.00',
        'currency' => 'IDR',
        'visibility' => 'PUBLIC',
        'status' => 'DRAFT',
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'visibility' => ProgramVisibility::class,
        'status' => ProgramStatus::class,
        'completion_rule' => 'array',
        'published_at' => 'datetime',
        'archived_at' => 'datetime',
    ];

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function orders(): BelongsToMany
    {
        return $this->belongsToMany(Order::class, 'order_items')
            ->withPivot(['program_batch_id', 'unit_price', 'currency', 'quantity'])
            ->withTimestamps();
    }

    public function modules(): HasMany
    {
        return $this->hasMany(ProgramModule::class)->orderBy('order');
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class)->withTimestamps();
    }

    public function components(): HasMany
    {
        return $this->hasMany(ProgramComponent::class)->orderBy('sort_order');
    }

    public function componentDefinitions(): BelongsToMany
    {
        return $this->belongsToMany(ComponentDefinition::class, 'program_components')
            ->withPivot(['is_enabled', 'label', 'sort_order', 'configuration'])
            ->withTimestamps();
    }

    public function outgoingRelations(): HasMany
    {
        return $this->hasMany(ProgramRelation::class, 'parent_program_id')->orderBy('sort_order');
    }

    public function incomingRelations(): HasMany
    {
        return $this->hasMany(ProgramRelation::class, 'child_program_id');
    }

    public function children(): BelongsToMany
    {
        return $this->belongsToMany(self::class, 'program_relations', 'parent_program_id', 'child_program_id')
            ->withPivot(['sort_order', 'is_required', 'metadata'])
            ->withTimestamps();
    }

    public function parents(): BelongsToMany
    {
        return $this->belongsToMany(self::class, 'program_relations', 'child_program_id', 'parent_program_id')
            ->withPivot(['sort_order', 'is_required', 'metadata'])
            ->withTimestamps();
    }

    public function batches(): HasMany
    {
        return $this->hasMany(ProgramBatch::class);
    }

    public function accesses(): HasMany
    {
        return $this->hasMany(ProgramAccess::class);
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', ProgramStatus::Published->value);
    }

    public function scopeVisibleInCatalog(Builder $query): Builder
    {
        return $query->published()
            ->where('visibility', ProgramVisibility::Public->value)
            ->whereNull('archived_at');
    }

    public function scopeStatus(Builder $query, ProgramStatus|string $status): Builder
    {
        return $query->where('status', $status instanceof ProgramStatus ? $status->value : $status);
    }
}
