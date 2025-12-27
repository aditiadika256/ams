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
    ];

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }
}
