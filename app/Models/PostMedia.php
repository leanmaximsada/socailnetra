<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PostMedia extends Model
{
    protected $table = 'post_media';

    protected $fillable = [
        'post_id',
        'url',
        'thumbnail_url',
        'type',
        'width',
        'height',
        'duration',
        'order',
    ];

    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    public function getUrlAttribute($value): string
    {
        return str_starts_with($value, 'http')
            ? $value
            : asset('storage/' . $value);
    }

    public function getThumbnailUrlAttribute($value): ?string
    {
        if (!$value) return null;
        return str_starts_with($value, 'http')
            ? $value
            : asset('storage/' . $value);
    }
}