<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Traits\UserStamps;

class ExamSection extends Model
{
    use HasFactory, UserStamps;

    protected $fillable = [
        'package_id',
        'subject',
        'num_questions',
        'bank_id',
        'difficulty_mix',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'num_questions' => 'integer',
        'difficulty_mix' => 'array',
    ];

    public function package(): BelongsTo
    {
        return $this->belongsTo(ExamPackage::class, 'package_id');
    }

    public function bank(): BelongsTo
    {
        return $this->belongsTo(QuestionBank::class, 'bank_id');
    }
}
