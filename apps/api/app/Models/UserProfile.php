<?php

namespace App\Models;

use App\Traits\UserStamps;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserProfile extends Model
{
    use HasFactory, UserStamps;

    protected $table = 'user_profiles';

    protected $fillable = [
        'user_id',
        'phone',
        'birth_place',
        'birth_date',
        'parent_name',
        'parent_phone',
        'school_name',
        'school_level',
        'school_major',
        'address',
        'city',
        'province',
        'postal_code',
        'maps_url',
        'latitude',
        'longitude',
        'house_photo_url',
        'row_status',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'row_status' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
