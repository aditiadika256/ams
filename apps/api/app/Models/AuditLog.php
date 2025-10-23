<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    protected $fillable = ['user_id','action','entity','entity_id','payload'];
    protected $casts = ['payload' => 'array'];
}
