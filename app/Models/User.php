<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'bio',
        'avatar',
        'cover_photo',
        'website',
        'location',
        'date_of_birth',
        'is_private',
        'is_verified',
        'provider',
        'provider_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'provider_id',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'date_of_birth'     => 'date',
        'is_private'        => 'boolean',
        'is_verified'       => 'boolean',
        'password'          => 'hashed',
    ];

    // ─── Relationships ───────────────────────────────────────

    public function posts()
    {
        return $this->hasMany(Post::class);
    }

    public function stories()
    {
        return $this->hasMany(Story::class);
    }

    public function likes()
    {
        return $this->hasMany(Like::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function followers()
    {
        return $this->belongsToMany(
            User::class, 'follows', 'following_id', 'follower_id'
        )
        ->withPivot('status')
        ->withTimestamps()
        ->wherePivot('status', 'accepted');
    }

    public function following()
    {
        return $this->belongsToMany(
            User::class, 'follows', 'follower_id', 'following_id'
        )
        ->withPivot('status')
        ->withTimestamps()
        ->wherePivot('status', 'accepted');
    }

    public function followRequests()
    {
        return $this->belongsToMany(
            User::class, 'follows', 'following_id', 'follower_id'
        )
        ->withPivot('status')
        ->withTimestamps()
        ->wherePivot('status', 'pending');
    }

    public function bookmarks()
    {
        return $this->belongsToMany(Post::class, 'bookmarks')->withTimestamps();
    }

    public function blocks()
    {
        return $this->belongsToMany(
            User::class, 'blocks', 'blocker_id', 'blocked_id'
        )->withTimestamps();
    }

    // ─── Helpers ─────────────────────────────────────────────

    public function isFollowing(User $user): bool
    {
        return $this->following()->where('users.id', $user->id)->exists();
    }

    public function isFollowedBy(User $user): bool
    {
        return $this->followers()->where('users.id', $user->id)->exists();
    }

    public function hasBlocked(User $user): bool
    {
        return $this->blocks()->where('blocked_id', $user->id)->exists();
    }

    public function getAvatarUrlAttribute(): string
    {
        if ($this->avatar) {
            return str_starts_with($this->avatar, 'http')
                ? $this->avatar
                : asset('storage/' . $this->avatar);
        }

        return 'https://ui-avatars.com/api/?name=' . urlencode($this->name) . '&background=random&color=fff';
    }

    public function reposts()
{
    return $this->hasMany(Repost::class);
}
}