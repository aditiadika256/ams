<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Traits\UserStamps;

class ExamPackage extends Model
{
    use HasFactory, UserStamps;

    protected $fillable = [
        'name',
        'level',
        'duration_minutes',
        'randomize',
        'show_result_mode',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'duration_minutes' => 'integer',
        'randomize' => 'boolean',
    ];

    public function sections(): HasMany
    {
        return $this->hasMany(ExamSection::class, 'package_id');
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(ExamSession::class, 'package_id');
    }
}
