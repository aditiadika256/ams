<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProgramCertificate extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = [
        'program_access_id', 'certificate_number', 'snapshot', 'issued_at', 'revoked_at',
    ];

    protected $casts = [
        'snapshot' => 'array',
        'issued_at' => 'datetime',
        'revoked_at' => 'datetime',
    ];

    public function programAccess(): BelongsTo
    {
        return $this->belongsTo(ProgramAccess::class);
    }
}
