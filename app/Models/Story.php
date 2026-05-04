<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Story extends Model
{
    protected $fillable = [
        'user_id',
        'media_url',
        'type',
        'text_overlay',
        'text_style',
        'expires_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'text_style' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function viewers()
    {
        return $this->belongsToMany(User::class, 'story_views')
                    ->withPivot('viewed_at');
    }

    public function scopeActive($query)
    {
        return $query->where('expires_at', '>', now());
    }

    public function getMediaUrlAttribute($value): string
    {
        return str_starts_with($value, 'http')
            ? $value
            : asset('storage/' . $value);
    }
}