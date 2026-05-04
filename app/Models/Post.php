<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Post extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'caption',
        'type',
        'location',
        'is_archived',
        'disable_comments',
    ];

    protected $casts = [
        'is_archived'      => 'boolean',
        'disable_comments' => 'boolean',
    ];

    // ─── Relationships ───────────────────────────────────────

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function media()
    {
        return $this->hasMany(PostMedia::class)->orderBy('order');
    }

    public function likes()
    {
        return $this->hasMany(Like::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class)->whereNull('parent_id');
    }

    public function hashtags()
    {
        return $this->belongsToMany(Hashtag::class, 'hashtag_post');
    }

    public function bookmarkedBy()
    {
        return $this->belongsToMany(User::class, 'bookmarks');
    }

    // ─── Helpers ─────────────────────────────────────────────

    public function isLikedBy(User $user): bool
    {
        return $this->likes()->where('user_id', $user->id)->exists();
    }

    public function isBookmarkedBy(User $user): bool
    {
        return $this->bookmarkedBy()->where('users.id', $user->id)->exists();
    }
}