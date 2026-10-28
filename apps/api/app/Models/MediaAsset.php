<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class MediaAsset extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'program_id', 'uploaded_by', 'created_by', 'updated_by', 'folder',
        'disk', 'object_key', 'original_name', 'mime_type', 'extension',
        'size_bytes', 'checksum_sha256',
    ];

    protected $casts = [
        'size_bytes' => 'integer',
        'deleted_at' => 'datetime',
    ];

    protected $appends = ['cdn_url'];

    public function getCdnUrlAttribute(): ?string
    {
        return app(\App\Support\Media\CloudflareMediaService::class)->getCdnUrl($this->object_key);
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function contents(): HasMany
    {
        return $this->hasMany(ProgramComponentContent::class);
    }

    public function lessons(): HasMany
    {
        return $this->hasMany(ProgramLesson::class);
    }
}
