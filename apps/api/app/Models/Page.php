<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\UserStamps;

class Page extends Model
{
    use UserStamps;

    protected $fillable = [
        'title',
        'slug',
        'content',
        'status',
        'meta_title',
        'meta_description',
        'created_by',
        'updated_by',
    ];

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }
}
