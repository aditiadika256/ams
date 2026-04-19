<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\UserStamps;

class Post extends Model
{
    use UserStamps;

    protected $fillable = [
        'title',
        'slug',
        'content',
        'excerpt',
        'status',
        'featured_image',
        'published_at',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'published_at' => 'datetime',
    ];

    public function author()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published')
                     ->where('published_at', '<=', now());
    }
}
