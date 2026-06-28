<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FeedController extends Controller
{
public function index(Request $request): JsonResponse
{
    $user = $request->user();

    $followingIds   = $user->following()->pluck('users.id')->toArray();
    $followingIds[] = $user->id;

    $posts = Post::whereIn('user_id', $followingIds)
        ->where('is_archived', false)
        ->where('type', '!=', 'reel')
        ->with([
            'user:id,name,username,avatar,is_verified',
            'media',
        ])
        ->withCount(['likes', 'comments'])
        ->orderByDesc('created_at')
        ->paginate(15);

    // Add is_liked and is_bookmarked for each post
$posts->getCollection()->transform(function ($post) use ($user) {
    $post->is_liked      = $post->likes()->where('user_id', $user->id)->exists();
    $post->is_bookmarked = $post->bookmarkedBy()->where('users.id', $user->id)->exists();
    $post->is_reposted   = $post->repostedBy()->where('users.id', $user->id)->exists();
    $post->reposts_count = $post->reposts()->count();
    return $post;
});

    return response()->json($posts);
}

    public function reels(Request $request): JsonResponse
    {
        $user = $request->user();

        $followingIds   = $user->following()->pluck('users.id')->toArray();
        $followingIds[] = $user->id;

        $reels = Post::whereIn('user_id', $followingIds)
            ->where('type', 'reel')
            ->where('is_archived', false)
            ->with([
                'user:id,name,username,avatar,is_verified',
                'media',
            ])
            ->withCount(['likes', 'comments', 'reposts'])
            ->orderByDesc('created_at')
            ->paginate(10);

        return response()->json($reels);
    }
}
