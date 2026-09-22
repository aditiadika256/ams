<?php

namespace App\Models;

use App\Enums\QuestionType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Traits\UserStamps;

class Question extends Model
{
    use HasFactory, UserStamps;

    protected $fillable = [
        'bank_id',
        'type',
        'stem',
        'options',
        'answer_key',
        'difficulty',
        'score_weight',
        'explanation',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'type' => QuestionType::class,
        'options' => 'array',
        'answer_key' => 'array',
        'score_weight' => 'decimal:2',
    ];

    public function bank(): BelongsTo
    {
        return $this->belongsTo(QuestionBank::class, 'bank_id');
    }
}
