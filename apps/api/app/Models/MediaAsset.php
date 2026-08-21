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
        'program_id', 'uploaded_by', 'disk', 'object_key', 'original_name',
        'mime_type', 'extension', 'size_bytes', 'checksum_sha256',
    ];

    protected $casts = [
        'size_bytes' => 'integer',
        'deleted_at' => 'datetime',
    ];

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
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
