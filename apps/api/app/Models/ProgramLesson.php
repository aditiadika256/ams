<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProgramLesson extends Model
{
    use HasFactory;

    protected $fillable = [
        'module_id',
        'title',
        'slug',
        'content_type', // 'video', 'text', 'quiz', 'assignment'
        'content_url',
        'content_body',
        'duration_minutes',
        'order',
        'is_published',
        'is_preview', // Allow free preview
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'is_preview' => 'boolean',
        'duration_minutes' => 'integer',
        'order' => 'integer',
    ];

    public function module(): BelongsTo
    {
        return $this->belongsTo(ProgramModule::class, 'module_id');
    }
}
