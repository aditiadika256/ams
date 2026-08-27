<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProgramComponentSubmission extends Model
{
    use HasFactory;

    protected $fillable = [
        'program_component_content_id', 'program_access_id', 'user_id',
        'payload', 'submitted_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'submitted_at' => 'datetime',
    ];

    public function content(): BelongsTo
    {
        return $this->belongsTo(ProgramComponentContent::class, 'program_component_content_id');
    }

    public function programAccess(): BelongsTo
    {
        return $this->belongsTo(ProgramAccess::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
