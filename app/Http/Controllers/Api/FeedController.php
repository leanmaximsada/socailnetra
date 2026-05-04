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
            ->withCount(['likes', 'comments'])
            ->orderByDesc('created_at')
            ->paginate(10);

        return response()->json($reels);
    }
}
