<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\UserStamps;

class AuditLog extends Model
{
    use UserStamps;
    protected $fillable = ['user_id','action','entity','entity_id','payload','created_by','updated_by'];
    protected $casts = ['payload' => 'array'];
}
