<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Traits\UserStamps;

class QuestionBank extends Model
{
    use HasFactory, UserStamps;

    protected $fillable = [
        'name',
        'level',
        'subject',
        'classes',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'classes' => 'array',
    ];

    public function questions(): HasMany
    {
        return $this->hasMany(Question::class, 'bank_id');
    }
}
