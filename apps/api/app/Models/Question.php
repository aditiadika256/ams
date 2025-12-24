<?php

namespace App\Models;

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
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'options' => 'array',
        'answer_key' => 'array',
    ];

    public function bank(): BelongsTo
    {
        return $this->belongsTo(QuestionBank::class, 'bank_id');
    }
}
